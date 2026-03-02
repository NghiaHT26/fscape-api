/**
 * @swagger
 * components:
 *   schemas:
 *
 *     # ── Common ────────────────────────────────────────────
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Mô tả lỗi"
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 50
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     # ── User ────────────────────────────────────────────
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF, CUSTOMER]
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         avatar_url:
 *           type: string
 *           nullable: true
 *         building_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_active:
 *           type: boolean
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, STAFF, CUSTOMER]
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone:
 *           type: string
 *         avatar_url:
 *           type: string
 *           nullable: true
 *         building_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_active:
 *           type: boolean
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     # ── Location ──────────────────────────────────────────
 *
 *     Location:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Hà Nội"
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     LocationDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Location'
 *         - type: object
 *           properties:
 *             buildings:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BuildingSummary'
 *             universities:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UniversitySummary'
 *
 *     # ── University ────────────────────────────────────────
 *
 *     UniversitySummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *
 *     University:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         location_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Đại học Bách Khoa Hà Nội"
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         location:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *
 *     UniversityDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/University'
 *         - type: object
 *           properties:
 *             nearby_buildings:
 *               type: array
 *               description: Các toà nhà lân cận cùng location
 *               items:
 *                 $ref: '#/components/schemas/BuildingSummary'
 *
 *     # ── Building ──────────────────────────────────────────
 *
 *     BuildingSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         thumbnail_url:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *
 *     Building:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         location_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Toà nhà A"
 *         address:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         description:
 *           type: string
 *         total_floors:
 *           type: integer
 *         thumbnail_url:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         location:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               image_url:
 *                 type: string
 *         facilities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Facility'
 *
 *     BuildingDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Building'
 *         - type: object
 *           properties:
 *             nearby_universities:
 *               type: array
 *               description: Các trường đại học lân cận cùng location
 *               items:
 *                 $ref: '#/components/schemas/UniversitySummary'
 *
 *     # ── Facility ──────────────────────────────────────────
 *
 *     Facility:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Phòng gym"
 *         image_url:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     FacilityDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Facility'
 *         - type: object
 *           properties:
 *             buildings:
 *               type: array
 *               description: Danh sách toà nhà đang sử dụng tiện ích này
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   BuildingFacility:
 *                     type: object
 *                     properties:
 *                       is_active:
 *                         type: boolean
 *
 *     # ── BuildingFacility ──────────────────────────────────
 *
 *     BuildingFacility:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         facility_id:
 *           type: string
 *           format: uuid
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     # ── RoomType ──────────────────────────────────────────
 *
 *     RoomType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Studio Deluxe"
 *         description:
 *           type: string
 *         base_price:
 *           type: number
 *           example: 3500000
 *         deposit_months:
 *           type: integer
 *           example: 1
 *         capacity_min:
 *           type: integer
 *           example: 1
 *         capacity_max:
 *           type: integer
 *           example: 2
 *         bedrooms:
 *           type: integer
 *           example: 1
 *         bathrooms:
 *           type: integer
 *           example: 1
 *         area_sqm:
 *           type: number
 *           example: 28.5
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     # ── Room ──────────────────────────────────────────────
 *
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         room_type_id:
 *           type: string
 *           format: uuid
 *         room_number:
 *           type: string
 *           example: "101"
 *         floor:
 *           type: integer
 *           example: 1
 *         thumbnail_url:
 *           type: string
 *         image_3d_url:
 *           type: string
 *         blueprint_url:
 *           type: string
 *         status:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, LOCKED]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         building:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             address:
 *               type: string
 *         room_type:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             base_price:
 *               type: number
 *             deposit_months:
 *               type: integer
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               image_url:
 *                 type: string
 *         assets:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *               qr_code:
 *                 type: string
 *
 *     # ── RoomImage ─────────────────────────────────────────
 *
 *     RoomImage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         room_id:
 *           type: string
 *           format: uuid
 *         image_url:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     # ── Asset ─────────────────────────────────────────────
 *
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         building_id:
 *           type: string
 *           format: uuid
 *         qr_code:
 *           type: string
 *           example: "QR-ROOM-001"
 *         name:
 *           type: string
 *           example: "Máy lạnh"
 *         price:
 *           type: number
 *           example: 3500000
 *         status:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *         current_room_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         notes:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         building:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *         room:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             room_number:
 *               type: string
 *
 *     AssetDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Asset'
 *         - type: object
 *           properties:
 *             histories:
 *               type: array
 *               description: 10 bản ghi lịch sử gần nhất
 *               items:
 *                 $ref: '#/components/schemas/AssetHistory'
 *
 *     AssetHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         asset_id:
 *           type: string
 *           format: uuid
 *         from_room_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         to_room_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         from_status:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *         to_status:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE]
 *         action:
 *           type: string
 *           enum: [INITIAL_CREATE, UPDATE_INFO, CHECK_IN, CHECK_OUT, MAINTENANCE_START, MAINTENANCE_END]
 *         performed_by:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         notes:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     # ── Contract ──────────────────────────────────────────
 *
 *     Contract:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         contract_number:
 *           type: string
 *           example: "CON-2026-0001"
 *         template_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         room_id:
 *           type: string
 *           format: uuid
 *         customer_id:
 *           type: string
 *           format: uuid
 *         manager_id:
 *           type: string
 *           format: uuid
 *         term_type:
 *           type: string
 *           enum: [FIXED_TERM, INDEFINITE]
 *         start_date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         base_rent:
 *           type: number
 *           example: 3500000
 *         deposit_amount:
 *           type: number
 *           example: 3500000
 *         billing_cycle:
 *           type: string
 *           enum: [MONTHLY, QUARTERLY, SEMI_ANNUALLY, ANNUALLY]
 *         status:
 *           type: string
 *           enum: [DRAFT, PENDING_CUSTOMER_SIGNATURE, PENDING_MANAGER_SIGNATURE, ACTIVE, EXPIRING_SOON, FINISHED, TERMINATED]
 *         customer_signature_url:
 *           type: string
 *           nullable: true
 *         manager_signature_url:
 *           type: string
 *           nullable: true
 *         rendered_content:
 *           type: string
 *           nullable: true
 *           description: Snapshot HTML nội dung hợp đồng lúc ký
 *         pdf_url:
 *           type: string
 *           nullable: true
 *           description: File PDF hợp đồng cuối cùng
 *         next_billing_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         last_billed_date:
 *           type: string
 *           format: date
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     ContractListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Contract'
 *         - type: object
 *           properties:
 *             customer:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 email:
 *                   type: string
 *             room:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 room_number:
 *                   type: string
 *
 *     ContractDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Contract'
 *         - type: object
 *           properties:
 *             customer:
 *               type: object
 *               description: Thông tin đầy đủ bên thuê
 *             manager:
 *               type: object
 *               description: Thông tin đầy đủ bên cho thuê
 *             room:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 room_number:
 *                   type: string
 *                 building:
 *                   $ref: '#/components/schemas/BuildingSummary'
 *             template:
 *               type: object
 *               nullable: true
 *               description: Mẫu hợp đồng được sử dụng
 */
