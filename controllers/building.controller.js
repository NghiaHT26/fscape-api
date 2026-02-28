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
    } catch (err) { return handleError(res, err); }
};

const getBuildingById = async (req, res) => {
    try {
        const building = await buildingService.getBuildingById(req.params.id);
        return res.status(200).json({ success: true, data: building });
    } catch (err) { return handleError(res, err); }
};

const createBuilding = async (req, res) => {
    try {
        const { name, location_id, manager_id } = req.body;
        if (!name || !location_id || !manager_id) {
            return res.status(400).json({ success: false, message: 'Missing name, location_id, or manager_id' });
        }
        const building = await buildingService.createBuilding(req.body);
        return res.status(201).json({ success: true, message: 'Building created', data: building });
    } catch (err) { return handleError(res, err); }
};

const updateBuilding = async (req, res) => {
    try {
        const building = await buildingService.updateBuilding(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Building updated', data: building });
    } catch (err) { return handleError(res, err); }
};

const deleteBuilding = async (req, res) => {
    try {
        const result = await buildingService.deleteBuilding(req.params.id);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return handleError(res, err); }
};

module.exports = { getAllBuildings, getBuildingById, createBuilding, updateBuilding, deleteBuilding };