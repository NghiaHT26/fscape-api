const { Op } = require('sequelize')
const Facility = require('../models/facility.model')
const Building = require('../models/building.model')
const { ROLES } = require('../constants/roles')

const getAllFacilities = async ({ page = 1, limit = 10, search, is_active, building_id } = {}, user) => {
    const offset = (page - 1) * limit
    const where = {}

    if (search) where.name = { [Op.iLike]: `%${search}%` }

    if (user && user.role === ROLES.ADMIN) {
        if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true
    } else {
        where.is_active = true
    }

    const include = []
    if (building_id) {
        include.push({
            model: Building,
            as: 'buildings',
            where: { id: building_id },
            attributes: [],
            through: { attributes: [] }
        })
    }

    const { count, rows } = await Facility.findAndCountAll({
        where,
        include,
        distinct: true,
        limit: Number(limit),
        offset: Number(offset),
        order: [['is_active', 'DESC'], ['name', 'ASC']]
    })

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    }
}

const getFacilityById = async (id, user) => {
    const where = { id }
    if (user && user.role !== ROLES.ADMIN) {
        where.is_active = true
    }

    const facility = await Facility.findOne({
        where,
        include: [{
            model: Building,
            as: 'buildings',
            attributes: ['id', 'name'],
            through: { attributes: ['is_active'] }
        }]
    })

    if (!facility) throw { status: 404, message: 'Facility not found' }
    return facility
}

const createFacility = async (data) => {
    const { name, description, is_active, image_url } = data;

    // Check duplicate name
    const duplicate = await Facility.findOne({ where: { name } });
    if (duplicate) throw { status: 409, message: `Facility "${name}" already exists` };

    const facility = await Facility.create({
        name,
        description,
        is_active,
        image_url
    });

    return facility;
};

const updateFacility = async (id, data) => {
    const facility = await Facility.findByPk(id)
    if (!facility) throw { status: 404, message: 'Facility not found' }

    if (data.name && data.name !== facility.name) {
        const duplicate = await Facility.findOne({
            where: { name: data.name, id: { [Op.ne]: id } }
        })
        if (duplicate) throw { status: 409, message: `Facility "${data.name}" already exists` }
    }

    await facility.update(data)
    return facility
}

const deleteFacility = async (id) => {
    const facility = await Facility.findByPk(id)
    if (!facility) throw { status: 404, message: 'Facility not found' }

    await facility.destroy()
    return { message: `Facility "${facility.name}" deleted successfully` }
}

const updateFacilityStatus = async (id, is_active, user) => {
    const facility = await Facility.findByPk(id)
    if (!facility) throw { status: 404, message: 'Facility not found' }

    facility.is_active = is_active
    await facility.save()
    return facility
}

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility,
    updateFacilityStatus
}