const { sequelize } = require("../config/db");
const paymentService = require("../services/payment.service");
const { verifyIpnSignature } = require('../utils/vnpay');
const getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '127.0.0.1';
    if (ip === '::1') ip = '127.0.0.1';
    if (ip.startsWith('::ffff:')) ip = ip.substring(7);
    if (ip.length > 15) ip = '127.0.0.1';
    return ip;
};

const createBookingPaymentUrl = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.body;
        const ipAddr = getClientIp(req);

        const result = await paymentService.createBookingPaymentUrl(userId, bookingId, ipAddr);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Lỗi tạo thanh toán" });
    }
};

const createInvoicePaymentUrl = async (req, res) => {
    try {
        const userId = req.user.id;
        const { invoiceId } = req.body;
        const ipAddr = getClientIp(req);

        const result = await paymentService.createInvoicePaymentUrl(userId, invoiceId, ipAddr);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Lỗi tạo thanh toán" });
    }
};

const vnpayIpn = async (req, res) => {
    try {
        const query = req.query;
        const result = await paymentService.vnpayIpn(query);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ RspCode: '99', Message: 'Internal Server Error' });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        const query = req.query;

        const isValidSignature = verifyIpnSignature(query);
        if (!isValidSignature) {
            return res.status(400).json({ message: "Chữ ký không hợp lệ", code: query.vnp_ResponseCode });
        }

        if (query.vnp_ResponseCode === '00') {
            return res.status(200).json({ message: "Thanh toán thành công", code: '00', data: query });
        } else {
            return res.status(400).json({ message: "Thanh toán thất bại hoặc đã bị hủy", code: query.vnp_ResponseCode, data: query });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message || 'Lỗi hệ thống khi xác thực kết quả thanh toán' });
    }
};

const getMyPayments = async (req, res) => {
    const { Payment, Booking, Room, Building } = sequelize.models;
    const userId = req.user.id;

    try {
        const payments = await Payment.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Booking,
                    as: 'booking',
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

        return res.status(200).json({
            data: payments
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

module.exports = {
    createBookingPaymentUrl,
    createInvoicePaymentUrl,
    vnpayIpn,
    vnpayReturn,
    getMyPayments
};
