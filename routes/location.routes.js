const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: API quản lý vị trí
 */

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Lấy danh sách tất cả vị trí
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Danh sách vị trí
 */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Lấy chi tiết vị trí theo ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin vị trí
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', locationController.getLocationById);

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Tạo vị trí mới
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *                 example: "Ha Noi"
 *               district:
 *                 type: string
 *                 example: "Thanh Xuan"
 *               ward:
 *                 type: string
 *                 example: "Khuong Trung"
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', locationController.createLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   put:
 *     summary: Cập nhật vị trí
 *     tags: [Locations]
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
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               ward:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', locationController.updateLocation);

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Xóa vị trí
 *     tags: [Locations]
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
router.delete('/:id', locationController.deleteLocation);

module.exports = router;