const { sequelize } = require("../config/db");
// Logic thanh toán đang tạm ẩn để viết lại sau

const createBookingPaymentUrl = async (req, res) => {
    return res.status(501).json({ message: "Chức năng thanh toán đang được cập nhật." });
};

const vnpayIpn = async (req, res) => {
    return res.status(200).json({ RspCode: "99", Message: "Not implemented yet" });
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
    vnpayIpn,
    getMyPayments
};
