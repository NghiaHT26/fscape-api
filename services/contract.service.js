const { Op } = require('sequelize');
const Contract = require('../models/contract.model');
const User = require('../models/user.model');
const Room = require('../models/room.model');
const Building = require('../models/building.model');
const ContractTemplate = require('../models/contractTemplate.model');

/**
 * Lấy danh sách hợp đồng cho Admin (kèm bộ lọc trạng thái và tòa nhà)
 */
const getAllContracts = async ({ page = 1, limit = 10, status, building_id, search } = {}) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (search) {
        where[Op.or] = [
            { contract_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const include = [
        { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
            model: Room,
            as: 'room',
            attributes: ['id', 'room_number'],
            include: building_id ? [{ model: Building, as: 'building', where: { id: building_id } }] : []
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
        data: rows
    };
};

const getContractById = async (id) => {
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
    return contract;
};

/**
 * Cập nhật trạng thái hợp đồng (Duyệt hoặc Hủy)
 */
const updateContractStatus = async (id, status, manager_id = null) => {
    const contract = await Contract.findByPk(id);
    if (!contract) throw { status: 404, message: 'Contract not found' };

    // Logic đặc biệt khi hợp đồng bắt đầu có hiệu lực
    if (status === 'ACTIVE') {
        // Tự động gán manager phê duyệt nếu chưa có
        if (manager_id) contract.manager_id = manager_id;

        // Cập nhật trạng thái phòng sang OCCUPIED
        const room = await Room.findByPk(contract.room_id);
        if (room) await room.update({ status: 'OCCUPIED' });
    }

    return await contract.update({ status });
};

/**
 * Tạo hợp đồng mới từ Admin (Dành cho trường hợp Manager tạo hộ Resident)
 */
const createContract = async (data) => {
    const { room_id, customer_id, start_date, end_date } = data;

    // 1. Kiểm tra phòng có đang trống không
    const room = await Room.findByPk(room_id);
    if (!room || room.status !== 'AVAILABLE') {
        throw { status: 400, message: 'Room is not available for booking' };
    }

    // 2. Tạo số hợp đồng tự động (Ví dụ: CON-2026-XXXX)
    const count = await Contract.count() + 1;
    const contract_number = `CON-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    return await Contract.create({
        ...data,
        contract_number,
        status: 'DRAFT'
    });
};

/**
 * Cập nhật thông tin hợp đồng (Khi còn ở dạng DRAFT hoặc PENDING)
 */
const updateContract = async (id, data) => {
    const contract = await Contract.findByPk(id);
    if (!contract) throw { status: 404, message: 'Contract not found' };

    if (['ACTIVE', 'FINISHED'].includes(contract.status)) {
        throw { status: 400, message: 'Cannot edit an active or finished contract' };
    }

    return await contract.update(data);
};

/**
 * Xóa hợp đồng (Chỉ cho phép nếu là bản nháp)
 */
const deleteContract = async (id) => {
    const contract = await Contract.findByPk(id);
    if (!contract) throw { status: 404, message: 'Contract not found' };

    if (contract.status !== 'DRAFT') {
        throw { status: 400, message: 'Only draft contracts can be deleted' };
    }

    await contract.destroy();
    return { message: 'Contract deleted successfully' };
};

/**
 * Lấy danh sách hợp đồng của tôi (dành cho Resident/Customer)
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

module.exports = { getAllContracts, getContractById, getMyContracts, updateContractStatus, createContract, updateContract, deleteContract };