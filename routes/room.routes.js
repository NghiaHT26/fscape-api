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
 *     summary: Lấy danh sách phòng (có phân trang + filter)
 *     tags: [Rooms]
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
 *         description: Tìm theo room_number
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thành công
 */
router.get('/', roomController.getAllRooms)

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Lấy thông tin phòng theo ID
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
 *       404:
 *         description: Không tìm thấy phòng
 */
router.get('/:id', roomController.getRoomById)

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Tạo phòng mới
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             room_number: "101"
 *             building_id: "eca636e3-d5a3-46d4-bdd6-fa5371e0b070"
 *             room_type_id: "871b69e4-306a-4dea-865d-5b9827937a42"
 *             floor: 1
 *             status: "AVAILABLE"
 *             gallery_images:
 *               - "https://example.com/img1.jpg"
 *               - "https://example.com/img2.jpg"
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Thiếu dữ liệu bắt buộc
 *       404:
 *         description: Building hoặc RoomType không tồn tại
 *       409:
 *         description: Trùng room_number trong cùng building
 */
router.post('/', roomController.createRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Cập nhật phòng
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
 *           example:
 *             room_number: "102"
 *             floor: 2
 *             status: "OCCUPIED"
 *             gallery_images:
 *               - "https://example.com/new1.jpg"
 *               - "https://example.com/new2.jpg"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy phòng
 *       409:
 *         description: Trùng room_number
 */
router.put('/:id', roomController.updateRoom)

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Xóa phòng
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
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.delete('/:id', roomController.deleteRoom)

module.exports = router