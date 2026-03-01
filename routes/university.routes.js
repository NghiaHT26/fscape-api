const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university.controller');

/**
 * @swagger
 * tags:
 *   - name: Universities
 *     description: Quản lý trường đại học (thuộc Location)
 */

/**
 * @swagger
 * /api/universities:
 *   get:
 *     summary: Lấy danh sách trường đại học (có phân trang + filter)
 *     tags: [Universities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại (mặc định 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số bản ghi mỗi trang (mặc định 10)
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo location_id
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       location_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: "Đại học Bách Khoa Hà Nội"
 *                       address:
 *                         type: string
 *                       description:
 *                         type: string
 *                       thumbnail_url:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
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
 *           type: string
 *           format: uuid
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
 *                 data:
 *                   type: object
 *       404:
 *         description: Không tìm thấy trường
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
 *             required:
 *               - location_id
 *               - name
 *             properties:
 *               location_id:
 *                 type: string
 *                 format: uuid
 *                 example: "18358331-e3ae-41b3-ae4d-965f7b676804"
 *               name:
 *                 type: string
 *                 example: "Đại học Bách Khoa Hà Nội"
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Location không tồn tại
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
 *           type: string
 *           format: uuid
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
 *               thumbnail_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy trường
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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy trường
 */
router.delete('/:id', universityController.deleteUniversity);

module.exports = router;