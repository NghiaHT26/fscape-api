const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const roomController = require('../controllers/room.controller');
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
 *     tags:
 *       - Rooms
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
 *       500:
 *         description: Lỗi server
 */
router.get('/', roomController.getAllRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     operationId: getRoomById
 *     summary: Lấy thông tin phòng theo ID
 *     tags:
 *       - Rooms
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
router.get('/:id', roomController.getRoomById);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     operationId: createRoom
 *     summary: Tạo phòng mới (hỗ trợ upload nhiều loại ảnh)
 *     tags:
 *       - Rooms
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               room_type_id:
 *                 type: string
 *                 format: uuid
 *               floor:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, LOCKED]
 *                 default: AVAILABLE
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện (1 file)
 *               image_3d:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh 3D (1 file)
 *               blueprint:
 *                 type: string
 *                 format: binary
 *                 description: Bản vẽ mặt bằng (1 file)
 *               gallery_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Danh sách ảnh thực tế (tối đa 10)
 *     responses:
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Thiếu dữ liệu bắt buộc
 *       409:
 *         description: Trùng room_number trong cùng building
 */
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image_3d', maxCount: 1 },
    { name: 'blueprint', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  roomController.createRoom
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     operationId: updateRoom
 *     summary: Cập nhật phòng
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
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
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Cập nhật ảnh đại diện
 *               image_3d:
 *                 type: string
 *                 format: binary
 *               blueprint:
 *                 type: string
 *                 format: binary
 *               gallery_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gửi danh sách ảnh mới (ghi đè)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image_3d', maxCount: 1 },
    { name: 'blueprint', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  roomController.updateRoom
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     operationId: deleteRoom
 *     summary: Xoá phòng (hard delete)
 *     tags:
 *       - Rooms
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
 *       404:
 *         description: Không tìm thấy phòng
 */
router.delete('/:id', roomController.deleteRoom);

module.exports = router;