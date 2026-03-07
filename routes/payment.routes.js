const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authJwt = require("../middlewares/authJwt");

router.post("/create-booking-vnpay", authJwt, paymentController.createBookingPaymentUrl);

router.post("/create-invoice-vnpay", authJwt, paymentController.createInvoicePaymentUrl);

router.get("/my", authJwt, paymentController.getMyPayments);

router.get("/vnpay-ipn", paymentController.vnpayIpn);

router.get("/vnpay-return", paymentController.vnpayReturn);

module.exports = router;
