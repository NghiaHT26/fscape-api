const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university.controller');

/**
 * @swagger
 * tags:
 *   name: Universities
 *   description: API quản lý trường đại học
 */

/**
 * @swagger
 * /api/universities:
 *   get:
 *     summary: Lấy danh sách tất cả trường đại học
 *     tags: [Universities]
 *     responses:
 *       200:
 *         description: Danh sách trường
 */
router.get('/', universityController.getAllUniversities);

/**
 * @swagger
 * /api/universities/{id}:
 *   get:
 *     summary: Lấy chi tiết trường theo ID
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin trường
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', universityController.getUniversityById);

/**
 * @swagger
 * /api/universities:
 *   post:
 *     summary: Tạo trường đại học mới
 *     tags: [Universities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Đại học Bách Khoa Hà Nội"
 *               address:
 *                 type: string
 *                 example: "Số 1 Đại Cồ Việt, Hai Bà Trưng"
 *               description:
 *                 type: string
 *                 example: "Trường đại học kỹ thuật hàng đầu"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', universityController.createUniversity);

/**
 * @swagger
 * /api/universities/{id}:
 *   put:
 *     summary: Cập nhật trường đại học
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', universityController.updateUniversity);

/**
 * @swagger
 * /api/universities/{id}:
 *   delete:
 *     summary: Xóa trường đại học
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', universityController.deleteUniversity);

module.exports = router;