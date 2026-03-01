const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');

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
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: location_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo location_id
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên toà nhà (iLike)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', buildingController.getAllBuildings);

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     operationId: getBuildingById
 *     summary: Lấy chi tiết toà nhà theo ID (kèm images, facilities, nearby_universities)
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/BuildingDetail'
 *       404:
 *         description: Không tìm thấy toà nhà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', buildingController.getBuildingById);

/**
 * @swagger
 * /api/buildings:
 *   post:
 *     operationId: createBuilding
 *     summary: Tạo toà nhà mới (có thể kèm images và facilities)
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
 *                 example: "Toà nhà A"
 *               address:
 *                 type: string
 *                 example: "123 Nguyễn Trãi, Hà Nội"
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
 *                 default: true
 *               images:
 *                 type: array
 *                 description: Danh sách URL hình ảnh toà nhà
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
 *               facilities:
 *                 type: array
 *                 description: Danh sách facility_id cần gán
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["a1234567-d5a3-46d4-bdd6-fa5371e0b099"]
 *     responses:
 *       201:
 *         description: Tạo thành công
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
 *                   $ref: '#/components/schemas/BuildingDetail'
 *       400:
 *         description: Thiếu trường bắt buộc hoặc Location không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', buildingController.createBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   put:
 *     operationId: updateBuilding
 *     summary: Cập nhật toà nhà (có thể sync lại images và facilities)
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
 *               images:
 *                 type: array
 *                 description: Gửi mảng này sẽ xoá toàn bộ ảnh cũ và thay bằng danh sách mới
 *                 items:
 *                   type: string
 *               facilities:
 *                 type: array
 *                 description: Gửi mảng này sẽ xoá toàn bộ facility cũ và thay bằng danh sách mới
 *                 items:
 *                   type: string
 *                   format: uuid
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
 *                   $ref: '#/components/schemas/BuildingDetail'
 *       404:
 *         description: Không tìm thấy toà nhà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', buildingController.updateBuilding);

/**
 * @swagger
 * /api/buildings/{id}:
 *   delete:
 *     operationId: deleteBuilding
 *     summary: Xoá toà nhà (hard delete)
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
 *         description: Không tìm thấy toà nhà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', buildingController.deleteBuilding);

/**
 * @swagger
 * /api/buildings/{id}/status:
 *   patch:
 *     operationId: toggleBuildingStatus
 *     summary: Bật/Tắt trạng thái hoạt động của Building (toggle is_active)
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
 *                   $ref: '#/components/schemas/Building'
 *       404:
 *         description: Không tìm thấy building
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', buildingController.toggleBuildingStatus);

module.exports = router;
