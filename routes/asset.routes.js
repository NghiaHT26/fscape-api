const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');

/**
 * @swagger
 * tags:
 *   - name: Assets
 *     description: Quản lý tài sản trong tòa nhà
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Lấy danh sách tài sản (có filter)
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: building_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo building_id
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *         description: Lọc theo trạng thái tài sản
 *     responses:
 *       200:
 *         description: Danh sách tài sản
 */
router.get('/', assetController.getAllAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Lấy chi tiết tài sản theo ID
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
 *       404:
 *         description: Không tìm thấy tài sản
 */
router.get('/:id', assetController.getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Tạo tài sản mới
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
 *                 example: "Air Conditioner"
 *               price:
 *                 type: number
 *                 example: 3500000
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *               current_room_id:
 *                 type: string
 *                 format: uuid
 *                 example: "fa615f6f-ef4e-478d-8270-fcba07e4d2e1"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tài sản thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', assetController.createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Cập nhật tài sản
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
 *       404:
 *         description: Không tìm thấy tài sản
 */
router.put('/:id', assetController.updateAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Xóa tài sản
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
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy tài sản
 */
router.delete('/:id', assetController.deleteAsset);

module.exports = router;