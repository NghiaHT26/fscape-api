const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authJwt = require("../middlewares/authJwt");

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Quản lý thanh toán qua cổng điện tử
 */

/**
 * @swagger
 * /api/payments/create-booking-vnpay:
 *   post:
 *     summary: Tạo URL thanh toán VNPay cho đơn đặt phòng
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *               bankCode:
 *                 type: string
 *                 description: Mã ngân hàng (tuỳ chọn, ví dụ VNBANK, INTCARD)
 *     responses:
 *       200:
 *         description: URL thanh toán được khởi tạo
 */
router.post("/create-booking-vnpay", authJwt, paymentController.createBookingPaymentUrl);

/**
 * @swagger
 * /api/payments/my:
 *   get:
 *     summary: Lấy lịch sử thanh toán của khách hàng hiện tại
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/my", authJwt, paymentController.getMyPayments);

/**
 * @swagger
 * /api/payments/vnpay-ipn:
 *   get:
 *     summary: Endpoint nhận kết quả từ VNPay (IPN)
 *     tags: [Payments]
 */
router.get("/vnpay-ipn", paymentController.vnpayIpn);

module.exports = router;
