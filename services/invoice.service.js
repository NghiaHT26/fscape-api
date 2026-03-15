const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const moment = require('moment');
const { generateNumberedId } = require('../utils/generateId');
const { billingCycleToMonths } = require('../utils/billingCycle.util');
const { createNotification } = require('./notification.service');

// ── RENT invoice generation (billing_cycle: 1M/3M/6M) ──────────

const generateRentInvoices = async () => {
    const { Contract, Invoice, InvoiceItem, Room } = sequelize.models;

    const today = moment().format('YYYY-MM-DD');

    const dueContracts = await Contract.findAll({
        where: {
            status: 'ACTIVE',
            next_billing_date: { [Op.lte]: today }
        },
        include: [{ model: Room, as: 'room' }]
    });

    console.log(`[RentInvoiceJob] Tìm thấy ${dueContracts.length} hợp đồng đến hạn thu tiền phòng.`);
    let generatedCount = 0;

    for (const contract of dueContracts) {
        const transaction = await sequelize.transaction();
        try {
            const billingPeriodStart = contract.next_billing_date;

            const monthsToAdd = billingCycleToMonths(contract.billing_cycle);
            if (monthsToAdd == null) {
                // ALL_IN contracts do not generate periodic rent invoices.
                await transaction.rollback();
                continue;
            }

            const billingPeriodEnd = moment(billingPeriodStart).add(monthsToAdd, 'months').subtract(1, 'days').format('YYYY-MM-DD');
            const nextBillingDate = moment(billingPeriodStart).add(monthsToAdd, 'months').format('YYYY-MM-DD');

            const roomRent = Number(contract.base_rent) * monthsToAdd;

            const dueDate = moment(billingPeriodStart).add(5, 'days').format('YYYY-MM-DD');

            const newInvoice = await Invoice.create({
                invoice_number: generateNumberedId('INV'),
                invoice_type: 'RENT',
                contract_id: contract.id,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                room_rent: roomRent,
                request_fees: 0,
                penalty_fees: 0,
                total_amount: roomRent,
                status: 'UNPAID',
                due_date: dueDate
            }, { transaction });

            await InvoiceItem.create({
                invoice_id: newInvoice.id,
                item_type: 'RENT',
                description: `Tiền thuê phòng từ ${billingPeriodStart} đến ${billingPeriodEnd}`,
                quantity: 1,
                unit_price: roomRent,
                amount: roomRent
            }, { transaction });

            await contract.update({
                next_billing_date: nextBillingDate,
                last_billed_date: billingPeriodStart
            }, { transaction });

            await transaction.commit();

            // Notification (outside transaction)
            try {
                await createNotification({
                    type: 'INVOICE',
                    title: 'Hóa đơn tiền phòng mới',
                    content: `Bạn có hóa đơn tiền phòng mới (${newInvoice.invoice_number}) kỳ ${billingPeriodStart} đến ${billingPeriodEnd}. Vui lòng thanh toán trước ${dueDate}.`,
                    target_type: 'INVOICE',
                    target_id: newInvoice.id,
                    specific_user_ids: [contract.customer_id]
                });
            } catch (notifyErr) {
                console.error(`[RentInvoiceJob] Notification failed for ${newInvoice.invoice_number}:`, notifyErr.message);
            }

            generatedCount++;
            console.log(`[RentInvoiceJob] ${newInvoice.invoice_number} cho ${contract.contract_number}`);
        } catch (err) {
            await transaction.rollback();
            console.error(`[RentInvoiceJob] Lỗi hợp đồng ${contract.id}:`, err.message);
        }
    }

    return generatedCount;
};

// ── SERVICE invoice generation (monthly, every 30 days) ─────────

