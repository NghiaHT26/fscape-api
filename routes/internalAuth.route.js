const express = require('express');
const router = express.Router();
const controller = require('../controllers/internalAuth.controller');
const authJwt = require('../middlewares/authJwt');

router.post('/login', controller.login);
router.post('/change-password', authJwt, controller.changePassword);

module.exports = router;