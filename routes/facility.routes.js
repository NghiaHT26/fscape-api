const express = require('express')
const router = express.Router()
const facilityController = require('../controllers/facility.controller')

/**
 * @swagger
 * tags:
 *   name: Facilities
 *   description: API quản lý tiện ích
 */

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     summary: Lấy danh sách tất cả tiện ích
 *     tags: [Facilities]
 *     responses:
 *       200:
 *         description: Danh sách tiện ích
 */
router.get('/', facilityController.getAllFacilities)

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     summary: Lấy chi tiết tiện ích theo ID
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của tiện ích
 *     responses:
 *       200:
 *         description: Thông tin tiện ích
 *       404:
 *         description: Không tìm thấy tiện ích
 */
router.get('/:id', facilityController.getFacilityById)

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Tạo tiện ích mới
 *     tags: [Facilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', facilityController.createFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Cập nhật tiện ích
 *     tags: [Facilities]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy tiện ích
 */
router.put('/:id', facilityController.updateFacility)

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Xóa tiện ích
 *     tags: [Facilities]
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
 *         description: Không tìm thấy tiện ích
 */
router.delete('/:id', facilityController.deleteFacility)

module.exports = router