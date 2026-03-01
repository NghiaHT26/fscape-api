const buildingService = require('../services/building.service');

const handleError = (res, err) => {
    console.error('[BuildingController]', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(status).json({ success: false, message });
};

const getAllBuildings = async (req, res) => {
    try {
        const result = await buildingService.getAllBuildings(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return handleError(res, err);
    }
};

const getBuildingById = async (req, res) => {
    try {
        const building = await buildingService.getBuildingById(req.params.id);
        return res.status(200).json({ success: true, data: building });
    } catch (err) {
        return handleError(res, err);
    }
};

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
            thumbnail_url,
            is_active
        } = req.body;

        // ✅ Validate đúng theo schema DB
        if (!location_id || !name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: location_id, name, address, latitude, longitude'
            });
        }

        const building = await buildingService.createBuilding({
            location_id,
            name,
            address,
            latitude,
            longitude,
            description,
            total_floors,
            thumbnail_url,
            is_active
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

const updateBuilding = async (req, res) => {
    try {
        const building = await buildingService.updateBuilding(req.params.id, req.body);

        return res.status(200).json({
            success: true,
            message: 'Building updated successfully',
            data: building
        });

    } catch (err) {
        return handleError(res, err);
    }
};

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