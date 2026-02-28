const roomService = require('../services/room.service')

const handleError = (res, err) => {
    console.error('[RoomController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

const getAllRooms = async (req, res) => {
    try {
        const result = await roomService.getAllRooms(req.query)
        return res.status(200).json({ success: true, ...result })
    } catch (err) { return handleError(res, err) }
}

const getRoomById = async (req, res) => {
    try {
        const room = await roomService.getRoomById(req.params.id)
        return res.status(200).json({ success: true, data: room })
    } catch (err) { return handleError(res, err) }
}

const createRoom = async (req, res) => {
    try {
        const { room_number, building_id, room_type_id, floor } = req.body

        // Validation mới: price không còn bắt buộc ở đây
        if (!room_number || !building_id || !room_type_id || floor === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_number, building_id, room_type_id, floor'
            })
        }

        const room = await roomService.createRoom(req.body)
        return res.status(201).json({ success: true, message: 'Room created successfully', data: room })
    } catch (err) { return handleError(res, err) }
}

const updateRoom = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'Request body must not be empty' })
        }
        const room = await roomService.updateRoom(req.params.id, req.body)
        return res.status(200).json({ success: true, message: 'Room updated successfully', data: room })
    } catch (err) { return handleError(res, err) }
}

const deleteRoom = async (req, res) => {
    try {
        const result = await roomService.deleteRoom(req.params.id)
        return res.status(200).json({ success: true, ...result })
    } catch (err) { return handleError(res, err) }
}

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom }