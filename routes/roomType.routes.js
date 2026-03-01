const express = require('express')
const router = express.Router()
const roomTypeController = require('../controllers/roomType.controller')

/**
 * @swagger
 * tags:
 *   - name: RoomTypes
 *     description: Quản lý loại phòng
 */

/**
 * @swagger
 * /api/room-types:
 *   get:
 *     summary: Lấy danh sách loại phòng (phân trang + filter)
 *     tags: [RoomTypes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
router.get('/', roomTypeController.getAllRoomTypes)

/**
 * @swagger
 * /api/room-types/{id}:
 *   get:
 *     summary: Lấy chi tiết loại phòng theo ID
 *     tags: [RoomTypes]
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
router.get('/:id', roomTypeController.getRoomTypeById)

/**
 * @swagger
 * /api/room-types:
 *   post:
 *     summary: Tạo loại phòng mới
 *     tags: [RoomTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Studio Deluxe"
 *             description: "Phòng cao cấp"
 *             base_price: 3500000
 *             deposit_months: 1
 *             capacity_min: 1
 *             capacity_max: 2
 *             bedrooms: 1
 *             bathrooms: 1
 *             area_sqm: 28.5
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', roomTypeController.createRoomType)

/**
 * @swagger
 * /api/room-types/{id}:
 *   put:
 *     summary: Cập nhật loại phòng
 *     tags: [RoomTypes]
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
 *             base_price: 4000000
 *             capacity_max: 3
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', roomTypeController.updateRoomType)

/**
 * @swagger
 * /api/room-types/{id}:
 *   delete:
 *     summary: Vô hiệu hóa loại phòng (soft delete)
 *     tags: [RoomTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vô hiệu hóa thành công
 */
router.delete('/:id', roomTypeController.deleteRoomType)

module.exports = router