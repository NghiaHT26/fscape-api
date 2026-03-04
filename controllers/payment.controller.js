const { sequelize } = require("../config/db");
const vnpayService = require("../services/vnpay.service");

const createBookingPaymentUrl = async (req, res) => {
    const { bookingId, bankCode } = req.body;
    const { Booking, Payment } = sequelize.models;
    const userId = req.user.id;

    try {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (booking.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Đơn đặt phòng này không ở trạng thái chờ thanh toán." });
        }

        // Tạo bản ghi Payment
        const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payment = await Payment.create({
            payment_number: paymentNumber,
            booking_id: bookingId,
            user_id: userId,
            amount: booking.deposit_amount,
            payment_type: "DEPOSIT",
            status: "PENDING"
        });

        const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        const paymentUrl = vnpayService.createPaymentUrl(req, {
            amount: booking.deposit_amount,
            bankCode: bankCode || "",
            orderDescription: `Thanh toan tien coc cho don hang ${booking.booking_number}`,
            orderType: "billpayment",
            orderId: payment.payment_number, // Dùng payment_number làm TxnRef của VNPay
            ipAddr: ipAddr
        });

        return res.status(200).json({
            success: true,
            data: { paymentUrl }
        });
    } catch (error) {
        console.error("❌ Controller Error (createBookingPaymentUrl):", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

const vnpayIpn = async (req, res) => {
    const { Payment, Booking } = sequelize.models;
    let vnp_Params = req.query;

    try {
        const isValid = vnpayService.verifyReturnUrl(vnp_Params);
        if (!isValid) {
            return res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
        }

        const paymentNumber = vnp_Params["vnp_TxnRef"];
        const amount = vnp_Params["vnp_Amount"] / 100;
        const responseCode = vnp_Params["vnp_ResponseCode"];

        const payment = await Payment.findOne({ where: { payment_number: paymentNumber } });

        if (!payment) {
            return res.status(200).json({ RspCode: "01", Message: "Order not found" });
        }

        if (payment.amount != amount) {
            return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
        }

        if (payment.status !== "PENDING") {
            return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
        }

        const transaction = await sequelize.transaction();
        try {
            if (responseCode === "00") {
                // Thành công
                payment.status = "SUCCESS";
                payment.gateway_transaction_id = vnp_Params["vnp_TransactionNo"];
                payment.gateway_response = vnp_Params;
                payment.paid_at = new Date();
                await payment.save({ transaction });

                // Cập nhật trạng thái Booking
                if (payment.booking_id) {
                    const booking = await Booking.findByPk(payment.booking_id, { transaction });
                    if (booking) {
                        booking.status = "DEPOSIT_PAID";
                        booking.deposit_payment_id = payment.id;
                        booking.deposit_paid_at = new Date();
                        await booking.save({ transaction });
                    }
                }
            } else {
                // Thất bại
                payment.status = "FAILED";
                payment.gateway_response = vnp_Params;
                await payment.save({ transaction });
            }

            await transaction.commit();
            return res.status(200).json({ RspCode: "00", Message: "Success" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (error) {
        console.error("❌ VNPay IPN Error:", error);
        return res.status(500).json({ RspCode: "99", Message: "Unknown error" });
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
            success: true,
            data: payments
        });
    } catch (error) {
        console.error("❌ Controller Error (getMyPayments):", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

module.exports = {
    createBookingPaymentUrl,
    vnpayIpn,
    getMyPayments
};
