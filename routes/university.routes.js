const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
/**
 * @swagger
 * tags:
 *   - name: Universities
 *     description: Quản lý trường đại học (thuộc Location)
 */

/**
 * @swagger
 * /api/universities:
 *   get:
 *     operationId: getAllUniversities
 *     summary: Lấy danh sách trường đại học (phân trang + lọc)
 *     description: |
 *       Required Roles: ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy trong toà nhà của mình).
 *     tags: [Universities]
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
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hoạt động
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên trường (iLike)
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
 *                     $ref: '#/components/schemas/University'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
    universityController.getAllUniversities
);

/**
 * @swagger
 * /api/universities/{id}:
 *   get:
 *     operationId: getUniversityById
 *     summary: Lấy chi tiết trường theo ID (kèm nearby_buildings cùng location)
 *     tags: [Universities]
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
 *                   $ref: '#/components/schemas/UniversityDetail'
 *       404:
 *         description: Không tìm thấy trường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
    universityController.getUniversityById
);

/**
 * @swagger
 * /api/universities:
 *   post:
 *     operationId: createUniversity
 *     summary: Tạo trường đại học mới
 *     description: |
 *       Required Roles: ADMIN
 *     tags: [Universities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location_id
 *               - name
 *             properties:
 *               location_id:
 *                 type: string
 *                 format: uuid
 *                 example: "18358331-e3ae-41b3-ae4d-965f7b676804"
 *               name:
 *                 type: string
 *                 example: "Đại học Bách Khoa Hà Nội"
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 example: 21.005
 *               longitude:
 *                 type: number
 *                 example: 105.845
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
 *                 data:
 *                   $ref: '#/components/schemas/University'
 *       400:
 *         description: Thiếu name hoặc location_id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên trường đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    authJwt,
    requireRoles(ROLES.ADMIN),
    universityController.createUniversity
);

/**
 * @swagger
 * /api/universities/{id}:
 *   put:
 *     operationId: updateUniversity
 *     summary: Cập nhật trường đại học
 *     description: |
 *       Required Roles: ADMIN
 *     tags: [Universities]
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
 *                 data:
 *                   $ref: '#/components/schemas/University'
 *       404:
 *         description: Không tìm thấy trường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tên trường đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN),
    universityController.updateUniversity
);

/**
 * @swagger
 * /api/universities/{id}:
 *   delete:
 *     operationId: deleteUniversity
 *     summary: Xoá trường đại học (hard delete)
 *     tags: [Universities]
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
 *         description: Không tìm thấy trường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    authJwt,
    requireRoles(ROLES.ADMIN),
    universityController.deleteUniversity
);

/**
 * @swagger
 * /api/universities/{id}/status:
 *   patch:
 *     operationId: toggleUniversityStatus
 *     summary: Bật/Tắt trạng thái hoạt động của University (toggle is_active)
 *     tags: [Universities]
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
 *                   $ref: '#/components/schemas/University'
 *       404:
 *         description: Không tìm thấy university
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:id/status',
    authJwt,
    requireRoles(ROLES.ADMIN),
    universityController.toggleUniversityStatus
);

module.exports = router;
