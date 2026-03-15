const { Op } = require('sequelize');
const { randomUUID } = require('crypto');
const { sequelize } = require('../config/db');
const Asset = require('../models/asset.model');
const AssetHistory = require('../models/assetHistory.model');
const Building = require('../models/building.model');
const Room = require('../models/room.model');
const Request = require('../models/request.model');

const { ROLES } = require('../constants/roles');

const TIMESTAMP_FIELDS = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];

// ─── Helpers ──────────────────────────────────────────────────

function stripTimestamps(obj) {
    const data = typeof obj.toJSON === 'function' ? obj.toJSON() : { ...obj };
    for (const field of TIMESTAMP_FIELDS) delete data[field];
    return data;
}

// ─── GET /api/assets ──────────────────────────────────────────
const getAllAssets = async (query = {}, user = {}) => {
    const { page = 1, limit = 10, current_room_id, status, search } = query;
    const offset = (page - 1) * limit;
    const where = {};

    // Note: Building scoping requires joining with Room now if needed.
    // For now, removing building_id restriction directly on Asset.

    if (current_room_id) where.current_room_id = current_room_id;
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
            { model: Room, as: 'room', attributes: ['id', 'room_number', 'building_id'] }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
    });

    // If user is BM or STAFF, we MIGHT want to filter assets that are either:
    // 1. Unassigned
    // 2. Assigned to a room in their building
    // Let's just filter in JS for now or leave it. The user didn't specify strict read rules for unassigned assets.
    let data = rows;
    if (user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) {
        data = data.filter(asset => !asset.room || asset.room.building_id === user.building_id);
    }

    if (user.role !== ROLES.ADMIN) {
        data = data.map(row => stripTimestamps(row));
    }

    // Re-count if we filtered in JS (rough estimation, ideally done in DB)
    const finalCount = (user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) ? data.length : count; // Adjust this if pagination breaks

    return {
        total: finalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(finalCount / limit),
        data
    };
};

// ─── GET /api/assets/:id ──────────────────────────────────────
const getAssetById = async (id, user = {}) => {
    const asset = await Asset.findByPk(id, {
        include: [
            { model: Room, as: 'room' },
            {
                model: AssetHistory,
                as: 'histories',
                limit: 10,
                order: [['createdAt', 'DESC']]
            }
        ]
    });
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if ((user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) && asset.room && asset.room.building_id !== user.building_id) {
        throw { status: 403, message: 'You can only access assets in your assigned building' };
    }

    if (user.role !== ROLES.ADMIN) {
        return stripTimestamps(asset);
    }
    return asset;
};

// ─── GET /api/assets/public/:id (New Public Info) ─────────────
const getPublicAssetInfo = async (id) => {
    const AssetType = require('../models/assetType.model');
    const asset = await Asset.findByPk(id, {
        include: [
            { model: Room, as: 'room', attributes: ['id', 'room_number'] },
            { model: AssetType, as: 'asset_type', attributes: ['id', 'name'] }
        ]
    });
    if (!asset) throw { status: 404, message: 'Asset not found' };
    const data = asset.toJSON();
    // Keep createdAt, delete others
    delete data.updated_at;
    delete data.updatedAt;
    return data;
};

// ─── POST /api/assets (Admin only) ───────────────────────────
const createAsset = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const id = randomUUID();
        // Base URL for scanning - ideally from env, fallback to port 5174 for dev
        const siteUrl = process.env.CLIENT_URL || 'http://localhost:5174';
        const qrContent = `${siteUrl}/public/assets/${id}`;

        data.id = id;
        data.qr_code = qrContent;

        if (data.current_room_id) {
            const room = await Room.findByPk(data.current_room_id);
            if (!room) throw { status: 404, message: 'Room not found' };
        }

        const asset = await Asset.create(data, { transaction });

        await AssetHistory.create({
            asset_id: asset.id,
            to_room_id: data.current_room_id || null,
            to_status: data.status || 'AVAILABLE',
            from_status: 'AVAILABLE',
            action: 'INITIAL_CREATE',
            notes: 'Tạo mới tài sản vào hệ thống'
        }, { transaction });

        await transaction.commit();
        return getAssetById(asset.id, { role: ROLES.ADMIN });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ─── POST /api/assets/batch (Admin only) ─────────────────────
