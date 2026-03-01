const roomService = require('../services/room.service')

const handleError = (res, err) => {
    console.error('[RoomController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

// ================= GET ALL =================
const getAllRooms = async (req, res) => {
    try {
        const result = await roomService.getAllRooms(req.query)
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

// ================= GET BY ID =================
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            })
        }

        const room = await roomService.getRoomById(id)

        return res.status(200).json({
            success: true,
            data: room
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// ================= CREATE =================
const createRoom = async (req, res) => {
    try {
        const {
            room_number,
            building_id,
            room_type_id,
            floor
        } = req.body

        // Validate required fields
        if (!room_number || !building_id || !room_type_id || floor === null || floor === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_number, building_id, room_type_id, floor'
            })
        }

        const room = await roomService.createRoom(req.body)

        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: room
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// ================= UPDATE =================
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            })
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body must not be empty'
            })
        }

        const room = await roomService.updateRoom(id, req.body)

        return res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: room
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// ================= DELETE =================
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Room ID is required'
            })
        }

        const result = await roomService.deleteRoom(id)

        return res.status(200).json({
            success: true,
            ...result
        })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
}