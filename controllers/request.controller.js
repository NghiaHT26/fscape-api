const requestService = require('../services/request.service');

const handleError = (res, err) => {
    console.error('[RequestController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ message });
};

const getAllRequests = async (req, res) => {
    try {
        const result = await requestService.getAllRequests(req.query);
        return res.status(200).json({ ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getRequestById = async (req, res) => {
    try {
        const request = await requestService.getRequestById(req.params.id);
        return res.status(200).json({ data: request });
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
                message: 'Missing required fields: room_id, resident_id, request_type, title'
            });
        }

        // image_urls now comes pre-uploaded from the client
        requestData.imageUrls = requestData.image_urls || [];

        const request = await requestService.createRequest(requestData);

        return res.status(201).json({
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
            return res.status(400).json({ message: 'Missing assigned_staff_id' });
        }

        const request = await requestService.assignRequest(req.params.id, assigned_staff_id, manager_id);

        return res.status(200).json({
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
                message: 'Missing required fields: status, changed_by'
            });
        }

        // completion_images now comes pre-uploaded from the client
        updateData.completionImages = updateData.completion_images || [];

        const request = await requestService.updateRequestStatus(id, updateData);

        return res.status(200).json({
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
