const { Op } = require('sequelize');
const Contract = require('../models/contract.model');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Building = require('../models/building.model');
const ContractTemplate = require('../models/contractTemplate.model');
const { ROLES } = require('../constants/roles');

/* ── helpers ─────────────────────────────────────────────────── */

const TIMESTAMP_FIELDS = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];

/**
 * Strip timestamps from a Sequelize instance plain object.
 */
const stripTimestamps = (obj) => {
    if (!obj) return obj;
    const plain = typeof obj.toJSON === 'function' ? obj.toJSON() : { ...obj };
    TIMESTAMP_FIELDS.forEach(f => delete plain[f]);
    return plain;
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
    const scopedBuildingId = isAdmin ? building_id : user.building_id;

    const include = [
        { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
            model: Room,
            as: 'room',
            attributes: ['id', 'room_number'],
            include: [{
                model: Building,
                as: 'building',
                ...(scopedBuildingId ? { where: { id: scopedBuildingId } } : {})
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
 * - RESIDENT: chỉ xem hợp đồng của mình.
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
        const contractBuildingId = contract.room?.building?.id;
        if (!contractBuildingId || contractBuildingId !== user.building_id) {
            throw { status: 403, message: 'You do not have access to this contract' };
        }
        return stripTimestamps(contract);
    }

    // RESIDENT: only own contracts
    if (user.role === ROLES.RESIDENT || user.role === ROLES.CUSTOMER) {
        if (contract.customer_id !== user.id) {
            throw { status: 403, message: 'You do not have access to this contract' };
        }
    }

    return contract;
};

/**
 * Cập nhật trạng thái hợp đồng (Duyệt hoặc Hủy)
 */
const updateContractStatus = async (id, status, manager_id = null) => {
    const contract = await Contract.findByPk(id);
    if (!contract) throw { status: 404, message: 'Contract not found' };

    if (status === 'ACTIVE') {
        if (manager_id) contract.manager_id = manager_id;
        const room = await Room.findByPk(contract.room_id);
        if (room) await room.update({ status: 'OCCUPIED' });
    }

    return await contract.update({ status });
};

/**
 * Tạo hợp đồng (hệ thống gọi nội bộ — không expose qua route)
 */
const createContract = async (data) => {
    const { room_id } = data;

    const room = await Room.findByPk(room_id);
    if (!room || room.status !== 'AVAILABLE') {
        throw { status: 400, message: 'Room is not available for booking' };
    }

    const count = await Contract.count() + 1;
    const contract_number = `CON-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    return await Contract.create({
        ...data,
        contract_number,
        status: 'DRAFT'
    });
};

/**
 * Cập nhật thông tin hợp đồng (gia hạn, dời end_date, ...)
 * - ADMIN: update bất kì hợp đồng nào.
 * - BUILDING_MANAGER: chỉ update hợp đồng trong tòa nhà mình.
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
        include: [
            {
                model: Room,
                as: 'room',
                attributes: ['id', 'room_number'],
                include: [{ model: Building, as: 'building' }]
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

module.exports = {
    getAllContracts,
    getContractById,
    getMyContracts,
    updateContractStatus,
    createContract,
    updateContract
};