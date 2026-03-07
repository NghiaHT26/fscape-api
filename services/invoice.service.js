const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Job tạo hóa đơn định kỳ cho các hợp đồng đến hạn.
 * Nên gọi hàm này thông qua cron job chạy hàng ngày vào ban đêm.
 */
const generatePeriodicInvoices = async () => {
    const { Contract, Invoice, InvoiceItem, Request, Room } = sequelize.models;
    const transaction = await sequelize.transaction();

    try {
        const today = moment().format('YYYY-MM-DD');

        // Lấy tất cả các hợp đồng ACTIVE và đến lịch thu tiền
        const dueContracts = await Contract.findAll({
            where: {
                status: 'ACTIVE',
                next_billing_date: {
                    [Op.lte]: today
                }
            },
            include: [{ model: Room, as: 'room' }],
            transaction
        });

        console.log(`[Invoice Job] Tìm thấy ${dueContracts.length} hợp đồng đến hạn thu tiền.`);
        let generatedCount = 0;

        for (const contract of dueContracts) {
            // 1. Xác định kỳ thu tiền
            const billingPeriodStart = contract.next_billing_date;

            // Tính chu kỳ theo block
            let monthsToAdd = 1;
            if (contract.billing_cycle === 'SEMI_ANNUALLY') monthsToAdd = 6;
            else if (contract.billing_cycle === 'QUARTERLY') monthsToAdd = 3;

            const billingPeriodEnd = moment(billingPeriodStart).add(monthsToAdd, 'months').subtract(1, 'days').format('YYYY-MM-DD');
            const nextBillingDate = moment(billingPeriodStart).add(monthsToAdd, 'months').format('YYYY-MM-DD');

            // 2. Tính tiền phòng
            // Cần tính theo block nếu billing cycle dài hơn 1 tháng
            const roomRent = Number(contract.base_rent) * monthsToAdd;

            // 3. Tính phí dịch vụ (tìm các request hoàn thành trong kỳ trước)
            // Lấy từ lần bill trước hoặc từ ngày bắt đầu nếu là lần đầu.
            const lastBilledDate = contract.last_billed_date || contract.start_date;
            const completedRequests = await Request.findAll({
                where: {
                    room_id: contract.room_id,
                    status: 'COMPLETED',
                    updated_at: {
                        [Op.gte]: new Date(lastBilledDate),
                        [Op.lt]: new Date(billingPeriodStart)
                    }
                },
                transaction
            });

            const requestFees = completedRequests.reduce((sum, req) => sum + Number(req.price || 0), 0);

            // Tổng tiền
            const penaltyFees = 0;
            const discountAmount = 0;
            const refundAmount = 0;
            const totalAmount = roomRent + requestFees + penaltyFees - discountAmount - refundAmount;

            // Nếu nhỏ hơn hoặc = 0, thì skip? (Tuỳ policy, tạm thời cứ tạo hoá đơn nếu có cycle)

            // 4. Tạo Invoice
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const dueDate = moment(billingPeriodStart).add(5, 'days').format('YYYY-MM-DD'); // policy: hạn 5 ngày

            const newInvoice = await Invoice.create({
                invoice_number: invoiceNumber,
                contract_id: contract.id,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                room_rent: roomRent,
                request_fees: requestFees,
                penalty_fees: penaltyFees,
                discount_amount: discountAmount,
                refund_amount: refundAmount,
                total_amount: totalAmount,
                status: 'UNPAID',
                due_date: dueDate
            }, { transaction });

            // 5. Tạo InvoiceItems (Chi tiết hóa đơn)
            // -> Item tiền phòng
            await InvoiceItem.create({
                invoice_id: newInvoice.id,
                item_type: 'RENT',
                description: `Tiền thuê phòng từ ${billingPeriodStart} đến ${billingPeriodEnd}`,
                quantity: 1,
                unit_price: roomRent,
                amount: roomRent
            }, { transaction });

            // -> Lấy item service/requests
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

            // 6. Cập nhật ngày thu tiền tới của Hợp đồng
            await contract.update({
                next_billing_date: nextBillingDate,
                last_billed_date: billingPeriodStart
            }, { transaction });

            // 7. Gửi thông báo cho khách hàng
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
                console.error(`[Invoice Job] Lỗi gửi thông báo cho hóa đơn ${newInvoice.id}:`, notifyErr);
                // Không throw error để job tiếp tục chạy cho các hợp đồng khác
            }

            generatedCount++;
        }

        await transaction.commit();
        return generatedCount;
    } catch (error) {
        await transaction.rollback();
        console.error("Lỗi khi sinh hóa đơn tự động:", error);
        throw error;
    }
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
                as: 'items' // Cần config trong mock (nếu chưa có relation, check model sau)
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
