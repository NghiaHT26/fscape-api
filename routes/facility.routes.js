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
 *     operationId: getAllFacilities
 *     summary: Lấy danh sách tiện ích (phân trang + lọc)
 *     tags: [Facilities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên tiện ích (iLike)
 *       - in: query
 *         name: building_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc chỉ các facility thuộc building này (join qua building_facilities)
 *     responses:
 *       200:
 *         description: Lấy danh sách tiện ích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Facility'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', facilityController.getAllFacilities)

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     operationId: getFacilityById
 *     summary: Lấy chi tiết tiện ích theo ID (kèm danh sách buildings đang sử dụng)
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
 *                   $ref: '#/components/schemas/FacilityDetail'
 *       404:
 *         description: Không tìm thấy tiện ích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', facilityController.getFacilityById)

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     operationId: createFacility
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
 *                 example: "Phòng gym"
 *               description:
 *                 type: string
 *                 example: "Phòng tập thể dục trong khuôn viên"
 *               image_url:
 *                 type: string
 *                 example: "https://cdn.com/icons/gym.png"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Tạo tiện ích thành công
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
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       400:
 *         description: Thiếu tên tiện ích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên tiện ích đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', facilityController.createFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     operationId: updateFacility
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
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Không tìm thấy tiện ích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên tiện ích đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', facilityController.updateFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     operationId: deleteFacility
 *     summary: Xoá tiện ích (hard delete)
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
 *         description: Xoá thành công
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
 *       404:
 *         description: Không tìm thấy tiện ích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', facilityController.deleteFacility)

module.exports = router
