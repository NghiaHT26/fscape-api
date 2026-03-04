const express = require('express');
const router = express.Router();

const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');
const controller = require('../controllers/adminUser.controller');

router.use(authJwt, requireAdmin);

router.post('/', controller.createUser);

router.get('/', controller.listUsers);

router.patch('/:id/status', controller.updateUserStatus);

module.exports = router;
