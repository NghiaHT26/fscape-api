const express = require('express');
const router = express.Router();
const buildingFacilityController = require('../controllers/buildingFacility.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
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
 *     operationId: assignFacilityToBuilding
 *     summary: Gán tiện ích vào toà nhà
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
 *                 default: true
 *     responses:
 *       201:
 *         description: Gán tiện ích vào toà nhà thành công
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
 *                   $ref: '#/components/schemas/BuildingFacility'
 *       400:
 *         description: Thiếu building_id hoặc facility_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tiện ích đã được gán cho toà nhà này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    buildingFacilityController.assignFacility
);

/**
 * @swagger
 * /api/building-facilities/{id}:
 *   put:
 *     operationId: updateBuildingFacilityStatus
 *     summary: Cập nhật trạng thái tiện ích của toà nhà
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
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: false
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
 *                   $ref: '#/components/schemas/BuildingFacility'
 *       400:
 *         description: Thiếu trường is_active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    buildingFacilityController.updateStatus
);

/**
 * @swagger
 * /api/building-facilities/{id}:
 *   delete:
 *     operationId: removeFacilityFromBuilding
 *     summary: Xoá liên kết tiện ích khỏi toà nhà
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
 *         description: Xoá liên kết thành công
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
 *       404:
 *         description: Không tìm thấy bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
    buildingFacilityController.removeFacility
);

module.exports = router;
