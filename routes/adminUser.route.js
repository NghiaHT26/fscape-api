const express = require('express');
const router = express.Router();
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');
const controller = require('../controllers/adminUser.controller');

// tất cả route đều yêu cầu ADMIN
router.use(authJwt, requireAdmin);

/**
 * ADMIN - QUẢN LÝ USER
 */

// Tạo user nội bộ
router.post('/', controller.createUser);

// Xem toàn bộ account (kèm is_active)
router.get('/', controller.listUsers);

// 👉 MỚI: Admin cập nhật trạng thái hoạt động
router.patch('/:id/status', controller.updateUserStatus);

module.exports = router;