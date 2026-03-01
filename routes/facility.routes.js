const express = require('express')
const router = express.Router()
const facilityController = require('../controllers/facility.controller')

/**
 * @swagger
 * tags:
 *   - name: Facilities
 *     description: Danh mục tiện ích hệ thống (Gym, Cinema, Pool...)
 */

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Lấy danh sách tiện ích (có phân trang + filter)
 *     tags: [Facilities]
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên tiện ích
 *     responses:
 *       200:
 *         description: Lấy danh sách tiện ích thành công
 */
router.get('/', facilityController.getAllFacilities)

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Lấy chi tiết tiện ích theo ID
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của tiện ích
 *     responses:
 *       200:
 *         description: Lấy tiện ích thành công
 *       404:
 *         description: Không tìm thấy tiện ích
 */
router.get('/:id', facilityController.getFacilityById)

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Tạo tiện ích mới (master data)
 *     tags: [Facilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gym"
 *               description:
 *                 type: string
 *                 example: "Phòng tập thể dục trong khuôn viên"
 *               image_url:
 *                 type: string
 *                 example: "https://cdn.com/icons/gym.png"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo tiện ích thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Tên đã tồn tại
 */
router.post('/', facilityController.createFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Cập nhật tiện ích
 *     tags: [Facilities]
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
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy tiện ích
 */
router.put('/:id', facilityController.updateFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Xóa tiện ích (hard delete)
 *     tags: [Facilities]
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
 *         description: Không tìm thấy tiện ích
 */
router.delete('/:id', facilityController.deleteFacility)

module.exports = router