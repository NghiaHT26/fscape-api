const cloudinary = require('../config/cloudinary');
const requestService = require('../services/request.service');

const handleError = (res, err) => {
    console.error('[RequestController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

const uploadToCloudinary = async (file) => {
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'requests' }
    );
    return result.secure_url;
};

const getAllRequests = async (req, res) => {
    try {
        const result = await requestService.getAllRequests(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getRequestById = async (req, res) => {
    try {
        const request = await requestService.getRequestById(req.params.id);
        return res.status(200).json({ success: true, data: request });
    } catch (err) {
        return handleError(res, err);
    }
};

// Resident tạo Request
const createRequest = async (req, res) => {
    try {
        const requestData = { ...req.body };

        if (!requestData.room_id || !requestData.resident_id || !requestData.request_type || !requestData.title) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: room_id, resident_id, request_type, title'
            });
        }

        // Upload ảnh đính kèm (ATTACHMENT)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToCloudinary(file);
                imageUrls.push(url);
            }
        }
        requestData.imageUrls = imageUrls;

        const request = await requestService.createRequest(requestData);

        return res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: request
        });
    } catch (err) {
        return handleError(res, err);
    }
};

// Manager gán việc cho Staff
const assignRequest = async (req, res) => {
    try {
        const { assigned_staff_id, manager_id } = req.body;
        
        if (!assigned_staff_id) {
            return res.status(400).json({ success: false, message: 'Missing assigned_staff_id' });
        }

        const request = await requestService.assignRequest(req.params.id, assigned_staff_id, manager_id);

        return res.status(200).json({
            success: true,
            message: 'Request assigned successfully',
            data: request
        });
    } catch (err) {
        return handleError(res, err);
    }
};

// Staff hoặc Resident cập nhật trạng thái
const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (!updateData.status || !updateData.changed_by) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: status, changed_by' 
            });
        }

        // Upload ảnh báo cáo hoàn thành (COMPLETION) của Staff
        let completionImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadToCloudinary(file);
                completionImages.push(url);
            }
        }
        updateData.completionImages = completionImages;

        const request = await requestService.updateRequestStatus(id, updateData);

        return res.status(200).json({
            success: true,
            message: `Request status updated to ${updateData.status}`,
            data: request
        });
    } catch (err) {
        return handleError(res, err);
    }
};

module.exports = {
    getAllRequests,
    getRequestById,
    createRequest,
    assignRequest,
    updateRequestStatus
};