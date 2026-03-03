const { body } = require('express-validator');

exports.signup = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

exports.verifySignup = [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
];

exports.signin = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

exports.forgotPassword = [
  body('email').isEmail(),
];

exports.resetPassword = [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('new_password').isLength({ min: 6 }),
];

// Google login uses id_token issued by Google
exports.googleLogin = [
  body('id_token').notEmpty(),
];

exports.googleVerify = [
  body('id_token').notEmpty(),
  body('otp').isLength({ min: 6, max: 6 }),
];