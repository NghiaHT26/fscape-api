const facilityService = require('../services/facility.service')

const handleError = (res, err) => {
    console.error('[FacilityController]', err)
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    return res.status(status).json({ success: false, message })
}

// GET /api/facilities
const getAllFacilities = async (req, res) => {
    try {
        const { page, limit, search, is_active } = req.query
        const result = await facilityService.getAllFacilities({ page, limit, search, is_active })
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

// GET /api/facilities/:id
const getFacilityById = async (req, res) => {
    try {
        const facility = await facilityService.getFacilityById(req.params.id)
        return res.status(200).json({ success: true, data: facility })
    } catch (err) {
        return handleError(res, err)
    }
}

// POST /api/facilities
const createFacility = async (req, res) => {
    try {
        const { name } = req.body
        if (!name) {
            return res.status(400).json({ success: false, message: 'Facility name is required' })
        }
        const facility = await facilityService.createFacility(req.body)
        return res.status(201).json({ 
            success: true, 
            message: 'Facility created successfully', 
            data: facility 
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// PUT /api/facilities/:id
const updateFacility = async (req, res) => {
    try {
        const facility = await facilityService.updateFacility(req.params.id, req.body)
        return res.status(200).json({ 
            success: true, 
            message: 'Facility updated successfully', 
            data: facility 
        })
    } catch (err) {
        return handleError(res, err)
    }
}

// DELETE /api/facilities/:id
const deleteFacility = async (req, res) => {
    try {
        const result = await facilityService.deleteFacility(req.params.id)
        return res.status(200).json({ success: true, ...result })
    } catch (err) {
        return handleError(res, err)
    }
}

module.exports = { getAllFacilities, getFacilityById, createFacility, updateFacility, deleteFacility }