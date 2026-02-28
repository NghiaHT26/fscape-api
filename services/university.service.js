const { Op } = require('sequelize');
const University = require('../models/university.model');
const Location = require('../models/location.model');
const Building = require('../models/building.model');

/**
 * Lấy danh sách trường đại học kèm phân trang và khu vực
 */
const getAllUniversities = async ({ page = 1, limit = 10, location_id, is_active, search } = {}) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (location_id) where.location_id = location_id;
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === true;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await University.findAndCountAll({
        where,
        include: [
            { model: Location, as: 'location', attributes: ['id', 'name'] }
        ],
        limit: Number(limit),
        offset: Number(offset),
        order: [['name', 'ASC']]
    });

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

/**
 * Lấy chi tiết trường đại học và các tòa nhà lân cận (cùng location_id)
 */
const getUniversityById = async (id) => {
    const university = await University.findByPk(id, {
        include: [
            { model: Location, as: 'location' }
        ]
    });
    
    if (!university) throw { status: 404, message: 'University not found' };

    const nearbyBuildings = await Building.findAll({
        where: { 
            location_id: university.location_id,
            is_active: true 
        },
        attributes: ['id', 'name', 'address', 'thumbnail_url', 'latitude', 'longitude']
    });

    const universityData = university.toJSON();
    universityData.nearby_buildings = nearbyBuildings;

    return universityData;
};

const createUniversity = async (data) => {
    const { name } = data;
    const existing = await University.findOne({ where: { name } });
    if (existing) throw { status: 409, message: `University "${name}" already exists` };

    return await University.create(data);
};

const updateUniversity = async (id, data) => {
    const university = await University.findByPk(id);
    if (!university) throw { status: 404, message: 'University not found' };

    if (data.name && data.name !== university.name) {
        const duplicate = await University.findOne({ where: { name: data.name, id: { [Op.ne]: id } } });
        if (duplicate) throw { status: 409, message: 'University name already exists' };
    }

    return await university.update(data);
};

const deleteUniversity = async (id) => {
    const university = await University.findByPk(id);
    if (!university) throw { status: 404, message: 'University not found' };
    
    await university.destroy();
    return { message: `University "${university.name}" deleted successfully` };
};

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };