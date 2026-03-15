const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const moment = require('moment');
const { generateNumberedId } = require('../utils/generateId');
const { billingCycleToMonths } = require('../utils/billingCycle.util');
const { parseLocalDate } = require('../utils/date.util');

/**
 * Job tạo hóa đơn định kỳ cho các hợp đồng đến hạn.
 * Nên gọi hàm này thông qua cron job chạy hàng ngày vào ban đêm.
 */
const generatePeriodicInvoices = async () => {
    const { Contract, Invoice, InvoiceItem, Request, Room } = sequelize.models;

    const today = moment().format('YYYY-MM-DD');

    const dueContracts = await Contract.findAll({
        where: {
            status: 'ACTIVE',
            next_billing_date: {
                [Op.lte]: today
            }
        },
        include: [{ model: Room, as: 'room' }]
    });

    console.log(`[InvoiceJob] Tìm thấy ${dueContracts.length} hợp đồng đến hạn thu tiền.`);
    let generatedCount = 0;

    for (const contract of dueContracts) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Xác định kỳ thu tiền
            const billingPeriodStart = contract.next_billing_date;

            const monthsToAdd = billingCycleToMonths(contract.billing_cycle);
            if (monthsToAdd == null) {
                // ALL_IN contracts do not generate periodic rent invoices.
                await transaction.rollback();
                continue;
            }

            const billingPeriodEnd = moment(billingPeriodStart).add(monthsToAdd, 'months').subtract(1, 'days').format('YYYY-MM-DD');
            const nextBillingDate = moment(billingPeriodStart).add(monthsToAdd, 'months').format('YYYY-MM-DD');

            // 2. Tính tiền phòng
            const roomRent = Number(contract.base_rent) * monthsToAdd;

            // 3. Tính phí dịch vụ (request hoàn thành trong kỳ trước)
            const lastBilledDate = contract.last_billed_date || contract.start_date;
            const completedRequests = await Request.findAll({
                where: {
                    room_id: contract.room_id,
                    status: 'COMPLETED',
                    updated_at: {
                        [Op.gte]: parseLocalDate(lastBilledDate),
                        [Op.lt]: parseLocalDate(billingPeriodStart)
                    }
                },
                transaction
            });

            const requestFees = completedRequests.reduce((sum, req) => sum + Number(req.price || 0), 0);

            const penaltyFees = 0;
            const totalAmount = roomRent + requestFees + penaltyFees;

            // 4. Tạo Invoice
            const dueDate = moment(billingPeriodStart).add(5, 'days').format('YYYY-MM-DD');

            const newInvoice = await Invoice.create({
                invoice_number: generateNumberedId('INV'),
                contract_id: contract.id,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                room_rent: roomRent,
                request_fees: requestFees,
                penalty_fees: penaltyFees,
                total_amount: totalAmount,
                status: 'UNPAID',
                due_date: dueDate
            }, { transaction });

            // 5. Tạo InvoiceItems
            await InvoiceItem.create({
                invoice_id: newInvoice.id,
                item_type: 'RENT',
                description: `Tiền thuê phòng từ ${billingPeriodStart} đến ${billingPeriodEnd}`,
                quantity: 1,
                unit_price: roomRent,
                amount: roomRent
            }, { transaction });

            for (const req of completedRequests) {
                if (Number(req.price) > 0) {
                    await InvoiceItem.create({
                        invoice_id: newInvoice.id,
                        reference_type: 'REQUEST',
                        reference_id: req.id,
                        item_type: 'REQUEST',
                        description: `Phí dịch vụ: ${req.title}`,
                        quantity: 1,
                        unit_price: Number(req.price),
                        amount: Number(req.price)
                    }, { transaction });
                }
            }

            // 6. Cập nhật ngày thu tiền tới
            await contract.update({
                next_billing_date: nextBillingDate,
                last_billed_date: billingPeriodStart
            }, { transaction });

            await transaction.commit();

            // 7. Gửi thông báo (ngoài transaction để không block)
            try {
                const { notificationService } = require('./notification.service');
                if (notificationService) {
                    await notificationService.createNotification({
                        type: 'INVOICE',
                        title: 'Hóa đơn định kỳ mới',
                        content: `Bạn có một hóa đơn mới (${newInvoice.invoice_number}) cho kỳ từ ${billingPeriodStart} đến ${billingPeriodEnd}. Vui lòng thanh toán trước ngày ${newInvoice.due_date}.`,
                        target_type: 'USER',
                        target_id: contract.customer_id,
                        reference_type: 'INVOICE',
                        reference_id: newInvoice.id,
                        created_by: 'SYSTEM',
                        specific_user_ids: [contract.customer_id]
                    });
                }
            } catch (notifyErr) {
                console.error(`[InvoiceJob] Lỗi gửi thông báo cho hóa đơn ${newInvoice.id}:`, notifyErr);
            }

            generatedCount++;
            console.log(`[InvoiceJob] Tạo hóa đơn ${newInvoice.invoice_number} cho hợp đồng ${contract.contract_number}`);
        } catch (err) {
            await transaction.rollback();
            console.error(`[InvoiceJob] Lỗi tạo hóa đơn cho hợp đồng ${contract.id}:`, err.message);
        }
    }

    return generatedCount;
};

const getMyInvoices = async (userId) => {
    const { Invoice, Contract, Room, Building } = sequelize.models;

    return await Invoice.findAll({
        include: [
            {
                model: Contract,
                as: 'contract',
                where: { customer_id: userId },
                include: [
                    {
                        model: Room,
                        as: 'room',
                        include: [{ model: Building, as: 'building' }]
                    }
                ]
            }
        ],
        order: [['created_at', 'DESC']]
    });
};

const getInvoiceById = async (userId, invoiceId) => {
    const { Invoice, Contract, InvoiceItem, Room } = sequelize.models;

    const invoice = await Invoice.findOne({
        where: { id: invoiceId },
        include: [
            {
                model: Contract,
                as: 'contract',
                where: { customer_id: userId },
                include: [{ model: Room, as: 'room' }]
            },
            {
                model: InvoiceItem,
                as: 'items'
            }
        ]
    });

    if (!invoice) {
        throw { status: 404, message: 'Không tìm thấy hóa đơn' };
    }
    return invoice;
};


module.exports = {
    generatePeriodicInvoices,
    getMyInvoices,
    getInvoiceById
};
