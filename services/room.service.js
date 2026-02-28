const { Op } = require('sequelize')
const Room = require('../models/room.model')
const Building = require('../models/building.model')
const RoomType = require('../models/roomType.model')
const RoomImage = require('../models/roomImage.model') //

const getAllRooms = async ({ page = 1, limit = 10, status, building_id, room_type_id, search, floor } = {}) => {
    const offset = (page - 1) * limit
    const where = {}

    // Lọc theo các tiêu chí mới
    if (status) where.status = status.toUpperCase() // Đảm bảo khớp ENUM AVAILABLE/OCCUPIED/LOCKED
    if (building_id) where.building_id = building_id
    if (room_type_id) where.room_type_id = room_type_id
    if (floor) where.floor = floor
    if (search) where.room_number = { [Op.iLike]: `%${search}%` }

    const { count, rows } = await Room.findAndCountAll({
        where,
        include: [
            { model: Building, as: 'building', attributes: ['id', 'name', 'address'] },
            { model: RoomType, as: 'room_type', attributes: ['id', 'name', 'base_price', 'deposit_months'] },
            { model: RoomImage, as: 'images', attributes: ['id', 'image_url'] } //
        ],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true,
        order: [['floor', 'ASC'], ['room_number', 'ASC']]
    })

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    }
}

const getRoomById = async (id) => {
    const room = await Room.findByPk(id, {
        include: [
            { model: Building, as: 'building' },
            { model: RoomType, as: 'room_type' },
            { model: RoomImage, as: 'images' } // Load gallery ảnh
        ]
    })
    if (!room) throw { status: 404, message: `Room not found` }
    return room
}

const createRoom = async (data) => {
    const { room_number, building_id, room_type_id, floor, gallery_images, ...rest } = data

    // Kiểm tra trùng số phòng trong tòa nhà
    const existing = await Room.findOne({ where: { building_id, room_number } })
    if (existing) throw { status: 409, message: `Room "${room_number}" already exists in this building` }

    // Tạo Room (không còn trường price ở đây)
    const room = await Room.create({
        room_number,
        building_id,
        room_type_id,
        floor,
        status: data.status || 'AVAILABLE',
        ...rest
    })

    // Xử lý lưu nhiều ảnh vào bảng RoomImage
    if (gallery_images && Array.isArray(gallery_images)) {
        const imageRecords = gallery_images.map(url => ({
            room_id: room.id,
            image_url: url
        }))
        await RoomImage.bulkCreate(imageRecords)
    }

    return getRoomById(room.id)
}

const updateRoom = async (id, data) => {
    const { gallery_images, ...updateData } = data
    const room = await Room.findByPk(id)
    if (!room) throw { status: 404, message: `Room not found` }

    // Logic kiểm tra trùng số phòng khi update tương tự cũ nhưng dùng chuẩn mới
    if (data.room_number || data.building_id) {
        const buildingId = data.building_id || room.building_id
        const roomNumber = data.room_number || room.room_number
        const duplicate = await Room.findOne({
            where: { building_id: buildingId, room_number: roomNumber, id: { [Op.ne]: id } }
        })
        if (duplicate) throw { status: 409, message: `Room number "${roomNumber}" is already taken` }
    }

    await room.update(updateData)

    // Đồng bộ lại Gallery ảnh nếu có gửi lên mảng mới
    if (gallery_images) {
        await RoomImage.destroy({ where: { room_id: id } })
        const imageRecords = gallery_images.map(url => ({ room_id: id, image_url: url }))
        await RoomImage.bulkCreate(imageRecords)
    }

    return getRoomById(id)
}

const deleteRoom = async (id) => {
    const room = await Room.findByPk(id)
    if (!room) throw { status: 404, message: `Room not found` }
    await room.destroy() // Sẽ tự CASCADE xóa RoomImages nhờ cấu trúc model
    return { message: `Room "${room.room_number}" deleted successfully` }
}

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom }