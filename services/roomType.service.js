const { Op } = require('sequelize')
const { sequelize } = require('../config/db')
const RoomType = require('../models/roomType.model')
const Room = require('../models/room.model')
const RoomTypeAsset = require('../models/roomTypeAsset.model')
const AssetType = require('../models/assetType.model')

const getAllRoomTypes = async ({
    page = 1,
    limit = 10,
    is_active,
    search
} = {}, user) => {

    const parsedPage = Number(page)
    const parsedLimit = Number(limit)
    const offset = (parsedPage - 1) * parsedLimit
    const userRole = user?.role || 'PUBLIC'

    const where = {}

    let attributes = undefined
    if (userRole !== 'ADMIN') {
        attributes = { exclude: ['createdAt', 'updatedAt'] }
    }

    if (is_active !== undefined) {
        where.is_active = is_active === 'true' || is_active === true
    }

    if (search) {
        where.name = { [Op.iLike]: `%${search}%` }
    }

    const { count, rows } = await RoomType.findAndCountAll({
        where,
        attributes,
        limit: parsedLimit,
        offset,
        order: [['createdAt', 'DESC']]
    })

    const active_count = await RoomType.count({
        where: { ...where, is_active: true }
    });

    return {
        total: count,
        active_count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit),
        data: rows
    }
}

const getRoomTypeById = async (id, user) => {
    const userRole = user?.role || 'PUBLIC'
    let attributes = undefined
    if (userRole !== 'ADMIN') {
        attributes = { exclude: ['createdAt', 'updatedAt'] }
    }

    const roomType = await RoomType.findByPk(id, { attributes })
    if (!roomType) throw { status: 404, message: 'Room type not found' }
    return roomType
}

const createRoomType = async (data) => {
    // 1. Check for required fields
    const requiredFields = ['name', 'base_price', 'deposit_months', 'capacity_min', 'capacity_max', 'bedrooms', 'bathrooms', 'area_sqm'];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            throw { status: 400, message: `Trường ${field} là bắt buộc` }
        }
    }

    const duplicate = await RoomType.findOne({ where: { name: data.name } })
    if (duplicate) {
        throw { status: 409, message: `Loại phòng "${data.name}" đã tồn tại` }
    }

    // 2. Validate values
    if (Number(data.base_price) < 0) {
        throw { status: 400, message: 'Giá cơ bản phải lớn hơn hoặc bằng 0' }
    }

    const cMin = Number(data.capacity_min);
    const cMax = Number(data.capacity_max);
    if (cMin < 1 || cMin > 6) throw { status: 400, message: 'Sức chứa tối thiểu phải từ 1 đến 6' };
    if (cMax < 1 || cMax > 6) throw { status: 400, message: 'Sức chứa tối đa phải từ 1 đến 6' };
    if (cMin > cMax) throw { status: 400, message: 'Sức chứa tối thiểu không được lớn hơn sức chứa tối đa' };

    const beds = Number(data.bedrooms);
    const baths = Number(data.bathrooms);
    if (![0, 1, 2, 3].includes(beds)) throw { status: 400, message: 'Số phòng ngủ chỉ được từ 0 đến 3' };
    if (![0, 1, 2, 3].includes(baths)) throw { status: 400, message: 'Số phòng tắm chỉ được từ 0 đến 3' };

    const area = Number(data.area_sqm);
    if (area <= 0 || area > 100) throw { status: 400, message: 'Diện tích phải lớn hơn 0 và không quá 100m²' };

    const roomType = await RoomType.create(data)
    return roomType
}

