const express = require('express');
const router = express.Router();

const controller = require('../controllers/internalAuth.controller');
const authJwt = require('../middlewares/authJwt');
const authInternal = require('../middlewares/authInternal');
/**
 * @swagger
 * tags:
 *   name: InternalAuth
 *   description: Xác thực user nội bộ (Admin / Staff / Manager)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/internal/auth/login:
 *   post:
 *     summary: Internal login (Admin / Staff / Manager)
 *     tags: [InternalAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@company.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       400:
 *         description: Invalid email or password / Account inactive
 */
router.post('/login', authInternal, controller.login);

/**
 * @swagger
 * /api/internal/auth/change-password:
 *   post:
 *     summary: Change password (internal user)
 *     tags: [InternalAuth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Old password is incorrect / Invalid authentication method
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: This account cannot change password here
 *       404:
 *         description: User not found
 */
router.post('/change-password', authInternal, authJwt, controller.changePassword);

module.exports = router;