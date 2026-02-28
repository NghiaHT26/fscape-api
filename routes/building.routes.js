const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');

/**
 * @swagger
 * tags:
 *   name: Buildings
 *   description: API quản lý tòa nhà
 */

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Lấy danh sách tất cả tòa nhà
 *     tags: [Buildings]
 *     responses:
 *       200:
 *         description: Danh sách tòa nhà
 */
router.get('/', buildingController.getAllBuildings);

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     summary: Lấy chi tiết tòa nhà theo ID
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin tòa nhà
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', buildingController.getBuildingById);

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     summary: Tạo tòa nhà mới
 *     tags: [Buildings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Building A"
 *               address:
 *                 type: string
 *                 example: "123 Nguyen Trai"
 *               description:
 *                 type: string
 *                 example: "Khu nhà dành cho sinh viên năm 1"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', buildingController.createBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     summary: Cập nhật tòa nhà
 *     tags: [Buildings]
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
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', buildingController.updateBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   delete:
 *     summary: Xóa tòa nhà
 *     tags: [Buildings]
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
router.delete('/:id', buildingController.deleteBuilding);

module.exports = router;