const bookingService = require('../services/booking.service');
const paymentService = require('../services/payment.service');

const createBooking = async (req, res) => {
    try {
        const userId = req.user.id; // Giả sử đã có middleware xác thực
        const booking = await bookingService.createBooking(userId, req.body);

        // Tạo URL thanh toán VNPay ngay sau khi booking thành công
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const paymentResult = await paymentService.createBookingPaymentUrl(userId, booking.id, ipAddr);

        return res.status(201).json({
            message: 'Đã tạo đơn đặt phòng thành công.',
            data: {
                ...booking.toJSON(),
                paymentUrl: paymentResult.paymentUrl
            }
        });
    } catch (error) {
        console.error('❌ Controller Error (createBooking):', error);
        return res.status(error.status || 500).json({
            message: error.message || 'Internal Server Error'
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await bookingService.getMyBookings(userId);

        return res.status(200).json({
            data: bookings
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Internal Server Error'
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const booking = await bookingService.getBookingById(id, userId);

        return res.status(200).json({
            data: booking
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || 'Internal Server Error'
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById
};
