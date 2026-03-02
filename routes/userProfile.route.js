const express = require('express');
const router = express.Router();

const authJwt = require('../middlewares/authJwt');
const userController = require('../controllers/userProfile.controller'); 

/**
 * @swagger
 * tags:
 *   - name: UserProfile
 *     description: Quản lý hồ sơ cá nhân (yêu cầu đăng nhập)
 */

/**
 * @swagger
 * /api/user-profile/me:
 *   get:
 *     operationId: getMyProfile
 *     summary: Lấy thông tin hồ sơ cá nhân
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/me', authJwt, userController.getProfile);

/**
 * @swagger
 * /api/user-profile/me:
 *   put:
 *     operationId: updateMyProfile
 *     summary: Cập nhật hồ sơ cá nhân (chỉ cho phép thay đổi first_name, last_name, phone, avatar_url)
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Nguyen"
 *               last_name:
 *                 type: string
 *                 example: "Van A"
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               avatar_url:
 *                 type: string
 *                 example: "https://res.cloudinary.com/xxx/avatar.jpg"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     avatar_url:
 *                       type: string
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.put('/me', authJwt, userController.updateProfile);

module.exports = router;
