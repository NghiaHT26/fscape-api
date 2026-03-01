const express = require('express')
const router = express.Router()
const roomController = require('../controllers/room.controller')

/**
 * @swagger
 * tags:
 *   - name: Rooms
 *     description: Quản lý phòng (thuộc Building)
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     operationId: getAllRooms
 *     summary: Lấy danh sách phòng (phân trang + lọc)
 *     tags: [Rooms]
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
 *         name: building_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo building_id
 *       - in: query
 *         name: room_type_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo room_type_id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, LOCKED]
 *         description: Lọc theo trạng thái phòng
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *         description: Lọc theo tầng
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo room_number (iLike)
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thành công
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', roomController.getAllRooms)

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     operationId: getRoomById
 *     summary: Lấy thông tin phòng theo ID (kèm building, room_type, images, assets)
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của phòng
 *     responses:
 *       200:
 *         description: Lấy phòng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Không tìm thấy phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', roomController.getRoomById)

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     operationId: createRoom
 *     summary: Tạo phòng mới (có thể kèm gallery_images)
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_number
 *               - building_id
 *               - room_type_id
 *               - floor
 *             properties:
 *               room_number:
 *                 type: string
 *                 example: "101"
 *               building_id:
 *                 type: string
 *                 format: uuid
 *                 example: "eca636e3-d5a3-46d4-bdd6-fa5371e0b070"
 *               room_type_id:
 *                 type: string
 *                 format: uuid
 *                 example: "871b69e4-306a-4dea-865d-5b9827937a42"
 *               floor:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, LOCKED]
 *                 default: AVAILABLE
 *               thumbnail_url:
 *                 type: string
 *               image_3d_url:
 *                 type: string
 *               blueprint_url:
 *                 type: string
 *               gallery_images:
 *                 type: array
 *                 description: Danh sách URL hình ảnh phòng (sẽ tạo RoomImage records)
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
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
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Thiếu dữ liệu bắt buộc hoặc Building/RoomType không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Trùng room_number trong cùng building
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', roomController.createRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     operationId: updateRoom
 *     summary: Cập nhật phòng (gửi gallery_images sẽ xoá ảnh cũ và thay bằng danh sách mới)
 *     tags: [Rooms]
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
 *               room_number:
 *                 type: string
 *               building_id:
 *                 type: string
 *                 format: uuid
 *               room_type_id:
 *                 type: string
 *                 format: uuid
 *               floor:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, LOCKED]
 *               thumbnail_url:
 *                 type: string
 *               image_3d_url:
 *                 type: string
 *               blueprint_url:
 *                 type: string
 *               gallery_images:
 *                 type: array
 *                 description: Gửi mảng này sẽ replace toàn bộ RoomImage cũ
 *                 items:
 *                   type: string
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
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Body rỗng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Trùng room_number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', roomController.updateRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     operationId: deleteRoom
 *     summary: Xoá phòng (hard delete)
 *     tags: [Rooms]
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
 *         description: Không tìm thấy phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', roomController.deleteRoom)

module.exports = router
