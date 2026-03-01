const express = require('express');
const router = express.Router();
const buildingFacilityController = require('../controllers/buildingFacility.controller');

/**
 * @swagger
 * tags:
 *   - name: Building Facilities
 *     description: Quản lý liên kết giữa Building và tiện ích (Gym, Cinema, Pool...)
 */

/**
 * @swagger
 * /api/building-facilities:
 *   post:
 *     summary: Gán tiện ích vào tòa nhà
 *     tags: [Building Facilities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - building_id
 *               - facility_id
 *             properties:
 *               building_id:
 *                 type: string
 *                 format: uuid
 *                 example: "eca636e3-d5a3-46d4-bdd6-fa5371e0b070"
 *               facility_id:
 *                 type: string
 *                 format: uuid
 *                 example: "a1234567-d5a3-46d4-bdd6-fa5371e0b099"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Gán tiện ích vào tòa nhà thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Tiện ích đã tồn tại trong tòa nhà
 */
router.post('/', buildingFacilityController.assignFacility);

/**
 * @swagger
 * /api/building-facilities/{id}:
 *   put:
 *     summary: Cập nhật trạng thái tiện ích của tòa nhà
 *     tags: [Building Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của bản ghi building_facility
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy bản ghi
 */
router.put('/:id', buildingFacilityController.updateStatus);

/**
 * @swagger
 * /api/building-facilities/{id}:
 *   delete:
 *     summary: Xóa liên kết tiện ích khỏi tòa nhà
 *     tags: [Building Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID của bản ghi building_facility
 *     responses:
 *       200:
 *         description: Xóa liên kết thành công
 *       404:
 *         description: Không tìm thấy bản ghi
 */
router.delete('/:id', buildingFacilityController.removeFacility);

module.exports = router;