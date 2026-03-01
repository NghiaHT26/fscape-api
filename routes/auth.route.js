const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const validator = require('../validators/auth.validator');
const validate = require('../middlewares/validateResult');

router.post('/signup', validator.signup, validate, controller.signup);
router.post('/signup/verify', validator.verifySignup, validate, controller.verifySignup);
router.post('/signin', validator.signin, validate, controller.signin);
router.post('/forgot-password', validator.forgotPassword, validate, controller.forgotPassword);
router.post('/reset-password', validator.resetPassword, validate, controller.resetPassword);

module.exports = router;