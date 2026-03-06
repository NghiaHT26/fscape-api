const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authJwt = require('../middlewares/authJwt');

router.post('/', authJwt, bookingController.createBooking);

router.get('/my', authJwt, bookingController.getMyBookings);

router.get('/:id', authJwt, bookingController.getBookingById);

module.exports = router;
