const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.post('/', authJwt, requireRoles(ROLES.CUSTOMER, ROLES.RESIDENT), bookingController.createBooking);

router.get('/my', authJwt, requireRoles(ROLES.CUSTOMER, ROLES.RESIDENT), bookingController.getMyBookings);

router.get('/:id', authJwt, bookingController.getBookingById);

module.exports = router;
