const roomImageService = require('../services/roomImage.service')

const handleError = (res, err) => {
    console.error('[RoomImageController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

const getAllRoomImages = async (req, res) => {
    try {
        const result = await roomImageService.getAllRoomImages(req.query)
        return res.status(200).json({ success: true, ...result })
    } catch (err) { return handleError(res, err) }
}

const getRoomImageById = async (req, res) => {
    try {
        const image = await roomImageService.getRoomImageById(req.params.id)
        return res.status(200).json({ success: true, data: image })
    } catch (err) { return handleError(res, err) }
}

const createRoomImage = async (req, res) => {
    try {
        const { room_id, image_url } = req.body

        if (!room_id || !image_url) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_id, image_url'
            })
        }

        const image = await roomImageService.createRoomImage(req.body)
        return res.status(201).json({
            success: true,
            message: 'Room image created successfully',
            data: image
        })
    } catch (err) { return handleError(res, err) }
}

const updateRoomImage = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body must not be empty'
            })
        }

        const image = await roomImageService.updateRoomImage(req.params.id, req.body)
        return res.status(200).json({
            success: true,
            message: 'Room image updated successfully',
            data: image
        })
    } catch (err) { return handleError(res, err) }
}

const deleteRoomImage = async (req, res) => {
    try {
        const result = await roomImageService.deleteRoomImage(req.params.id)
        return res.status(200).json({ success: true, ...result })
    } catch (err) { return handleError(res, err) }
}

module.exports = {
    getAllRoomImages,
    getRoomImageById,
    createRoomImage,
    updateRoomImage,
    deleteRoomImage
}