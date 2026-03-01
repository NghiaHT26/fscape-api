const { Op } = require('sequelize')
const Facility = require('../models/facility.model')
const Building = require('../models/building.model')
const BuildingFacility = require('../models/buildingFacility.model')

/* ================= GET ALL ================= */
const getAllFacilities = async ({
    page = 1,
    limit = 10,
    search,
    is_active,
    building_id
} = {}) => {

    const offset = (page - 1) * limit
    const where = {}

    if (search)
        where.name = { [Op.iLike]: `%${search}%` }

    if (is_active !== undefined)
        where.is_active = is_active === 'true' || is_active === true

    const include = []

    // Nếu lọc theo building → join bảng trung gian
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

/* ================= GET BY ID ================= */
const getFacilityById = async (id) => {

    const facility = await Facility.findByPk(id, {
        include: [{
            model: Building,
            as: 'buildings',
            attributes: ['id', 'name'],
            through: { attributes: ['is_active'] }
        }]
    })

    if (!facility)
        throw { status: 404, message: 'Facility not found' }

    return facility
}

/* ================= CREATE ================= */
const createFacility = async (data) => {
    const { name, image_url, description, is_active } = data;

    if (!name) {
        throw { status: 400, message: 'Facility name is required' };
    }

    // Check trùng tên
    const existing = await Facility.findOne({
        where: { name }
    });

    if (existing) {
        throw { status: 409, message: `Facility "${name}" already exists` };
    }

    const facility = await Facility.create({
        name,
        image_url: image_url || null,
        description: description || null,
        is_active: is_active !== undefined ? is_active : true
    });

    return facility;
};

/* ================= UPDATE ================= */
const updateFacility = async (id, data) => {

    const facility = await Facility.findByPk(id)
    if (!facility)
        throw { status: 404, message: 'Facility not found' }

    if (data.name && data.name !== facility.name) {
        const duplicate = await Facility.findOne({
            where: { name: data.name, id: { [Op.ne]: id } }
        })
        if (duplicate)
            throw { status: 409, message: `Facility "${data.name}" already exists` }
    }

    return await facility.update(data)
}

/* ================= DELETE ================= */
const deleteFacility = async (id) => {

    const facility = await Facility.findByPk(id)
    if (!facility)
        throw { status: 404, message: 'Facility not found' }

    await facility.destroy()
    return { message: `Facility "${facility.name}" deleted successfully` }
}

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
}