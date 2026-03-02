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
        const role = req.user?.role || null;
        const result = await buildingService.getAllBuildings(req.query, role);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

// GET /api/buildings/:id
const getBuildingById = async (req, res) => {
    try {
        const role = req.user?.role || null;
        const building = await buildingService.getBuildingById(req.params.id, role);
        return res.status(200).json({ success: true, data: building });
    } catch (err) {
        return handleError(res, err);
    }
};

// POST /api/buildings (JSON body, ảnh đã upload trước qua /api/upload)
const createBuilding = async (req, res) => {
    try {
        const {
            location_id, name, address, latitude, longitude,
            description, total_floors, thumbnail_url, is_active,
            images,
            facilities
        } = req.body;

        if (!location_id || !name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: location_id, name, address, latitude, longitude'
            });
        }

        const resolvedThumbnail = thumbnail_url || null;

        const building = await buildingService.createBuilding({
            location_id, name, address, latitude, longitude,
            description, total_floors,
            thumbnail_url: resolvedThumbnail,
            is_active,
            images: images || [],
            facilities: Array.isArray(facilities) ? facilities : (facilities ? [facilities] : [])
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

// PUT /api/buildings/:id (JSON body)
const updateBuilding = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.facilities && !Array.isArray(updateData.facilities)) {
            updateData.facilities = [updateData.facilities];
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
            ...result
        });
    } catch (err) {
        return handleError(res, err);
    }
};

// PATCH /api/buildings/:id/status
const toggleBuildingStatus = async (req, res) => {
    try {
        const building = await buildingService.toggleBuildingStatus(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Building status updated successfully',
            data: building
        });
    } catch (err) {
        return handleError(res, err);
    }
};

module.exports = {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    toggleBuildingStatus
};
