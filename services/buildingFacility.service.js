const BuildingFacility = require('../models/buildingFacility.model')
const Building = require('../models/building.model')
const Facility = require('../models/facility.model')

/**
 * Gán tiện ích vào tòa nhà
 */
const assignFacility = async (data, user) => {
    const { building_id, facility_id } = data

    if (user && user.role === 'BUILDING_MANAGER' && building_id !== user.building_id) {
        throw { status: 403, message: 'Permission denied: Cannot assign to other buildings' }
    }

    const existing = await BuildingFacility.findOne({
        where: { building_id, facility_id }
    })

    if (existing) {
        throw { status: 409, message: 'This facility is already assigned to the building' }
    }

    return await BuildingFacility.create({
        building_id,
        facility_id,
        is_active: true
    })
}

/**
 * Cập nhật trạng thái hoạt động của tiện ích tại 1 tòa nhà cụ thể
 */
const updateStatus = async (id, is_active, user) => {
    const link = await BuildingFacility.findByPk(id)
    if (!link) throw { status: 404, message: 'Link not found' }

    if (user && user.role === 'BUILDING_MANAGER' && link.building_id !== user.building_id) {
        throw { status: 403, message: 'Permission denied: Cannot modify other buildings' }
    }

    return await link.update({ is_active })
}

/**
 * Gỡ bỏ tiện ích khỏi tòa nhà
 */
const removeFacility = async (id, user) => {
    const link = await BuildingFacility.findByPk(id)
    if (!link) throw { status: 404, message: 'Link not found' }

    if (user && user.role === 'BUILDING_MANAGER' && link.building_id !== user.building_id) {
        throw { status: 403, message: 'Permission denied: Cannot modify other buildings' }
    }

    await link.destroy()
    return { message: 'Facility removed from building successfully' }
}

module.exports = { assignFacility, updateStatus, removeFacility }