const RoomImage = require('../models/roomImage.model')
const Room = require('../models/room.model')

const getAllRoomImages = async ({ page = 1, limit = 10, room_id } = {}) => {
    const offset = (page - 1) * limit
    const where = {}

    if (room_id) where.room_id = room_id

    const { count, rows } = await RoomImage.findAndCountAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [['created_at', 'DESC']]
    })

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    }
}

const getRoomImageById = async (id) => {
    const image = await RoomImage.findByPk(id)
    if (!image) throw { status: 404, message: 'Room image not found' }
    return image
}

const createRoomImage = async (data) => {
    const { room_id, image_url } = data

    // Check FK
    const room = await Room.findByPk(room_id)
    if (!room) throw { status: 404, message: 'Room not found' }

    const image = await RoomImage.create({ room_id, image_url })
    return image
}

const updateRoomImage = async (id, data) => {
    const image = await RoomImage.findByPk(id)
    if (!image) throw { status: 404, message: 'Room image not found' }

    await image.update(data)
    return image
}

const deleteRoomImage = async (id) => {
    const image = await RoomImage.findByPk(id)
    if (!image) throw { status: 404, message: 'Room image not found' }

    await image.destroy()
    return { message: 'Room image deleted successfully' }
}

module.exports = {
    getAllRoomImages,
    getRoomImageById,
    createRoomImage,
    updateRoomImage,
    deleteRoomImage
}