const cloudinary = require('../config/cloudinary');
const roomService = require('../services/room.service');

const handleError = (res, err) => {
    console.error('[RoomController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

const getAllRooms = async (req, res) => {
    try {
        const result = await roomService.getAllRooms(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await roomService.getRoomById(req.params.id);
        return res.status(200).json({ success: true, data: room });
    } catch (err) {
        return handleError(res, err);
    }
};

// Hàm helper upload 1 file lên Cloudinary
const uploadToCloudinary = async (file) => {
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'rooms' }
    );
    return result.secure_url;
};

const createRoom = async (req, res) => {
    try {
        const roomData = { ...req.body };

        // Validate dữ liệu bắt buộc
        if (!roomData.room_number || !roomData.building_id || !roomData.room_type_id || roomData.floor === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_number, building_id, room_type_id, floor'
            });
        }

        // Xử lý upload các file
        if (req.files) {
            if (req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
                roomData.thumbnail_url = await uploadToCloudinary(req.files['thumbnail'][0]);
            }
            if (req.files['image_3d'] && req.files['image_3d'].length > 0) {
                roomData.image_3d_url = await uploadToCloudinary(req.files['image_3d'][0]);
            }
            if (req.files['blueprint'] && req.files['blueprint'].length > 0) {
                roomData.blueprint_url = await uploadToCloudinary(req.files['blueprint'][0]);
            }
            
            // Xử lý danh sách ảnh gallery
            if (req.files['gallery_images'] && req.files['gallery_images'].length > 0) {
                roomData.gallery_images = [];
                for (const file of req.files['gallery_images']) {
                    const url = await uploadToCloudinary(file);
                    roomData.gallery_images.push(url);
                }
            }
        }

        const room = await roomService.createRoom(roomData);

        return res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: room
        });

    } catch (err) {
        return handleError(res, err);
    }
};

const updateRoom = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.files) {
            if (req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
                updateData.thumbnail_url = await uploadToCloudinary(req.files['thumbnail'][0]);
            }
            if (req.files['image_3d'] && req.files['image_3d'].length > 0) {
                updateData.image_3d_url = await uploadToCloudinary(req.files['image_3d'][0]);
            }
            if (req.files['blueprint'] && req.files['blueprint'].length > 0) {
                updateData.blueprint_url = await uploadToCloudinary(req.files['blueprint'][0]);
            }
            
            if (req.files['gallery_images'] && req.files['gallery_images'].length > 0) {
                updateData.gallery_images = [];
                for (const file of req.files['gallery_images']) {
                    const url = await uploadToCloudinary(file);
                    updateData.gallery_images.push(url);
                }
            }
        }

        const room = await roomService.updateRoom(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            data: room
        });

    } catch (err) {
        return handleError(res, err);
    }
};

const deleteRoom = async (req, res) => {
    try {
        const result = await roomService.deleteRoom(req.params.id);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};