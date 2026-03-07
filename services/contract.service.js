const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Contract = require('../models/contract.model');
const ContractTemplate = require('../models/contractTemplate.model');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Building = require('../models/building.model');
const RoomType = require('../models/roomType.model');
const CustomerProfile = require('../models/customerProfile.model');
const Booking = require('../models/booking.model');
const { ROLES } = require('../constants/roles');
const { RENTAL_TERMS } = require('../constants/booking');
const { SIGNATURE_EXPIRY_MS } = require('../constants/contract');
const { generateSequentialId } = require('../utils/generateId');
const { sendContractSigningEmail, sendManagerSigningEmail, sendContractActivatedEmail } = require('../utils/mail.util');
const { generateContractPdf } = require('../utils/pdf.util');
const auditService = require('./audit.service');

/* ── helpers ─────────────────────────────────────────────────── */

const TIMESTAMP_FIELDS = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];

const stripTimestamps = (obj) => {
    if (!obj) return obj;
    const plain = typeof obj.toJSON === 'function' ? obj.toJSON() : { ...obj };
    TIMESTAMP_FIELDS.forEach(f => delete plain[f]);
    return plain;
};

const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('vi-VN');
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Replace {{variable}} placeholders in HTML template with values.
 */
const renderTemplate = (htmlContent, fields) => {
    let rendered = htmlContent;
    for (const [key, value] of Object.entries(fields)) {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '');
    }
    return rendered;
};

/* ── queries ─────────────────────────────────────────────────── */

/**
 * Lấy danh sách hợp đồng.
 * - ADMIN: xem tất cả, bao gồm timestamps.
 * - BUILDING_MANAGER: chỉ xem hợp đồng trong tòa nhà mình, ẩn timestamps.
 */
