const BuildingFacility = require('../models/buildingFacility.model')
const Building = require('../models/building.model')
const Facility = require('../models/facility.model')

/**
 * Gán tiện ích vào tòa nhà
 */
const assignFacility = async (data) => {
    const { building_id, facility_id } = data

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
const updateStatus = async (id, is_active) => {
    const link = await BuildingFacility.findByPk(id)
    if (!link) throw { status: 404, message: 'Link not found' }

    return await link.update({ is_active })
}

/**
 * Gỡ bỏ tiện ích khỏi tòa nhà
 */
const removeFacility = async (id) => {
    const link = await BuildingFacility.findByPk(id)
    if (!link) throw { status: 404, message: 'Link not found' }

    await link.destroy()
    return { message: 'Facility removed from building successfully' }
}

module.exports = { assignFacility, updateStatus, removeFacility }