const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const buildingController = require('../controllers/building.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                     $ref: '#/components/schemas/Building'
 *       500:
 *         description: Lỗi server
 */
router.get('/', buildingController.getAllBuildings);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BuildingDetail'
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', buildingController.getBuildingById);

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     operationId: createBuilding
 *     summary: Tạo toà nhà mới
 *     tags: [Buildings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *                 description: Chọn 1 ảnh làm ảnh đại diện
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               image_url:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *           encoding:
 *             facilities:
 *               style: form
 *               explode: true
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post(
    '/',
    authJwt,
    requireAdmin,
    upload.fields([
        { name: 'thumbnail_url', maxCount: 1 },
        { name: 'image_url', maxCount: 10 }
    ]),
    buildingController.createBuilding
);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     operationId: updateBuilding
 *     summary: Cập nhật toà nhà
 *     tags: [Buildings]
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
 *                 format: binary
 *                 description: Cập nhật ảnh đại diện
 *               is_active:
 *                 type: boolean
 *               image_url:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *           encoding:
 *             facilities:
 *               style: form
 *               explode: true
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put(
    '/:id',
    authJwt,
    requireAdmin,
    upload.fields([
        { name: 'thumbnail_url', maxCount: 1 },
        { name: 'images_url', maxCount: 10 }
    ]),
    buildingController.updateBuilding
);

/**
 * @swagger
 * /api/buildings/{id}:
 *   delete:
 *     operationId: deleteBuilding
 *     summary: Xoá toà nhà
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
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy
 */
router.delete('/:id', authJwt, requireAdmin, buildingController.deleteBuilding);


/**
 * @swagger
 * /api/buildings/{id}/status:
 *   patch:
 *     operationId: toggleBuildingStatus
 *     summary: Toggle trạng thái hoạt động
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
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.patch('/:id/status', authJwt, requireAdmin, buildingController.toggleBuildingStatus);

module.exports = router;