const getAllContracts = async ({ page = 1, limit = 10, status, building_id, search } = {}, user) => {
    const offset = (page - 1) * limit;
    const where = {};
    const isAdmin = user.role === ROLES.ADMIN;

    if (status) where.status = status;
    if (search) {
        where[Op.or] = [
            { contract_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    // BM: force scope to their building
    if (!isAdmin && !user.building_id) {
        throw { status: 403, message: 'Building Manager chưa được gán tòa nhà.' };
    }
    const scopedBuildingId = isAdmin ? building_id : user.building_id;

    const include = [
        { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
            model: Room,
            as: 'room',
            attributes: ['id', 'room_number'],
            ...(scopedBuildingId ? { required: true } : {}),
            include: [{
                model: Building,
                as: 'building',
                ...(scopedBuildingId ? { where: { id: scopedBuildingId }, required: true } : {})
            }]
        }
    ];

    const { count, rows } = await Contract.findAndCountAll({
        where,
        include,
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
    });

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: isAdmin ? rows : rows.map(stripTimestamps)
    };
};

/**
 * Chi tiết hợp đồng.
 * - ADMIN: đầy đủ.
 * - BUILDING_MANAGER: chỉ xem nếu thuộc building mình, ẩn timestamps.
 * - RESIDENT / CUSTOMER: chỉ xem hợp đồng của mình.
 */
const getContractById = async (id, user) => {
    const contract = await Contract.findByPk(id, {
        include: [
            { model: User, as: 'customer' },
            { model: User, as: 'manager' },
            {
                model: Room,
                as: 'room',
                include: [{ model: Building, as: 'building' }]
            },
            { model: ContractTemplate, as: 'template' }
        ]
    });
    if (!contract) throw { status: 404, message: 'Contract not found' };

    // BM scope check
    if (user.role === ROLES.BUILDING_MANAGER) {
        if (!user.building_id) {
            throw { status: 403, message: 'Building Manager chưa được gán tòa nhà.' };
        }
        const contractBuildingId = contract.room?.building?.id;
        if (!contractBuildingId || contractBuildingId !== user.building_id) {
            throw { status: 403, message: 'Bạn không có quyền truy cập hợp đồng này (khác tòa nhà).' };
        }
        return stripTimestamps(contract);
    }

    // RESIDENT / CUSTOMER: only own contracts
    if (user.role === ROLES.RESIDENT || user.role === ROLES.CUSTOMER) {
        if (contract.customer_id !== user.id) {
            throw { status: 403, message: 'You do not have access to this contract' };
        }
    }

    return contract;
};

/**
 * Cập nhật thông tin hợp đồng (gia hạn, dời end_date, ...)
 * - ADMIN: update bất kì hợp đồng nào.
 * - BUILDING_MANAGER: chỉ update hợp đồng trong tòa nhà mình.
 * - Chỉ cho phép khi contract chưa ACTIVE.
 */
const updateContract = async (id, data, user) => {
    const contract = await Contract.findByPk(id, {
        include: [{
            model: Room,
            as: 'room',
            include: [{ model: Building, as: 'building' }]
        }]
    });
    if (!contract) throw { status: 404, message: 'Contract not found' };

    // BM scope check
    if (user.role === ROLES.BUILDING_MANAGER) {
        const contractBuildingId = contract.room?.building?.id;
        if (!contractBuildingId || contractBuildingId !== user.building_id) {
            throw { status: 403, message: 'You do not have permission to edit this contract' };
        }
    }

    return await contract.update(data);
};

/**
 * Lấy danh sách hợp đồng của tôi (RESIDENT / CUSTOMER)
 */
const getMyContracts = async (userId) => {
    return await Contract.findAll({
        where: { customer_id: userId },
        attributes: [
            'id', 'contract_number', 'status', 'start_date', 'end_date',
            'base_rent', 'deposit_amount', 'pdf_url', 'rendered_content',
            'customer_signed_at', 'manager_signed_at', 'signature_expires_at',
            'createdAt'
        ],
        include: [{
            model: Room,
            as: 'room',
            attributes: ['id', 'room_number', 'floor', 'thumbnail_url'],
            include: [
                { model: Building, as: 'building', attributes: ['id', 'name', 'address'] },
                { model: RoomType, as: 'room_type', attributes: ['id', 'name'] }
            ]
        }],
        order: [['createdAt', 'DESC']]
    });
};

/* ── contract creation ────────────────────────────── */

/**
 * Tạo hợp đồng từ booking(sau khi depóosit thanhành coông).
 *
 *   1. Lấy default contract template
 *   2. Lấy thông tin customer, room, building, manager
 *   3. Build dynamic_fields + rendered_content
 *   4. INSERT contract với status = PENDING_CUSTOMER_SIGNATURE
 *   5. Cập nhật booking.contract_id
 *
 * @param {string} bookingId - UUID của booking đã DEPOSIT_PAID
 * @returns {Object} contract instance
 */
const createContractFromBooking = async (bookingId) => {
    const transaction = await sequelize.transaction();

    try {
        // 1. Lấy booking + room + room_type + building
        const { RoomType } = sequelize.models;
        const booking = await Booking.findByPk(bookingId, {
            include: [{
                model: Room,
                as: 'room',
                include: [
                    { model: RoomType, as: 'room_type' },
                    { model: Building, as: 'building' }
                ]
            }],
            transaction
        });

        if (!booking) throw { status: 404, message: 'Booking not found' };
        if (booking.status !== 'DEPOSIT_PAID') {
            throw { status: 400, message: 'Booking is not in DEPOSIT_PAID status' };
        }

        const room = booking.room;
        const building = room.building;
        const roomType = room.room_type;

        // 2. Lấy customer + profile
        const customer = await User.findByPk(booking.customer_id, {
            include: [{ model: CustomerProfile, as: 'profile' }],
            transaction
        });
        if (!customer) throw { status: 404, message: 'Customer not found' };

        // 3. Lấy building manager
        const manager = await User.findOne({
            where: { building_id: building.id, role: ROLES.BUILDING_MANAGER, is_active: true },
            transaction
        });
        if (!manager) throw { status: 400, message: 'No active Building Manager found for this building' };

        // 4. Lấy default contract template
        const template = await ContractTemplate.findOne({
            where: { is_default: true, is_active: true },
            transaction
        });
        if (!template) throw { status: 400, message: 'No active default contract template found' };

        // 5. Tính toán dates + term/billing
        const durationMonths = booking.duration_months;
        const isIndefinite = durationMonths == null || durationMonths === RENTAL_TERMS.INDEFINITE;
        const startDate = booking.check_in_date;
        const endDate = isIndefinite ? null : addMonths(startDate, durationMonths);
        const termType = isIndefinite ? 'INDEFINITE' : 'FIXED_TERM';
        const billingCycle = durationMonths === RENTAL_TERMS.SEMI_ANNUALLY ? 'SEMI_ANNUALLY' : 'MONTHLY';

        // 6. Generate contract number
        const currentCount = await Contract.count({ transaction });
        const contractNumber = generateSequentialId('CON', currentCount);

        // 7. Build dynamic_fields
        const profile = customer.profile;
        const dynamicFields = {
            contract_number: contractNumber,
            start_date: formatDate(startDate),
            end_date: endDate ? formatDate(endDate) : 'Không xác định',
            building_address: building.address || '',
            building_name: building.name,
            manager_name: `${manager.last_name || ''} ${manager.first_name || ''}`.trim(),
            customer_name: `${customer.last_name || ''} ${customer.first_name || ''}`.trim(),
            customer_date_of_birth: formatDate(profile?.date_of_birth),
            customer_gender: profile?.gender || '',
            customer_phone: customer.phone || '',
            customer_email: customer.email || '',
            customer_permanent_address: profile?.permanent_address || '',
            customer_emergency_contact_name: profile?.emergency_contact_name || '',
            customer_emergency_contact_phone: profile?.emergency_contact_phone || '',
            room_number: room.room_number,
            room_type: roomType?.name || '',
            term_type: isIndefinite ? 'Không thời hạn' : 'Có thời hạn',
            base_rent: formatCurrency(roomType?.base_price || 0),
            deposit_amount: formatCurrency(booking.deposit_amount)
            // NOTE: Do NOT include manager_signature / customer_signature here.
            // The {{customer_signature}} and {{manager_signature}} placeholders
            // must remain in rendered_content so customerSign / managerSign can
            // replace them with <img> tags when the parties actually sign.
        };

        // 8. Render HTML from template
        const renderedContent = renderTemplate(template.content, dynamicFields);

        // 9. Create contract
        const contract = await Contract.create({
            contract_number: contractNumber,
            template_id: template.id,
            room_id: room.id,
            customer_id: customer.id,
            manager_id: manager.id,
            term_type: termType,
            start_date: startDate,
            end_date: endDate,
            base_rent: roomType?.base_price || 0,
            deposit_amount: booking.deposit_amount,
            billing_cycle: billingCycle,
            dynamic_fields: dynamicFields,
            rendered_content: renderedContent,
            status: 'PENDING_CUSTOMER_SIGNATURE',
            signature_expires_at: new Date(Date.now() + SIGNATURE_EXPIRY_MS)
        }, { transaction });

        // 10. Link booking to contract
        await booking.update({ contract_id: contract.id }, { transaction });

        await transaction.commit();

        // Send signing email with direct link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const signingUrl = `${clientUrl}/sign?contractId=${contract.id}`;

        await sendContractSigningEmail(customer.email, {
            customerName: dynamicFields.customer_name,
            contractNumber,
            roomNumber: room.room_number,
            buildingName: building.name,
            signingUrl
        }).catch(err => console.error('[ContractService] Failed to send signing email:', err));

        return contract;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* ── contract signing ────────────────────────────────────────── */

/**
 * Customer / Resident ký hợp đồng.
 *
 *   1. Verify status = PENDING_CUSTOMER_SIGNATURE
 *   2. Verify user owns the contract
 *   3. Set customer_signature_url + customer_signed_at
 *   4. Update rendered_content with signature image
 *   5. Status → PENDING_MANAGER_SIGNATURE
 *   6. Audit log
 */
const customerSign = async (contractId, signatureUrl, user, req) => {
    const contract = await Contract.findByPk(contractId, {
        include: [{
            model: Room,
            as: 'room',
            include: [{ model: Building, as: 'building' }]
        }]
    });
    if (!contract) throw { status: 404, message: 'Contract not found' };

    if (contract.status !== 'PENDING_CUSTOMER_SIGNATURE') {
        throw { status: 400, message: 'Contract is not awaiting customer signature' };
    }

    if (contract.signature_expires_at && new Date() > new Date(contract.signature_expires_at)) {
        throw { status: 400, message: 'Signing deadline has expired' };
    }

    if (contract.customer_id !== user.id) {
        throw { status: 403, message: 'You do not have permission to sign this contract' };
    }

    const oldStatus = contract.status;

    // Update rendered_content: replace customer_signature placeholder with <img>
    const signatureImg = `<img src="${signatureUrl}" alt="Customer Signature" style="width:200px;height:80px;object-fit:contain" />`;
    let updatedContent = contract.rendered_content || '';
    updatedContent = updatedContent.replace('{{customer_signature}}', signatureImg);

    await contract.update({
        customer_signature_url: signatureUrl,
        customer_signed_at: new Date(),
        rendered_content: updatedContent,
        status: 'PENDING_MANAGER_SIGNATURE',
        signature_expires_at: new Date(Date.now() + SIGNATURE_EXPIRY_MS)
    });

    // Audit log
    await auditService.log({
        user,
        action: 'SIGN',
        entityType: 'contract',
        entityId: contract.id,
        oldValue: { status: oldStatus },
        newValue: { status: 'PENDING_MANAGER_SIGNATURE', customer_signature_url: signatureUrl },
        req
    });

    // Send email to Building Manager to sign
    const manager = await User.findByPk(contract.manager_id);
    const customer = await User.findByPk(contract.customer_id);
    if (manager && customer) {
        const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
        const signingUrl = `${adminUrl}/building-manager/contracts?sign=${contract.id}`;
        const customerName = `${customer.last_name || ''} ${customer.first_name || ''}`.trim();
        const managerName = `${manager.last_name || ''} ${manager.first_name || ''}`.trim();

        await sendManagerSigningEmail(manager.email, {
            managerName,
            customerName,
            contractNumber: contract.contract_number,
            roomNumber: contract.room?.room_number || '',
            buildingName: contract.room?.building?.name || '',
            signingUrl
        }).catch(err => console.error('[ContractService] Failed to send manager signing email:', err));
    }

    return contract;
};

/**
 * Building Manager ký hợp đồng (bước cuối → ACTIVE).
 *
 *   1. Verify status = PENDING_MANAGER_SIGNATURE
 *   2. Verify BM manages the building
 *   3. Set manager_signature_url + manager_signed_at
 *   4. Update rendered_content with signature image
 *   5. Status → ACTIVE
 *   6. Room → OCCUPIED
 *   7. User role: CUSTOMER → RESIDENT
 *   8. Booking → CONVERTED
 *   9. Set next_billing_date
 *   10. Audit log
 */
const managerSign = async (contractId, signatureUrl, user, req) => {
    const transaction = await sequelize.transaction();

    try {
        const contract = await Contract.findByPk(contractId, {
            include: [{
                model: Room,
                as: 'room',
                include: [{ model: Building, as: 'building' }]
            }],
            transaction
        });
        if (!contract) throw { status: 404, message: 'Contract not found' };

        if (contract.status !== 'PENDING_MANAGER_SIGNATURE') {
            throw { status: 400, message: 'Contract is not awaiting manager signature' };
        }

        if (contract.signature_expires_at && new Date() > new Date(contract.signature_expires_at)) {
            throw { status: 400, message: 'Signing deadline has expired' };
        }

        // BM scope check
        const contractBuildingId = contract.room?.building?.id;
        if (!contractBuildingId || contractBuildingId !== user.building_id) {
            throw { status: 403, message: 'You do not have permission to sign this contract' };
        }

        const oldStatus = contract.status;

        // Update rendered_content: replace manager_signature placeholder with <img>
        const signatureImg = `<img src="${signatureUrl}" alt="Manager Signature" style="width:200px;height:80px;object-fit:contain" />`;
        let updatedContent = contract.rendered_content || '';
        updatedContent = updatedContent.replace('{{manager_signature}}', signatureImg);

        // Calculate next_billing_date (1 month from start_date for MONTHLY & UNLIMITED)
        const nextBillingDate = addMonths(contract.start_date, contract.billing_cycle === 'SEMI_ANNUALLY' ? 6 : 1);

        // 1. Update contract → ACTIVE
        await contract.update({
            manager_signature_url: signatureUrl,
            manager_signed_at: new Date(),
            rendered_content: updatedContent,
            status: 'ACTIVE',
            next_billing_date: nextBillingDate,
            signature_expires_at: null
        }, { transaction });

        // 2. Room → OCCUPIED
        const room = await Room.findByPk(contract.room_id, { transaction });
        if (room) {
            await room.update({ status: 'OCCUPIED' }, { transaction });
        }

        // 3. Customer → RESIDENT (if currently CUSTOMER)
        const customer = await User.findByPk(contract.customer_id, { transaction });
        if (customer && customer.role === ROLES.CUSTOMER) {
            await customer.update({
                role: ROLES.RESIDENT,
                building_id: contractBuildingId
            }, { transaction });
        }

        // 4. Booking → CONVERTED
        const booking = await Booking.findOne({
            where: { contract_id: contract.id },
            transaction
        });
        if (booking) {
            await booking.update({
                status: 'CONVERTED',
                converted_at: new Date()
            }, { transaction });
        }

        // 5. Audit log
        await auditService.log({
            user,
            action: 'SIGN',
            entityType: 'contract',
            entityId: contract.id,
            oldValue: { status: oldStatus },
            newValue: { status: 'ACTIVE', manager_signature_url: signatureUrl },
            req
        }, { transaction });

        await transaction.commit();

        // Generate final PDF and upload to Cloudinary (async, non-blocking)
        generateContractPdf(contract.rendered_content, contract.contract_number)
            .then(async (pdfUrl) => {
                await Contract.update({ pdf_url: pdfUrl }, { where: { id: contract.id } });
                console.log(`[ContractService] PDF generated: ${pdfUrl}`);
            })
            .catch(err => console.error('[ContractService] Failed to generate PDF:', err));

        // Send activation confirmation email to resident
        const customerForEmail = await User.findByPk(contract.customer_id);
        if (customerForEmail) {
            const customerName = `${customerForEmail.last_name || ''} ${customerForEmail.first_name || ''}`.trim();
            await sendContractActivatedEmail(customerForEmail.email, {
                customerName,
                contractNumber: contract.contract_number,
                roomNumber: contract.room?.room_number || '',
                buildingName: contract.room?.building?.name || '',
                startDate: formatDate(contract.start_date)
            }).catch(err => console.error('[ContractService] Failed to send activation email:', err));
        }

        return contract;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    getAllContracts,
    getContractById,
    getMyContracts,
    createContractFromBooking,
    customerSign,
    managerSign,
    updateContract
};
