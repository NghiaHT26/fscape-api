const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Room = require('../models/room.model');
const RoomImage = require('../models/roomImage.model');
const Building = require('../models/building.model');
const RoomType = require('../models/roomType.model');
const { ROLES } = require('../constants/roles');

const getAllRooms = async ({ page = 1, limit = 10, building_id, room_type_id, status, floor, search } = {}, user) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (building_id) where.building_id = building_id;
    if (room_type_id) where.room_type_id = room_type_id;

    if (user && Object.values(ROLES).includes(user.role)) {
        if (user.role === ROLES.ADMIN) {
            if (status) where.status = status;
        } else if ([ROLES.BUILDING_MANAGER, ROLES.STAFF].includes(user.role)) {
            where.building_id = user.building_id;
            if (status) where.status = status;
        } else {
            // Residents/Customers only see available rooms
            where.status = 'AVAILABLE';
        }
    } else {
        if (status) where.status = status;
    }

    if (floor !== undefined) where.floor = floor;
    if (search) where.room_number = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Room.findAndCountAll({
        where,
        include: [
            { model: Building, as: 'building', attributes: ['id', 'name'] },
            { model: RoomType, as: 'room_type', attributes: ['id', 'name', 'base_price'] }
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

const getRoomById = async (id, user) => {
    const where = { id };

    if (user && [ROLES.BUILDING_MANAGER, ROLES.STAFF].includes(user.role)) {
        where.building_id = user.building_id;
    } else if (user && [ROLES.RESIDENT, ROLES.CUSTOMER].includes(user.role)) {
        where.status = 'AVAILABLE';
    }

    const room = await Room.findOne({
        where,
        include: [
            { model: Building, as: 'building' },
            { model: RoomType, as: 'room_type' },
            { model: RoomImage, as: 'images', attributes: ['id', 'image_url'] }
        ]
    });

    if (!room) throw { status: 404, message: 'Room not found or access denied' };
    return room;
};

const createRoom = async (data) => {
    const { gallery_images, ...roomData } = data;

    // Check trùng room_number trong cùng building
    const existingRoom = await Room.findOne({
        where: { building_id: roomData.building_id, room_number: roomData.room_number }
    });
    if (existingRoom) {
        throw { status: 409, message: `Room number ${roomData.room_number} already exists in this building` };
    }

    const transaction = await sequelize.transaction();
    try {
        const room = await Room.create(roomData, { transaction });

        // Lưu danh sách ảnh thực tế
        if (gallery_images && gallery_images.length > 0) {
            const imageRecords = gallery_images.map(url => ({
                room_id: room.id,
                image_url: url
            }));
            await RoomImage.bulkCreate(imageRecords, { transaction });
        }

        await transaction.commit();
        return getRoomById(room.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateRoom = async (id, data) => {
    const { gallery_images, ...updateData } = data;

    const room = await Room.findByPk(id);
    if (!room) throw { status: 404, message: 'Room not found' };

    // Check trùng room_number nếu có thay đổi
    if (updateData.room_number && updateData.room_number !== room.room_number) {
        const existingRoom = await Room.findOne({
            where: { building_id: room.building_id, room_number: updateData.room_number }
        });
        if (existingRoom) {
            throw { status: 409, message: `Room number ${updateData.room_number} already exists in this building` };
        }
    }

    const transaction = await sequelize.transaction();
    try {
        await room.update(updateData, { transaction });

        // Ghi đè danh sách ảnh gallery mới (nếu client gửi lên)
        if (gallery_images) {
            await RoomImage.destroy({ where: { room_id: id }, transaction });
            if (gallery_images.length > 0) {
                const imageRecords = gallery_images.map(url => ({
                    room_id: id,
                    image_url: url
                }));
                await RoomImage.bulkCreate(imageRecords, { transaction });
            }
        }

        await transaction.commit();
        return getRoomById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteRoom = async (id, user) => {
    const room = await Room.findByPk(id);
    if (!room) throw { status: 404, message: 'Room not found' };

    if (user && user.role === ROLES.BUILDING_MANAGER) {
        if (room.building_id !== user.building_id) {
            throw { status: 403, message: 'Permission denied: Cannot delete rooms for other buildings' };
        }
    }

    await room.destroy();
    return { message: `Room ${room.room_number} deleted successfully` };
};

const updateRoomStatus = async (id, status, user) => {
    const room = await Room.findByPk(id);
    if (!room) throw { status: 404, message: 'Room not found' };

    if (user && user.role === ROLES.BUILDING_MANAGER) {
        if (room.building_id !== user.building_id) {
            throw { status: 403, message: 'Permission denied: Cannot manage rooms for other buildings' };
        }
    }

    room.status = status;
    await room.save();
    return room;
}

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus
};