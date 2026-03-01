const locationService = require('../services/location.service');

/**
 * Lấy danh sách khu vực (Kèm phân trang và lọc)
 */
const getAllLocations = async (req, res) => {
    try {
        const { page, limit, search, is_active } = req.query;
        
        const result = await locationService.getAllLocations({
            page,
            limit,
            search,
            is_active
        });

        return res.status(200).json({
            success: true,
            message: "Fetched all locations successfully",
            ...result
        });
    } catch (error) {
        console.error("❌ Controller Error (getAllLocations):", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

/**
 * Lấy chi tiết một khu vực
 */
const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await locationService.getLocationById(id);

        return res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error(`❌ Controller Error (getLocationById - ${req.params.id}):`, error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

/**
 * Tạo mới khu vực
 */
const createLocation = async (req, res) => {
    try {
        const location = await locationService.createLocation(req.body);

        return res.status(201).json({
            success: true,
            message: "Location created successfully",
            data: location
        });
    } catch (error) {
        console.error("❌ Controller Error (createLocation):", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

/**
 * Cập nhật khu vực
 */
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLocation = await locationService.updateLocation(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Location updated successfully",
            data: updatedLocation
        });
    } catch (error) {
        console.error(`❌ Controller Error (updateLocation - ${req.params.id}):`, error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

/**
 * Xóa khu vực
 */
const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await locationService.deleteLocation(id);

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error(`❌ Controller Error (deleteLocation - ${req.params.id}):`, error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

const toggleLocationStatus = async (req, res) => {
    try {
        const location = await locationService.toggleLocationStatus(req.params.id)
        return res.status(200).json({
            success: true,
            message: 'Location status updated successfully',
            data: location
        })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus
};