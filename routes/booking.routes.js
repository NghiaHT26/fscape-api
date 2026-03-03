const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authJwt = require('../middlewares/authJwt');

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Quản lý đặt phòng (Booking/Deposit)
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     operationId: createBooking
 *     summary: Tạo đơn đặt phòng mới (Đóng cọc)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - checkInDate
 *               - rentalTerm
 *               - customerInfo
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               rentalTerm:
 *                 type: string
 *                 example: "6"
 *               customerInfo:
 *                 type: object
 *                 properties:
 *                   gender:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                   permanentAddress:
 *                     type: string
 *                   emergencyContactName:
 *                     type: string
 *                   emergencyContactPhone:
 *                     type: string
 *     responses:
 *       201:
 *         description: Tạo đơn thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy phòng
 */
router.post('/', authJwt, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     operationId: getMyBookings
 *     summary: Lấy danh sách phiếu đặt phòng của tôi
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/my', authJwt, bookingController.getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     operationId: getBookingById
 *     summary: Lấy chi tiết phiếu đặt phòng
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get('/:id', authJwt, bookingController.getBookingById);

module.exports = router;
