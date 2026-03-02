const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');
const authJwt = require('../middlewares/authJwt');
const optionalAuthJwt = require('../middlewares/optionalAuthJwt');
const requireRole = require('../middlewares/requireRole');

/**
 * @swagger
 * tags:
 *   - name: Buildings
 *     description: Quản lý toà nhà
 */

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     operationId: getAllBuildings
 *     summary: Lấy danh sách toà nhà (phân trang + lọc)
 *     tags: [Buildings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi server
 */
router.get('/', optionalAuthJwt, buildingController.getAllBuildings);

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     operationId: getBuildingById
 *     summary: Lấy chi tiết toà nhà theo ID
 *     tags: [Buildings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', optionalAuthJwt, buildingController.getBuildingById);

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     operationId: createBuilding
 *     summary: Tạo toà nhà mới (ADMIN only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location_id
 *               - name
 *               - address
 *               - latitude
 *               - longitude
 *             properties:
 *               location_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               description:
 *                 type: string
 *               total_floors:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *                 description: URL ảnh đại diện (upload trước qua /api/upload)
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng URL ảnh (upload trước qua /api/upload)
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 */
router.post('/', authJwt, requireRole('ADMIN'), buildingController.createBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     operationId: updateBuilding
 *     summary: Cập nhật toà nhà (ADMIN only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               description:
 *                 type: string
 *               total_floors:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *                 description: URL ảnh đại diện mới
 *               is_active:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng URL ảnh mới (thay thế toàn bộ ảnh cũ)
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put('/:id', authJwt, requireRole('ADMIN'), buildingController.updateBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   delete:
 *     operationId: deleteBuilding
 *     summary: Xoá toà nhà (ADMIN only, check ràng buộc booking/contract)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
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
 *         description: Không tìm thấy
 *       409:
 *         description: Còn booking/contract active
 */
router.delete('/:id', authJwt, requireRole('ADMIN'), buildingController.deleteBuilding);

/**
 * @swagger
 * /api/buildings/{id}/status:
 *   patch:
 *     operationId: toggleBuildingStatus
 *     summary: Toggle trạng thái hoạt động (ADMIN only, check ràng buộc khi deactivate)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 *       409:
 *         description: Còn booking/contract active
 */
router.patch('/:id/status', authJwt, requireRole('ADMIN'), buildingController.toggleBuildingStatus);

module.exports = router;