const generateServiceInvoices = async () => {
    const { Contract, Invoice, InvoiceItem, Request, Room } = sequelize.models;

    const now = new Date();

    const dueContracts = await Contract.findAll({
        where: {
            status: 'ACTIVE',
            next_service_billing_at: { [Op.lte]: now }
        },
        include: [{ model: Room, as: 'room' }]
    });

    console.log(`[ServiceInvoiceJob] Tìm thấy ${dueContracts.length} hợp đồng đến hạn thu phí dịch vụ.`);
    let generatedCount = 0;

    for (const contract of dueContracts) {
        const transaction = await sequelize.transaction();
        try {
            // Find unbilled completed requests
            const completedRequests = await Request.findAll({
                where: {
                    room_id: contract.room_id,
                    status: { [Op.in]: ['COMPLETED', 'DONE'] },
                    service_billing_status: 'UNBILLED',
                    request_price: { [Op.gt]: 0 }
                },
                transaction
            });

            // Advance next_service_billing_at regardless of whether there are requests
            const nextServiceBillingAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            await contract.update({ next_service_billing_at: nextServiceBillingAt }, { transaction });

            // Skip invoice creation if no unbilled requests
            if (completedRequests.length === 0) {
                await transaction.commit();
                continue;
            }

            const requestFees = completedRequests.reduce(
                (sum, req) => sum + Number(req.request_price || 0), 0
            );

            const billingPeriodEnd = moment(now).format('YYYY-MM-DD');
            const billingPeriodStart = moment(now).subtract(30, 'days').format('YYYY-MM-DD');
            const dueDate = moment(now).add(5, 'days').format('YYYY-MM-DD');

            const newInvoice = await Invoice.create({
                invoice_number: generateNumberedId('INV-SVC'),
                invoice_type: 'SERVICE',
                contract_id: contract.id,
                billing_period_start: billingPeriodStart,
                billing_period_end: billingPeriodEnd,
                room_rent: 0,
                request_fees: requestFees,
                penalty_fees: 0,
                total_amount: requestFees,
                status: 'UNPAID',
                due_date: dueDate
            }, { transaction });

            for (const req of completedRequests) {
                await InvoiceItem.create({
                    invoice_id: newInvoice.id,
                    reference_type: 'REQUEST',
                    reference_id: req.id,
                    item_type: 'REQUEST',
                    description: `Phí dịch vụ: ${req.title}`,
                    quantity: 1,
                    unit_price: Number(req.request_price),
                    amount: Number(req.request_price)
                }, { transaction });
            }

            // Mark requests as INVOICED
            const requestIds = completedRequests.map(r => r.id);
            await Request.update(
                {
                    service_billing_status: 'INVOICED',
                    service_billed_at: new Date(),
                    service_billed_invoice_id: newInvoice.id
                },
                { where: { id: { [Op.in]: requestIds } }, transaction }
            );

            await transaction.commit();

            // Notification (outside transaction)
            try {
                await createNotification({
                    type: 'INVOICE',
                    title: 'Hóa đơn phí dịch vụ mới',
                    content: `Bạn có hóa đơn phí dịch vụ mới (${newInvoice.invoice_number}), tổng ${requestFees.toLocaleString('vi-VN')}đ. Vui lòng thanh toán trước ${dueDate}.`,
                    target_type: 'INVOICE',
                    target_id: newInvoice.id,
                    specific_user_ids: [contract.customer_id]
                });
            } catch (notifyErr) {
                console.error(`[ServiceInvoiceJob] Notification failed for ${newInvoice.invoice_number}:`, notifyErr.message);
            }

            generatedCount++;
            console.log(`[ServiceInvoiceJob] ${newInvoice.invoice_number} cho ${contract.contract_number} (${completedRequests.length} requests)`);
        } catch (err) {
            await transaction.rollback();
            console.error(`[ServiceInvoiceJob] Lỗi hợp đồng ${contract.id}:`, err.message);
        }
    }

    return generatedCount;
};

// ── Combined generator (called by cron job) ─────────────────────

const generatePeriodicInvoices = async () => {
    const rentCount = await generateRentInvoices();
    const serviceCount = await generateServiceInvoices();
    return rentCount + serviceCount;
};

// ── Query helpers ───────────────────────────────────────────────

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
    generateRentInvoices,
    generateServiceInvoices,
    getMyInvoices,
    getInvoiceById
};
