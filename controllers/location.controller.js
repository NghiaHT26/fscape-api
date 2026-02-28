const { Op } = require('sequelize')
const Location = require('../models/location.model')
const Building = require('../models/building.model')
const University = require('../models/university.model')

/**
 * Lấy danh sách địa điểm kèm số lượng Building và University liên quan
 */
const getAllLocations = async ({ page = 1, limit = 10, search, is_active } = {}) => {
    const offset = (page - 1) * limit
    const where = {}

    if (search) where.name = { [Op.iLike]: `%${search}%` }
    if (is_active !== undefined) where.is_active = is_active === 'true'

    const { count, rows } = await Location.findAndCountAll({
        where,
        include: [
            { model: Building, as: 'buildings', attributes: ['id'] },
            { model: University, as: 'universities', attributes: ['id'] }
        ],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true,
        order: [['name', 'ASC']]
    })

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    }
}

const getLocationById = async (id) => {
    const location = await Location.findByPk(id, {
        include: [
            { model: Building, as: 'buildings' },
            { model: University, as: 'universities' }
        ]
    })
    if (!location) throw { status: 404, message: 'Location not found' }
    return location
}

const createLocation = async (data) => {
    const { name } = data
    const existing = await Location.findOne({ where: { name } })
    if (existing) throw { status: 409, message: `Location "${name}" already exists` }

    return await Location.create(data)
}

const updateLocation = async (id, data) => {
    const location = await Location.findByPk(id)
    if (!location) throw { status: 404, message: 'Location not found' }

    if (data.name && data.name !== location.name) {
        const duplicate = await Location.findOne({ 
            where: { name: data.name, id: { [Op.ne]: id } } 
        })
        if (duplicate) throw { status: 409, message: `Location "${data.name}" already exists` }
    }

    return await location.update(data)
}

const deleteLocation = async (id) => {
    const location = await Location.findByPk(id)
    if (!location) throw { status: 404, message: 'Location not found' }
    
    // Kiểm tra các tòa nhà thuộc location_id
    const buildingsCount = await Building.count({ where: { location_id: id } })
    if (buildingsCount > 0) {
        throw { status: 400, message: 'Cannot delete location with associated buildings' }
    }

    await location.destroy()
    return { message: `Location "${location.name}" deleted successfully` }
}

module.exports = { getAllLocations, getLocationById, createLocation, updateLocation, deleteLocation }