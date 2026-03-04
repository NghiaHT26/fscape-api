const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authJwt = require('../middlewares/authJwt');

/**
 * @swagger
 * tags:
 *   - name: Contracts
 *     description: Quản lý hợp đồng thuê phòng
 */

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     operationId: getAllContracts
 *     summary: Lấy danh sách hợp đồng (phân trang + lọc theo status, building, search)
 *     tags: [Contracts]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING_CUSTOMER_SIGNATURE, PENDING_MANAGER_SIGNATURE, ACTIVE, EXPIRING_SOON, FINISHED, TERMINATED]
 *         description: Lọc theo trạng thái hợp đồng
 *       - in: query
 *         name: building_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo toà nhà (join qua room.building)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo contract_number (iLike)
 *     responses:
 *       200:
 *         description: Danh sách hợp đồng
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
 *                     $ref: '#/components/schemas/ContractListItem'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', contractController.getAllContracts);

/**
 * @swagger
 * /api/contracts/my:
 *   get:
 *     operationId: getMyContracts
 *     summary: Lấy danh sách hợp đồng của tôi
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/my', authJwt, contractController.getMyContracts);

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     operationId: getContractById
 *     summary: Lấy chi tiết hợp đồng theo ID (kèm customer, manager, room.building, template)
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chi tiết hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ContractDetail'
 *       404:
 *         description: Không tìm thấy hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', contractController.getContractById);

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     operationId: createContract
 *     summary: Tạo hợp đồng mới (status tự động là DRAFT, contract_number tự sinh)
 *     description: >
 *       Phòng phải có status = AVAILABLE.
 *       Contract_number tự động sinh theo format CON-{year}-{sequence}.
 *     tags: [Contracts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - customer_id
 *               - start_date
 *               - base_rent
 *               - deposit_amount
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               manager_id:
 *                 type: string
 *                 format: uuid
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               term_type:
 *                 type: string
 *                 enum: [FIXED_TERM, INDEFINITE]
 *                 default: FIXED_TERM
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2027-03-31"
 *                 description: Null nếu term_type = INDEFINITE
 *               base_rent:
 *                 type: number
 *                 example: 3500000
 *               deposit_amount:
 *                 type: number
 *                 example: 3500000
 *               billing_cycle:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, SEMI_ANNUALLY, ANNUALLY]
 *                 default: MONTHLY
 *     responses:
 *       201:
 *         description: Tạo hợp đồng thành công (DRAFT)
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
 *                   $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Thiếu trường bắt buộc hoặc phòng không available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', contractController.createContract);

/**
 * @swagger
 * /api/contracts/{id}:
 *   put:
 *     operationId: updateContract
 *     summary: Cập nhật hợp đồng (chỉ cho phép khi status là DRAFT hoặc PENDING_*)
 *     description: >
 *       Không cho phép chỉnh sửa nếu hợp đồng đã ACTIVE hoặc FINISHED.
 *     tags: [Contracts]
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
 *               term_type:
 *                 type: string
 *                 enum: [FIXED_TERM, INDEFINITE]
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               base_rent:
 *                 type: number
 *               deposit_amount:
 *                 type: number
 *               billing_cycle:
 *                 type: string
 *                 enum: [MONTHLY, QUARTERLY, SEMI_ANNUALLY, ANNUALLY]
 *               customer_signature_url:
 *                 type: string
 *               manager_signature_url:
 *                 type: string
 *               rendered_content:
 *                 type: string
 *               pdf_url:
 *                 type: string
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
 *                   $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Body rỗng hoặc hợp đồng đã ACTIVE/FINISHED
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', contractController.updateContract);

/**
 * @swagger
 * /api/contracts/{id}:
 *   delete:
 *     operationId: deleteContract
 *     summary: Xoá hợp đồng (chỉ cho phép nếu status = DRAFT)
 *     tags: [Contracts]
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
 *       400:
 *         description: Chỉ hợp đồng nháp (DRAFT) mới được xoá
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', contractController.deleteContract);

/**
 * @swagger
 * /api/contracts/{id}/approve:
 *   patch:
 *     operationId: approveContract
 *     summary: Duyệt hợp đồng (chuyển sang ACTIVE, tự động cập nhật room.status = OCCUPIED)
 *     description: >
 *       Yêu cầu xác thực admin. manager_id được lấy từ req.user.id (auth middleware).
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Duyệt thành công - hợp đồng ACTIVE và phòng chuyển sang OCCUPIED
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
 *                   $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Không tìm thấy hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server (có thể do chưa có auth middleware)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/approve', authJwt, contractController.approveContract);

module.exports = router;
