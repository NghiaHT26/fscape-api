const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
/**
 * @swagger
 * tags:
 *   - name: Assets
 *     description: Quản lý tài sản trong toà nhà
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     operationId: getAllAssets
 *     summary: Lấy danh sách tài sản (phân trang + lọc)
 *     tags: [Assets]
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
 *         name: current_room_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo phòng hiện tại của tài sản
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *         description: Lọc theo trạng thái tài sản
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên hoặc qr_code (iLike)
 *     responses:
 *       200:
 *         description: Danh sách tài sản
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
 *                     $ref: '#/components/schemas/Asset'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT),
    assetController.getAllAssets
);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     operationId: getAssetById
 *     summary: Lấy chi tiết tài sản theo ID (kèm building, room, 10 lịch sử gần nhất)
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Thông tin tài sản
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AssetDetail'
 *       404:
 *         description: Không tìm thấy tài sản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT),
    assetController.getAssetById
);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     operationId: createAsset
 *     summary: Tạo tài sản mới (tự động ghi lịch sử INITIAL_CREATE, QR code phải là duy nhất)
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - building_id
 *               - qr_code
 *               - name
 *             properties:
 *               building_id:
 *                 type: string
 *                 format: uuid
 *                 example: "eca636e3-d5a3-46d4-bdd6-fa5371e0b070"
 *               qr_code:
 *                 type: string
 *                 example: "QR-ROOM-001"
 *               name:
 *                 type: string
 *                 example: "Máy lạnh"
 *               price:
 *                 type: number
 *                 example: 3500000
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *                 default: AVAILABLE
 *               current_room_id:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tài sản thành công
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
 *                   $ref: '#/components/schemas/AssetDetail'
 *       400:
 *         description: Thiếu qr_code, name hoặc building_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: QR Code đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    assetController.createAsset
);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     operationId: updateAsset
 *     summary: Cập nhật tài sản (tự động ghi log nếu thay đổi status hoặc current_room_id)
 *     tags: [Assets]
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
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *               current_room_id:
 *                 type: string
 *                 format: uuid
 *               notes:
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
 *                   $ref: '#/components/schemas/AssetDetail'
 *       404:
 *         description: Không tìm thấy tài sản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    assetController.updateAsset
);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     operationId: deleteAsset
 *     summary: Xoá tài sản (không cho phép nếu status = IN_USE)
 *     tags: [Assets]
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
 *         description: Không thể xoá tài sản đang IN_USE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy tài sản
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    assetController.deleteAsset
);

module.exports = router;
