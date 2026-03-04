const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const requestController = require('../controllers/request.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

/**
 * @swagger
 * tags:
 *   - name: Requests
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     operationId: getAllRequests
 *     summary: Lấy danh sách Request (Phân quyền cho Manager & Staff)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Requests
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ASSIGNED, PRICE_PROPOSED, APPROVED, IN_PROGRESS, DONE, COMPLETED, REVIEWED, REFUNDED, CANCELLED]
 *       - in: query
 *         name: request_type
 *         schema:
 *           type: string
 *           enum: [REPAIR, CLEANING, COMPLAINT, ASSET_CHANGE, CHECKOUT, OTHER]
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: assigned_staff_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Dùng cho Staff lọc task của chính mình
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Thành công
 *       500:
 *         description: Lỗi server
 */
router.get(
  '/',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
  requestController.getAllRequests
);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     operationId: getRequestById
 *     summary: Lấy chi tiết 1 Request (kèm lịch sử trạng thái & hình ảnh)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT, CUSTOMER]
 *       Dữ liệu trả về sẽ được lọc tự động dựa trên quyền hạn của người dùng (Ví dụ: Resident chỉ thấy dữ liệu của mình, Manager thấy dữ liệu trong tòa nhà).
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Requests
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
 *       404:
 *         description: Không tìm thấy
 */
router.get(
  '/:id',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT, ROLES.CUSTOMER),
  requestController.getRequestById
);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     operationId: createRequest
 *     summary: Tạo Request mới (Thường do Resident tạo)
 *     description: >
 *       Required Roles: [RESIDENT, CUSTOMER]
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Requests
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - resident_id
 *               - request_type
 *               - title
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *               resident_id:
 *                 type: string
 *                 format: uuid
 *               request_type:
 *                 type: string
 *                 enum: [REPAIR, CLEANING, COMPLAINT, ASSET_CHANGE, CHECKOUT, OTHER]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               related_asset_id:
 *                 type: string
 *                 format: uuid
 *                 description: Asset ID nếu là yêu cầu sửa chữa tài sản
 *               custom_item_description:
 *                 type: string
 *                 description: Mô tả tài sản nếu không chọn từ danh sách Asset
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hình ảnh đính kèm (Tối đa 5 ảnh)
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       201:
 *         description: Tạo Request thành công (status mặc định là PENDING)
 */
router.post(
  '/',
  authJwt,
  requireRoles(ROLES.RESIDENT, ROLES.CUSTOMER),
  upload.array('images', 5),
  requestController.createRequest
);

/**
 * @swagger
 * /api/requests/{id}/assign:
 *   patch:
 *     operationId: assignRequest
 *     summary: Manager giao Request cho Staff
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER]
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Requests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của Request (vừa được tạo ở bước 1)
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_staff_id
 *               - manager_id
 *             properties:
 *               manager_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID của Quản lý tòa nhà (Manager) để ghi log
 *               assigned_staff_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID của Nhân viên kỹ thuật (Staff)
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Đã giao việc thành công (status chuyển sang ASSIGNED)
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy Request
 *       500:
 *         description: Lỗi server
 */
router.patch(
  '/:id/assign',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
  upload.none(),
  requestController.assignRequest
);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   patch:
 *     operationId: updateRequestStatus
 *     summary: Cập nhật tiến độ xử lý của Request (Staff / Resident)
 *     description: >
 *       Required Roles: [ADMIN, BUILDING_MANAGER, STAFF, RESIDENT]
 *       Tác vụ: Staff cập nhật tiến độ, Resident nghiệm thu/đánh giá
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Requests
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - changed_by
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PRICE_PROPOSED
 *                   - APPROVED
 *                   - IN_PROGRESS
 *                   - DONE
 *                   - COMPLETED
 *                   - REVIEWED
 *                   - REFUNDED
 *                   - CANCELLED
 *               changed_by:
 *                 type: string
 *                 format: uuid
 *                 description: ID người thay đổi trạng thái (Staff hoặc Resident)
 *               service_price:
 *                 type: number
 *                 description: Staff nhập khi báo giá (PRICE_PROPOSED)
 *               completion_note:
 *                 type: string
 *                 description: Staff nhập khi hoàn thành (DONE)
 *               report_reason:
 *                 type: string
 *                 description: Resident nhập khi không hài lòng (REVIEWED)
 *               feedback_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Resident vote sao (1-5) khi COMPLETED
 *               feedback_comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Staff upload ảnh nghiệm thu (DONE)
 *     responses:
 *       403:
 *         description: Không có quyền truy cập (Forbidden)
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.patch(
  '/:id/status',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT),
  upload.array('images', 5),
  requestController.updateRequestStatus
);

module.exports = router;