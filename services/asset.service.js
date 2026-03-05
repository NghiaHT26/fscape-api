const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Asset = require('../models/asset.model');
const AssetHistory = require('../models/assetHistory.model');
const Building = require('../models/building.model');
const Room = require('../models/room.model');

/**
 * Lấy danh sách tài sản kèm phân trang và lọc theo vị trí/trạng thái
 */
const getAllAssets = async ({ page = 1, limit = 10, building_id, current_room_id, status, search, user } = {}) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (user && ['BUILDING_MANAGER', 'STAFF'].includes(user.role)) {
        where.building_id = user.building_id;
    } else if (building_id) {
        where.building_id = building_id;
    }

    if (user && user.role === 'RESIDENT') {
        where.current_room_id = user.room_id;
    } else if (current_room_id) {
        where.current_room_id = current_room_id;
    }
    if (status) where.status = status.toUpperCase();
    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { qr_code: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Asset.findAndCountAll({
        where,
        include: [
            { model: Building, as: 'building', attributes: ['id', 'name'] },
            { model: Room, as: 'room', attributes: ['id', 'room_number'] }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

const getAssetById = async (id, user) => {
    const asset = await Asset.findByPk(id, {
        include: [
            { model: Building, as: 'building' },
            { model: Room, as: 'room' },
            {
                model: AssetHistory,
                as: 'histories',
                limit: 10,
                order: [['created_at', 'DESC']]
            } // Lấy 10 lịch sử gần nhất
        ]
    });
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if (user && ['BUILDING_MANAGER', 'STAFF'].includes(user.role)) {
        if (asset.building_id !== user.building_id) throw { status: 403, message: 'Permission denied: Cannot access asset from other building' };
    }
    if (user && user.role === 'RESIDENT') {
        if (asset.current_room_id !== user.room_id) throw { status: 403, message: 'Permission denied: Cannot access asset from other room' };
    }

    return asset;
};

/**
 * Tạo tài sản mới và ghi nhận lịch sử khởi tạo
 */
const createAsset = async (data, user) => {
    const transaction = await sequelize.transaction();
    try {
        const { qr_code, name, building_id, current_room_id, status } = data;

        if (user && user.role === 'BUILDING_MANAGER' && building_id !== user.building_id) {
            throw { status: 403, message: 'Permission denied: Cannot create asset for other buildings' };
        }

        // Kiểm tra QR Code duy nhất
        const existing = await Asset.findOne({ where: { qr_code } });
        if (existing) throw { status: 409, message: `QR Code "${qr_code}" already exists` };

        const asset = await Asset.create(data, { transaction });

        // Lưu lịch sử khởi tạo
        await AssetHistory.create({
            asset_id: asset.id,
            to_room_id: current_room_id || null,
            to_status: status || 'AVAILABLE',
            from_status: 'AVAILABLE', // Mặc định từ kho
            action: 'INITIAL_CREATE',
            notes: 'Tạo mới tài sản vào hệ thống'
        }, { transaction });

        await transaction.commit();
        return getAssetById(asset.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Cập nhật tài sản và tự động ghi log nếu có thay đổi vị trí/trạng thái
 */
const updateAsset = async (id, data, user = null) => {
    const asset = await Asset.findByPk(id);
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if (user && user.role === 'BUILDING_MANAGER') {
        if (asset.building_id !== user.building_id) throw { status: 403, message: 'Permission denied: Cannot modify asset from other building' };
        if (data.building_id && data.building_id !== user.building_id) {
            throw { status: 403, message: 'Permission denied: Cannot move asset to other building' };
        }
    }

    const transaction = await sequelize.transaction();
    try {
        const oldStatus = asset.status;
        const oldRoom = asset.current_room_id;

        await asset.update(data, { transaction });

        // Nếu có thay đổi trạng thái hoặc phòng thì ghi log
        if (data.status !== oldStatus || data.current_room_id !== oldRoom) {
            await AssetHistory.create({
                asset_id: asset.id,
                from_room_id: oldRoom,
                to_room_id: data.current_room_id || oldRoom,
                from_status: oldStatus,
                to_status: data.status || oldStatus,
                action: 'UPDATE_INFO',
                performed_by: user ? user.id : null,
                notes: data.notes || 'Cập nhật thông tin tài sản từ Admin/Manager'
            }, { transaction });
        }

        await transaction.commit();
        return getAssetById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteAsset = async (id, user) => {
    const asset = await Asset.findByPk(id);
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if (user && user.role === 'BUILDING_MANAGER' && asset.building_id !== user.building_id) {
        throw { status: 403, message: 'Permission denied: Cannot delete asset from other building' };
    }

    // Kiểm tra nếu tài sản đang được sử dụng (IN_USE) thì không cho xóa
    if (asset.status === 'IN_USE') {
        throw { status: 400, message: 'Cannot delete asset currently IN_USE. Move to AVAILABLE first.' };
    }

    await asset.destroy();
    return { message: `Asset "${asset.name}" deleted successfully` };
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset };