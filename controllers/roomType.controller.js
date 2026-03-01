const roomTypeService = require('../services/roomType.service')

const handleError = (res, err) => {
    console.error('[RoomTypeController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

const getAllRoomTypes = async (req, res) => {
    try {
        const result = await roomTypeService.getAllRoomTypes(req.query)
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

const getRoomTypeById = async (req, res) => {
    try {
        const data = await roomTypeService.getRoomTypeById(req.params.id)
        return res.status(200).json({ success: true, data })
    } catch (err) {
        return handleError(res, err)
    }
}

const createRoomType = async (req, res) => {
    try {
        const data = await roomTypeService.createRoomType(req.body)
        return res.status(201).json({
            success: true,
            message: 'Room type created successfully',
            data
        })
    } catch (err) {
        return handleError(res, err)
    }
}

const updateRoomType = async (req, res) => {
    try {
        const data = await roomTypeService.updateRoomType(req.params.id, req.body)
        return res.status(200).json({
            success: true,
            message: 'Room type updated successfully',
            data
        })
    } catch (err) {
        return handleError(res, err)
    }
}

const deleteRoomType = async (req, res) => {
    try {
        const result = await roomTypeService.deleteRoomType(req.params.id)
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    getAllRoomTypes,
    getRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType
}