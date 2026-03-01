const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');

/**
 * @swagger
 * tags:
 *   - name: Buildings
 *     description: Quản lý tòa nhà
 */

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: Lấy danh sách tòa nhà (có phân trang + filter)
 *     tags: [Buildings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại (mặc định = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số bản ghi mỗi trang (mặc định = 10)
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo location_id
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       location_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       description:
 *                         type: string
 *                       total_floors:
 *                         type: integer
 *                       thumbnail_url:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
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
 *                   type: object
 *       404:
 *         description: Không tìm thấy tòa nhà
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
 *                 example: "18358331-e3ae-41b3-ae4d-965f7b676804"
 *               name:
 *                 type: string
 *                 example: "Building A"
 *               address:
 *                 type: string
 *                 example: "123 Nguyen Trai, Ha Noi"
 *               latitude:
 *                 type: number
 *                 example: 21.028511
 *               longitude:
 *                 type: number
 *                 example: 105.804817
 *               description:
 *                 type: string
 *               total_floors:
 *                 type: integer
 *                 example: 12
 *               thumbnail_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Location không tồn tại
 */
router.post('/', buildingController.createBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     summary: Cập nhật thông tin tòa nhà
 *     tags: [Buildings]
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
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
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 */
router.delete('/:id', buildingController.deleteBuilding);

/**
 * @swagger
 * /api/buildings/{id}/status:
 *   patch:
 *     summary: Bật/Tắt trạng thái hoạt động của Building
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
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Không tìm thấy building
 */
router.patch('/:id/status', buildingController.toggleBuildingStatus)

module.exports = router;