const express = require('express')
const router = express.Router()
const roomTypeController = require('../controllers/roomType.controller')
const authJwt = require('../middlewares/authJwt')
const requireRole = require('../middlewares/requireRole')

/**
 * @swagger
 * tags:
 *   - name: RoomTypes
 *     description: Quản lý loại phòng
 */

/**
 * @swagger
 * /api/room-types:
 *   get:
 *     operationId: getAllRoomTypes
 *     summary: Lấy danh sách loại phòng (phân trang + lọc)
 *     tags: [RoomTypes]
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên loại phòng (iLike)
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
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
 *                     $ref: '#/components/schemas/RoomType'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', roomTypeController.getAllRoomTypes)

/**
 * @swagger
 * /api/room-types/{id}:
 *   get:
 *     operationId: getRoomTypeById
 *     summary: Lấy chi tiết loại phòng theo ID (ADMIN, BUILDING_MANAGER)
 *     tags: [RoomTypes]
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
 *                   $ref: '#/components/schemas/RoomType'
 *       404:
 *         description: Không tìm thấy loại phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authJwt, requireRole('ADMIN', 'BUILDING_MANAGER'), roomTypeController.getRoomTypeById)

/**
 * @swagger
 * /api/room-types:
 *   post:
 *     operationId: createRoomType
 *     summary: Tạo loại phòng mới (ADMIN only)
 *     tags: [RoomTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - base_price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Studio Deluxe"
 *               description:
 *                 type: string
 *                 example: "Phòng cao cấp"
 *               base_price:
 *                 type: number
 *                 minimum: 0
 *                 example: 3500000
 *               deposit_months:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               capacity_min:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *                 description: Phải <= capacity_max
 *               capacity_max:
 *                 type: integer
 *                 default: 1
 *                 example: 2
 *                 description: Phải >= capacity_min
 *               bedrooms:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               bathrooms:
 *                 type: integer
 *                 default: 1
 *                 example: 1
 *               area_sqm:
 *                 type: number
 *                 example: 28.5
 *                 description: Diện tích m²
 *               is_active:
 *                 type: boolean
 *                 default: true
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
 *                   $ref: '#/components/schemas/RoomType'
 *       400:
 *         description: "Validation lỗi: base_price < 0 hoặc capacity_min > capacity_max"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authJwt, requireRole('ADMIN'), roomTypeController.createRoomType)

/**
 * @swagger
 * /api/room-types/{id}:
 *   put:
 *     operationId: updateRoomType
 *     summary: Cập nhật loại phòng (ADMIN only)
 *     tags: [RoomTypes]
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
 *               base_price:
 *                 type: number
 *                 minimum: 0
 *               deposit_months:
 *                 type: integer
 *               capacity_min:
 *                 type: integer
 *               capacity_max:
 *                 type: integer
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               area_sqm:
 *                 type: number
 *               is_active:
 *                 type: boolean
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
 *                   $ref: '#/components/schemas/RoomType'
 *       400:
 *         description: "Validation lỗi: base_price < 0 hoặc capacity_min > capacity_max"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy loại phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authJwt, requireRole('ADMIN'), roomTypeController.updateRoomType)

/**
 * @swagger
 * /api/room-types/{id}:
 *   delete:
 *     operationId: deleteRoomType
 *     summary: Vô hiệu hoá loại phòng (ADMIN only)
 *     tags: [RoomTypes]
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
 *         description: Vô hiệu hoá thành công
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
 *         description: Không tìm thấy loại phòng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authJwt, requireRole('ADMIN'), roomTypeController.deleteRoomType)

module.exports = router