const createBatchAssets = async (data) => {
    const { name, asset_type_id, quantity = 1, price } = data;

    if (!name) {
        throw { status: 400, message: 'name is required' };
    }
    if (!quantity || quantity < 1 || quantity > 100) {
        throw { status: 400, message: 'quantity must be between 1 and 100' };
    }

    if (asset_type_id) {
        const AssetType = require('../models/assetType.model');
        const at = await AssetType.findByPk(asset_type_id);
        if (!at) throw { status: 404, message: 'Asset type not found' };
    }

    const transaction = await sequelize.transaction();
    try {
        const siteUrl = process.env.CLIENT_URL || 'http://localhost:5174';
        const created = [];
        for (let i = 0; i < quantity; i++) {
            const id = randomUUID();
            const qrContent = `${siteUrl}/public/assets/${id}`;

            const asset = await Asset.create({
                id,
                name,
                asset_type_id: asset_type_id || null,
                price: price || null,
                image_url: data.image_url || null,
                qr_code: qrContent,
                status: 'AVAILABLE',
            }, { transaction });

            await AssetHistory.create({
                asset_id: asset.id,
                to_status: 'AVAILABLE',
                from_status: 'AVAILABLE',
                action: 'INITIAL_CREATE',
                notes: `Tạo hàng loạt (${i + 1}/${quantity})`
            }, { transaction });

            created.push(asset);
        }
        await transaction.commit();
        return { count: created.length, data: created };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ─── PUT /api/assets/:id (Admin only) ────────────────────────
const updateAsset = async (id, data, performerId = null) => {
    const asset = await Asset.findByPk(id, { include: [{ model: Room, as: 'room' }] });
    if (!asset) throw { status: 404, message: 'Asset not found' };

    delete data.qr_code;

    const transaction = await sequelize.transaction();
    try {
        const oldStatus = asset.status;
        const oldRoom = asset.current_room_id;

        if (data.current_room_id && data.current_room_id !== oldRoom) {
            const room = await Room.findByPk(data.current_room_id);
            if (!room) throw { status: 404, message: 'Room not found' };
        }

        await asset.update(data, { transaction });

        if (data.status !== oldStatus || data.current_room_id !== oldRoom) {
            await AssetHistory.create({
                asset_id: asset.id,
                from_room_id: oldRoom,
                to_room_id: data.current_room_id ?? oldRoom,
                from_status: oldStatus,
                to_status: data.status || oldStatus,
                action: 'UPDATE_INFO',
                performed_by: performerId,
                notes: data.notes || 'Cập nhật thông tin tài sản'
            }, { transaction });
        }

        await transaction.commit();
        return getAssetById(id, { role: ROLES.ADMIN });
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ─── PATCH /api/assets/:id/assign (Staff, BM, Admin) ─────────
const assignAsset = async (id, { room_id, notes }, user) => {
    const asset = await Asset.findByPk(id, { include: [{ model: Room, as: 'room' }] });
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if ((user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) && asset.room && asset.room.building_id !== user.building_id) {
        throw { status: 403, message: 'You can only access assets in your assigned building' };
    }

    if (asset.status === 'MAINTENANCE') {
        throw { status: 409, message: 'Cannot assign asset under maintenance' };
    }

    const oldRoom = asset.current_room_id;
    const oldStatus = asset.status;
    let action;

    const transaction = await sequelize.transaction();
    try {
        if (room_id) {
            const room = await Room.findByPk(room_id);
            if (!room) throw { status: 404, message: 'Target room not found' };
            if ((user.role === ROLES.BUILDING_MANAGER || user.role === ROLES.STAFF) && room.building_id !== user.building_id) {
                throw { status: 403, message: 'Target room is not in your assigned building' };
            }

            if (!oldRoom) {
                action = 'CHECK_IN';
            } else if (oldRoom === room_id) {
                throw { status: 400, message: 'Asset is already in this room' };
            } else {
                action = 'MOVE';
            }

            await asset.update({ current_room_id: room_id, status: 'IN_USE' }, { transaction });
        } else {
            if (!oldRoom) {
                throw { status: 400, message: 'Asset is not assigned to any room' };
            }
            action = 'CHECK_OUT';
            await asset.update({ current_room_id: null, status: 'AVAILABLE' }, { transaction });
        }

        await AssetHistory.create({
            asset_id: asset.id,
            from_room_id: oldRoom,
            to_room_id: room_id || null,
            from_status: oldStatus,
            to_status: room_id ? 'IN_USE' : 'AVAILABLE',
            action,
            performed_by: user.id,
            notes: notes || null
        }, { transaction });

        await transaction.commit();
        return getAssetById(id, user);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ─── DELETE /api/assets/:id (Admin only) ─────────────────────
const deleteAsset = async (id) => {
    const asset = await Asset.findByPk(id);
    if (!asset) throw { status: 404, message: 'Asset not found' };

    if (asset.status === 'IN_USE') {
        throw { status: 409, message: 'Cannot delete asset currently in use. Check out first.' };
    }

    const activeRequest = await Request.findOne({
        where: {
            related_asset_id: id,
            status: { [Op.notIn]: ['COMPLETED', 'CANCELLED', 'REVIEWED'] }
        }
    });
    if (activeRequest) {
        throw { status: 409, message: 'Cannot delete asset with active maintenance requests' };
    }

    await asset.destroy();
    return { message: `Asset "${asset.name}" deleted successfully` };
};

module.exports = { 
    getAllAssets, 
    getAssetById, 
    getPublicAssetInfo,
    createAsset, 
    createBatchAssets, 
    updateAsset, 
    assignAsset, 
    deleteAsset 
};
