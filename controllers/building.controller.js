const cloudinary = require('../config/cloudinary');
const buildingService = require('../services/building.service');

const handleError = (res, err) => {
    console.error('[BuildingController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

// GET /api/buildings
const getAllBuildings = async (req, res) => {
    try {
        const result = await buildingService.getAllBuildings(req.query, req.user);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

// GET /api/buildings/:id
const getBuildingById = async (req, res) => {
    try {
        const building = await buildingService.getBuildingById(req.params.id, req.user);
        return res.status(200).json({ success: true, data: building });
    } catch (err) {
        return handleError(res, err);
    }
};

// POST /api/buildings
const createBuilding = async (req, res) => {
    try {
        const {
            location_id,
            name,
            address,
            latitude,
            longitude,
            description,
            total_floors,
            is_active,
            facilities
        } = req.body;

        if (!location_id || !name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: location_id, name, address, latitude, longitude'
            });
        }

        let thumbnailUrl = null;
        let imageUrls = [];

        // 1. Xử lý upload ảnh Thumbnail (nếu người dùng có chọn file tên 'thumbnail_url')
        if (req.files && req.files['thumbnail_url'] && req.files['thumbnail_url'].length > 0) {
            const file = req.files['thumbnail_url'][0];
            const result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                { folder: 'buildings' }
            );
            thumbnailUrl = result.secure_url;
        }

        // 2. Xử lý upload danh sách ảnh Images (nếu người dùng có chọn file tên 'images')
        if (req.files && req.files['image_url'] && req.files['image_url'].length > 0) {
            for (const file of req.files['image_url']) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    { folder: 'buildings' }
                );
                imageUrls.push(result.secure_url);
            }
        }

        // Fallback: Nếu không up thumbnail nhưng có up images, lấy tạm ảnh đầu tiên làm thumbnail
        if (!thumbnailUrl && imageUrls.length > 0) {
            thumbnailUrl = imageUrls[0];
        }

        // 3. Xử lý mảng facilities
        let parsedFacilities = [];
        if (facilities) {
            if (Array.isArray(facilities)) {
                parsedFacilities = facilities;
            } else if (typeof facilities === 'string') {
                parsedFacilities = [facilities];
            }
        }

        const building = await buildingService.createBuilding({
            location_id,
            name,
            address,
            latitude,
            longitude,
            description,
            total_floors,
            thumbnail_url: thumbnailUrl, // Truyền link đã upload
            is_active,
            images: imageUrls,           // Truyền mảng link ảnh
            facilities: parsedFacilities
        });

        return res.status(201).json({
            success: true,
            message: 'Building created successfully',
            data: building
        });

    } catch (err) {
        return handleError(res, err);
    }
};

// PUT /api/buildings/:id
const updateBuilding = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // 1. Xử lý ảnh thumbnail mới
        if (req.files && req.files['thumbnail_url'] && req.files['thumbnail_url'].length > 0) {
            const file = req.files['thumbnail_url'][0];
            const result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                { folder: 'buildings' }
            );
            updateData.thumbnail_url = result.secure_url;
        }

        // 2. Xử lý danh sách ảnh mới
        if (req.files && req.files['image_url'] && req.files['image_url'].length > 0) {
            let imageUrls = [];
            for (const file of req.files['image_url']) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    { folder: 'buildings' }
                );
                imageUrls.push(result.secure_url);
            }
            updateData.images = imageUrls;
        }

        // 3. Xử lý mảng facilities
        if (updateData.facilities) {
            if (!Array.isArray(updateData.facilities)) {
                updateData.facilities = [updateData.facilities];
            }
        }

        const building = await buildingService.updateBuilding(req.params.id, updateData);

        return res.status(200).json({
            success: true,
            message: 'Building updated successfully',
            data: building
        });

    } catch (err) {
        return handleError(res, err);
    }
};
// DELETE /api/buildings/:id
const deleteBuilding = async (req, res) => {
    try {
        const result = await buildingService.deleteBuilding(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Building deleted successfully',
            ...result
        });

    } catch (err) {
        return handleError(res, err);
    }
};

// PATCH /api/buildings/:id/status
const toggleBuildingStatus = async (req, res) => {
    try {
        const building = await buildingService.toggleBuildingStatus(req.params.id)
        return res.status(200).json({
            success: true,
            message: 'Building status updated successfully',
            data: building
        })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    toggleBuildingStatus
};