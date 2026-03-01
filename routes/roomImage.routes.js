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
 *     summary: Lấy danh sách hình ảnh phòng
 *     tags: [RoomImages]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo room_id
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/', roomImageController.getAllRoomImages)

/**
 * @swagger
 * /api/room-images/{id}:
 *   get:
 *     summary: Lấy chi tiết hình ảnh phòng
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
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', roomImageController.getRoomImageById)

/**
 * @swagger
 * /api/room-images:
 *   post:
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
 */
router.post('/', roomImageController.createRoomImage)

/**
 * @swagger
 * /api/room-images/{id}:
 *   put:
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
 */
router.put('/:id', roomImageController.updateRoomImage)

/**
 * @swagger
 * /api/room-images/{id}:
 *   delete:
 *     summary: Xóa hình ảnh phòng
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
 *         description: Xóa thành công
 */
router.delete('/:id', roomImageController.deleteRoomImage)

module.exports = router