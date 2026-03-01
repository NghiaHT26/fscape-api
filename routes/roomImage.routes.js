const express = require('express')
const router = express.Router()
const roomImageController = require('../controllers/roomImage.controller')

/**
 * @swagger
 * tags:
 *   - name: RoomImages
 *     description: Quản lý hình ảnh của phòng
 */

/**
 * @swagger
 * /api/room-images:
 *   get:
 *     operationId: getAllRoomImages
 *     summary: Lấy danh sách hình ảnh phòng (phân trang + lọc theo room_id)
 *     tags: [RoomImages]
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
 *         name: room_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo room_id
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
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
 *                     $ref: '#/components/schemas/RoomImage'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', roomImageController.getAllRoomImages)

/**
 * @swagger
 * /api/room-images/{id}:
 *   get:
 *     operationId: getRoomImageById
 *     summary: Lấy chi tiết hình ảnh phòng theo ID
 *     tags: [RoomImages]
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
 *                   $ref: '#/components/schemas/RoomImage'
 *       404:
 *         description: Không tìm thấy hình ảnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', roomImageController.getRoomImageById)

/**
 * @swagger
 * /api/room-images:
 *   post:
 *     operationId: createRoomImage
 *     summary: Thêm hình ảnh mới cho phòng
 *     tags: [RoomImages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - image_url
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *                 example: "fa615f6f-ef4e-478d-8270-fcba07e4d2e1"
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/room1.jpg"
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
 *                   $ref: '#/components/schemas/RoomImage'
 *       400:
 *         description: Thiếu room_id hoặc image_url
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Room không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', roomImageController.createRoomImage)

/**
 * @swagger
 * /api/room-images/{id}:
 *   put:
 *     operationId: updateRoomImage
 *     summary: Cập nhật hình ảnh phòng
 *     tags: [RoomImages]
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
 *               image_url:
 *                 type: string
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
 *                   $ref: '#/components/schemas/RoomImage'
 *       400:
 *         description: Body rỗng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy hình ảnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', roomImageController.updateRoomImage)

/**
 * @swagger
 * /api/room-images/{id}:
 *   delete:
 *     operationId: deleteRoomImage
 *     summary: Xoá hình ảnh phòng
 *     tags: [RoomImages]
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
 *         description: Không tìm thấy hình ảnh
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', roomImageController.deleteRoomImage)

module.exports = router
