const cloudinary = require('../config/cloudinary');
const facilityService = require('../services/facility.service');

const handleError = (res, err) => {
    console.error('[FacilityController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

const getAllFacilities = async (req, res) => {
    try {
        const result = await facilityService.getAllFacilities(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getFacilityById = async (req, res) => {
    try {
        const facility = await facilityService.getFacilityById(req.params.id);
        return res.status(200).json({ success: true, data: facility });
    } catch (err) {
        return handleError(res, err);
    }
};

const createFacility = async (req, res) => {
    try {
        const { name, description, is_active } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Facility name is required' });
        }

        let imageUrl = null;
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                { folder: 'facilities' }
            );
            imageUrl = result.secure_url;
        }

        const facility = await facilityService.createFacility({
            name,
            description,
            is_active,
            image_url: imageUrl
        });

        return res.status(201).json({ success: true, message: 'Facility created successfully', data: facility });
    } catch (err) {
        return handleError(res, err);
    }
};

const updateFacility = async (req, res) => {
    try {
        const { name, description, is_active } = req.body;
        let updatedData = { name, description, is_active };

        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                { folder: 'facilities' }
            );
            updatedData.image_url = result.secure_url;
        }

        const facility = await facilityService.updateFacility(req.params.id, updatedData);

        return res.status(200).json({ success: true, message: 'Facility updated successfully', data: facility });
    } catch (err) {
        return handleError(res, err);
    }
};

const deleteFacility = async (req, res) => {
    try {
        const result = await facilityService.deleteFacility(req.params.id);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
};