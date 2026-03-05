const { Op } = require('sequelize')
const RoomType = require('../models/roomType.model')

const getAllRoomTypes = async ({
    page = 1,
    limit = 10,
    is_active,
    search,
    user
} = {}) => {

    const parsedPage = Number(page)
    const parsedLimit = Number(limit)
    const offset = (parsedPage - 1) * parsedLimit

    const where = {}

    if (user && ['RESIDENT', 'CUSTOMER'].includes(user.role)) {
        where.is_active = true
    } else if (is_active !== undefined) {
        where.is_active = is_active === 'true' || is_active === true
    }

    if (search) {
        where.name = { [Op.iLike]: `%${search}%` }
    }

    const { count, rows } = await RoomType.findAndCountAll({
        where,
        limit: parsedLimit,
        offset,
        order: [['created_at', 'DESC']]
    })

    return {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit),
        data: rows
    }
}

const getRoomTypeById = async (id, user) => {
    const roomType = await RoomType.findByPk(id)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    if (user && ['RESIDENT', 'CUSTOMER'].includes(user.role)) {
        if (!roomType.is_active) {
            throw { status: 403, message: 'Permission denied: Room type is not active' }
        }
    }

    return roomType
}

const createRoomType = async (data) => {

    if (data.base_price < 0) {
        throw { status: 400, message: 'Base price must be >= 0' }
    }

    if (data.capacity_min > data.capacity_max) {
        throw { status: 400, message: 'capacity_min must be <= capacity_max' }
    }

    const roomType = await RoomType.create(data)

    return roomType
}

const updateRoomType = async (id, data) => {

    const roomType = await RoomType.findByPk(id)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    if (data.base_price !== undefined && data.base_price < 0) {
        throw { status: 400, message: 'Base price must be >= 0' }
    }

    const capacityMin = data.capacity_min ?? roomType.capacity_min
    const capacityMax = data.capacity_max ?? roomType.capacity_max

    if (capacityMin > capacityMax) {
        throw { status: 400, message: 'capacity_min must be <= capacity_max' }
    }

    await roomType.update(data)

    return roomType
}

const deleteRoomType = async (id) => {
    const roomType = await RoomType.findByPk(id)
    if (!roomType) throw { status: 404, message: 'Room type not found' }

    await roomType.update({ is_active: false })

    return { message: 'Room type deactivated successfully' }
}

module.exports = {
    getAllRoomTypes,
    getRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType
}