const { Op } = require('sequelize')
const Room = require('../models/room.model')
const Building = require('../models/building.model')
const RoomType = require('../models/roomType.model')
const RoomImage = require('../models/roomImage.model')
const Asset = require('../models/asset.model')
const Facility = require('../models/facility.model')

/* ===== COMMON INCLUDE ===== */
const ROOM_INCLUDE = [
    { model: Building, as: 'building', attributes: ['id', 'name', 'address'] },
    { model: RoomType, as: 'room_type', attributes: ['id', 'name', 'base_price', 'deposit_months'] },
    { model: RoomImage, as: 'images', attributes: ['id', 'image_url'] },
    { model: Asset, as: 'assets', attributes: ['id', 'name', 'status', 'qr_code'] },
]

const getAllRooms = async ({
    page = 1,
    limit = 10,
    status,
    building_id,
    room_type_id,
    search,
    floor
} = {}) => {

    page = Number(page)
    limit = Number(limit)
    const offset = (page - 1) * limit

    const where = {}

    if (status)
        where.status = status.toUpperCase()

    if (building_id && typeof building_id === 'string')
        where.building_id = building_id

    if (room_type_id && typeof room_type_id === 'string')
        where.room_type_id = room_type_id

    if (floor !== undefined && floor !== null)
        where.floor = Number(floor)

    if (search)
        where.room_number = { [Op.iLike]: `%${search}%` }

    const { count, rows } = await Room.findAndCountAll({
        where,
        include: ROOM_INCLUDE,
        distinct: true,
        limit,
        offset,
        order: [['floor', 'ASC'], ['room_number', 'ASC']]
    })

    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        data: rows
    }
}

const getRoomById = async (id) => {
    const room = await Room.findByPk(id, { include: ROOM_INCLUDE })
    if (!room) throw { status: 404, message: 'Room not found' }
    return room
}

const createRoom = async (data) => {

    const {
        room_number,
        building_id,
        room_type_id,
        floor,
        gallery_images = [],
        ...rest
    } = data

    const building = await Building.findByPk(building_id)
    if (!building) throw { status: 400, message: 'Building not found' }

    const roomType = await RoomType.findByPk(room_type_id)
    if (!roomType) throw { status: 400, message: 'Room type not found' }

    const duplicate = await Room.findOne({ where: { building_id, room_number } })
    if (duplicate) throw { status: 409, message: 'Room already exists in this building' }

    const room = await Room.create({
        room_number,
        building_id,
        room_type_id,
        floor,
        status: data.status?.toUpperCase() || 'AVAILABLE',
        ...rest
    })

    if (gallery_images.length)
        await RoomImage.bulkCreate(
            gallery_images.map(url => ({ room_id: room.id, image_url: url }))
        )

    return getRoomById(room.id)
}

const updateRoom = async (id, data) => {

    const { gallery_images, ...updateData } = data

    const room = await Room.findByPk(id)
    if (!room) throw { status: 404, message: 'Room not found' }

    if (updateData.room_number || updateData.building_id) {
        const duplicate = await Room.findOne({
            where: {
                building_id: updateData.building_id || room.building_id,
                room_number: updateData.room_number || room.room_number,
                id: { [Op.ne]: id }
            }
        })
        if (duplicate) throw { status: 409, message: 'Room number already taken' }
    }

    await room.update(updateData)

    if (gallery_images) {
        await RoomImage.destroy({ where: { room_id: id } })
        if (gallery_images.length)
            await RoomImage.bulkCreate(
                gallery_images.map(url => ({ room_id: id, image_url: url }))
            )
    }

    return getRoomById(id)
}

const deleteRoom = async (id) => {

    const room = await Room.findByPk(id)
    if (!room) throw { status: 404, message: 'Room not found' }

    await room.destroy()
    return { message: `Room "${room.room_number}" deleted successfully` }
}

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
}