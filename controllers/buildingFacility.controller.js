const buildingFacilityService = require('../services/buildingFacility.service')

const handleError = (res, err) => {
    console.error('[BuildingFacilityController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

// POST /api/building-facilities
// Body: building_id, facility_id
const assignFacility = async (req, res) => {
    try {
        const { building_id, facility_id } = req.body
        if (!building_id || !facility_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing building_id or facility_id'
            })
        }
        const result = await buildingFacilityService.assignFacility(req.body, req.user)
        return res.status(201).json({
            success: true,
            message: 'Facility assigned to building successfully',
            data: result
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// PUT /api/building-facilities/:id
// Body: is_active
const updateStatus = async (req, res) => {
    try {
        const { is_active } = req.body
        if (is_active === undefined) {
            return res.status(400).json({ success: false, message: 'is_active field is required' })
        }
        const result = await buildingFacilityService.updateStatus(req.params.id, is_active, req.user)
        return res.status(200).json({
            success: true,
            message: 'Building facility status updated',
            data: result
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// DELETE /api/building-facilities/:id
const removeFacility = async (req, res) => {
    try {
        const result = await buildingFacilityService.removeFacility(req.params.id, req.user)
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = { assignFacility, updateStatus, removeFacility }