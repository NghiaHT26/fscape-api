const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authJwt = require("../middlewares/authJwt");

router.post("/create-booking-vnpay", authJwt, paymentController.createBookingPaymentUrl);

router.get("/my", authJwt, paymentController.getMyPayments);

router.get("/vnpay-ipn", paymentController.vnpayIpn);

module.exports = router;
