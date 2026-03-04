const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const roomController = require('../controllers/room.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
/**
 * @swagger
 * tags:
 *   - name: Rooms
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     operationId: getAllRooms
 *     summary: Lấy danh sách phòng (phân trang + lọc)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Lấy danh sách phòng thành công
 *       500:
 *         description: Lỗi server
 */
router.get(
  '/',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
  roomController.getAllRooms
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     operationId: getRoomById
 *     summary: Lấy thông tin phòng theo ID
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Lấy phòng thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.get(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
  roomController.getRoomById
);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     operationId: createRoom
 *     summary: Tạo phòng mới (hỗ trợ upload nhiều loại ảnh)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       201:
 *         description: Tạo phòng thành công
 *       400:
 *         description: Thiếu dữ liệu bắt buộc
 *       409:
 *         description: Trùng room_number trong cùng building
 */
router.post(
  '/',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
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
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.put(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
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
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.delete(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
  roomController.deleteRoom
);

/**
 * @swagger
 * /api/rooms/{id}/status:
 *   patch:
 *     operationId: updateRoomStatus
 *     summary: Cập nhật trạng thái phòng (status)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER]
 *     security:
 *       - bearerAuth: []
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, LOCKED]
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Trạng thái được cập nhật thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 */
router.patch(
  '/:id/status',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
  roomController.updateRoomStatus
);

module.exports = router;