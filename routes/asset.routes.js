const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: API quản lý tài sản / hình ảnh / media
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Lấy danh sách tất cả assets
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Danh sách assets
 */
router.get('/', assetController.getAllAssets);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Lấy chi tiết asset theo ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin asset
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', assetController.getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Tạo asset mới
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Room Image 1"
 *               url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               type:
 *                 type: string
 *                 example: "image"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', assetController.createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Cập nhật asset
 *     tags: [Assets]
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
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', assetController.updateAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: Xóa asset
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', assetController.deleteAsset);

module.exports = router;