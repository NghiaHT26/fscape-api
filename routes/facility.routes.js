const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const facilityController = require('../controllers/facility.controller')
const authJwt = require('../middlewares/authJwt')
const requireRoles = require('../middlewares/requireRoles')
const { ROLES } = require('../constants/roles')

/**
 * @swagger
 * tags:
 *   - name: Facilities
 */

/**
 * @swagger
 * /api/facilities:
 *   get:
 *     operationId: getAllFacilities
 *     summary: Lấy danh sách tiện ích (phân trang + lọc)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
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
 *         description: Tìm kiếm theo tên tiện ích (iLike)
 *       - in: query
 *         name: building_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc chỉ các facility thuộc building này (join qua building_facilities)
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Lấy danh sách tiện ích thành công
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
 *                     $ref: '#/components/schemas/Facility'
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
  facilityController.getAllFacilities
)

/**
 * @swagger
 * /api/facilities/{id}:
 *   get:
 *     operationId: getFacilityById
 *     summary: Lấy chi tiết tiện ích theo ID (kèm danh sách buildings đang sử dụng)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
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
 *                   $ref: '#/components/schemas/FacilityDetail'
 *       404:
 *         description: Không tìm thấy tiện ích
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
  facilityController.getFacilityById
)

/**
 * @swagger
 * /api/facilities:
 *   post:
 *     summary: Tạo tiện ích mới (có upload ảnh)
 *     description: >
 *       Required Roles: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Gym"
 *               description:
 *                 type: string
 *                 example: "Phòng tập thể dục"
 *               image_url:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh đại diện tiện ích
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thiếu dữ liệu
 *       409:
 *         description: Tên đã tồn tại
 */
router.post(
  '/',
  authJwt,
  requireRoles(ROLES.ADMIN),
  upload.single('image_url'),
  facilityController.createFacility
)

/**
 * @swagger
 * /api/facilities/{id}:
 *   put:
 *     summary: Cập nhật tiện ích (có thể upload lại ảnh)
 *     description: >
 *       Required Roles: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
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
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: binary
 *               is_active:
 *                 type: boolean
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN),
  upload.single('image_url'),
  facilityController.updateFacility
)

/**
 * @swagger
 * /api/facilities/{id}:
 *   delete:
 *     summary: Xoá tiện ích
 *     description: >
 *       Required Roles: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy
 */
router.delete(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN),
  facilityController.deleteFacility
)

/**
 * @swagger
 * /api/facilities/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái tiện ích
 *     description: >
 *       Required Roles: [ADMIN]
 *     security:
 *       - bearerAuth: []
 *     tags: [Facilities]
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
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Trạng thái cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.patch(
  '/:id/status',
  authJwt,
  requireRoles(ROLES.ADMIN),
  facilityController.updateFacilityStatus
)

module.exports = router
