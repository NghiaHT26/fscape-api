const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: Quản lý địa điểm (khu vực)
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     operationId: getAllLocations
 *     summary: Lấy danh sách location (phân trang + lọc)
 *     tags: [Locations]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên location (iLike)
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
 *                 message:
 *                   type: string
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Location'
 *                       - type: object
 *                         properties:
 *                           buildings:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                           universities:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     operationId: getLocationById
 *     summary: Lấy chi tiết location theo ID (kèm danh sách buildings và universities)
 *     tags: [Locations]
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
 *                   $ref: '#/components/schemas/LocationDetail'
 *       404:
 *         description: Không tìm thấy location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', locationController.getLocationById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     operationId: createLocation
 *     summary: Tạo location mới
 *     tags: [Locations]
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
 *                 example: "Hà Nội"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Tạo thành công
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
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên location đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', locationController.createLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     operationId: updateLocation
 *     summary: Cập nhật location
 *     tags: [Locations]
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
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Không tìm thấy location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên location đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', locationController.updateLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     operationId: deleteLocation
 *     summary: Xoá location (thất bại nếu còn building/university liên kết)
 *     tags: [Locations]
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
 *       400:
 *         description: Không thể xoá vì còn dữ liệu liên kết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', locationController.deleteLocation);

/**
 * @swagger
 * /api/locations/{id}/status:
 *   patch:
 *     operationId: toggleLocationStatus
 *     summary: Bật/Tắt trạng thái hoạt động của Location (toggle is_active)
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
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
 *                   $ref: '#/components/schemas/Location'
 *       404:
 *         description: Không tìm thấy location
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', locationController.toggleLocationStatus);

module.exports = router;
