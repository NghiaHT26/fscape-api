const express = require('express')
const router = express.Router()
const roomController = require('../controllers/room.controller')

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: API quản lý phòng
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Lấy danh sách phòng
 *     tags: [Rooms]
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
 *           type: integer
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
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
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
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy phòng
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.delete('/:id', roomController.deleteRoom)

module.exports = router