const updateRoomType = async (id, data) => {
    const roomType = await RoomType.findByPk(id)
    if (!roomType) throw { status: 404, message: 'Không tìm thấy loại phòng' }

    if (data.name && data.name !== roomType.name) {
        const duplicate = await RoomType.findOne({ where: { name: data.name, id: { [Op.ne]: id } } })
        if (duplicate) {
            throw { status: 409, message: `Loại phòng "${data.name}" đã tồn tại` }
        }
    }

    if (data.base_price !== undefined && Number(data.base_price) < 0) {
        throw { status: 400, message: 'Giá cơ bản phải lớn hơn hoặc bằng 0' }
    }

    const cMin = data.capacity_min !== undefined ? Number(data.capacity_min) : roomType.capacity_min;
    const cMax = data.capacity_max !== undefined ? Number(data.capacity_max) : roomType.capacity_max;
    
    if (data.capacity_min !== undefined && (cMin < 1 || cMin > 6)) throw { status: 400, message: 'Sức chứa tối thiểu phải từ 1 đến 6' };
    if (data.capacity_max !== undefined && (cMax < 1 || cMax > 6)) throw { status: 400, message: 'Sức chứa tối đa phải từ 1 đến 6' };
    if (cMin > cMax) throw { status: 400, message: 'Sức chứa tối thiểu không được lớn hơn sức chứa tối đa' };

    if (data.bedrooms !== undefined && ![0, 1, 2, 3].includes(Number(data.bedrooms))) {
        throw { status: 400, message: 'Số phòng ngủ chỉ được từ 0 đến 3' };
    }
    if (data.bathrooms !== undefined && ![0, 1, 2, 3].includes(Number(data.bathrooms))) {
        throw { status: 400, message: 'Số phòng tắm chỉ được từ 0 đến 3' };
    }

    if (data.area_sqm !== undefined) {
        const area = Number(data.area_sqm);
        if (area <= 0 || area > 100) throw { status: 400, message: 'Diện tích phải lớn hơn 0 và không quá 100m²' };
    }

    await roomType.update(data)
    return roomType
}

const deleteRoomType = async (id) => {
    const roomType = await RoomType.findByPk(id)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    const linkedRoomsCount = await Room.count({ where: { room_type_id: id } })
    if (linkedRoomsCount > 0) {
        throw { status: 409, message: `Cannot delete room type because ${linkedRoomsCount} room(s) still use it` }
    }

    await roomType.destroy() // paranoid: sets deleted_at
    return { message: `Room type "${roomType.name}" deleted successfully` }
}

const getTemplateAssets = async (roomTypeId) => {
    const roomType = await RoomType.findByPk(roomTypeId)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    const items = await RoomTypeAsset.findAll({
        where: { room_type_id: roomTypeId },
        include: [{ model: AssetType, as: 'asset_type', attributes: ['id', 'name'] }],
        attributes: ['id', 'quantity']
    })

    return items
}

const replaceTemplateAssets = async (roomTypeId, items) => {
    const roomType = await RoomType.findByPk(roomTypeId)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    if (!Array.isArray(items)) {
        throw { status: 400, message: 'Body must be an array of { asset_type_id, quantity }' }
    }

    if (items.length > 20) {
        throw { status: 400, message: 'Tối đa chỉ được gán 20 loại tài sản cho một loại phòng' }
    }

    // Validate all asset_type_ids exist
    const typeIds = items.map(i => i.asset_type_id)
    const existingTypes = await AssetType.findAll({ where: { id: { [Op.in]: typeIds } } })
    if (existingTypes.length !== typeIds.length) {
        throw { status: 400, message: 'One or more asset_type_id values are invalid' }
    }

    const transaction = await sequelize.transaction()
    try {
        await RoomTypeAsset.destroy({ where: { room_type_id: roomTypeId }, transaction })

        if (items.length > 0) {
            const records = items.map(item => ({
                room_type_id: roomTypeId,
                asset_type_id: item.asset_type_id,
                quantity: item.quantity || 1
            }))
            await RoomTypeAsset.bulkCreate(records, { transaction })
        }

        await transaction.commit()
        return getTemplateAssets(roomTypeId)
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    getAllRoomTypes,
    getRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getTemplateAssets,
    replaceTemplateAssets
}