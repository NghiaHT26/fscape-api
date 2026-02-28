const { Op } = require('sequelize')
const Facility = require('../models/facility.model')
const Building = require('../models/building.model')

/**
 * Lấy danh sách tiện ích kèm phân trang và tìm kiếm
 */
const getAllFacilities = async ({ page = 1, limit = 10, search, is_active } = {}) => {
    const offset = (page - 1) * limit
    const where = {}

    if (search) where.name = { [Op.iLike]: `%${search}%` }
    
    // Xử lý is_active linh hoạt hơn để bắt được cả true/false từ query string
    if (is_active !== undefined) {
        where.is_active = is_active === 'true' || is_active === true;
    }

    const { count, rows } = await Facility.findAndCountAll({
        where,
        include: [
            { 
                model: Building, 
                as: 'buildings', 
                attributes: ['id', 'name'], 
                through: { attributes: [] } 
            }
        ],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true, // Quan trọng: Tránh đếm lặp khi có quan hệ N-N
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

const getFacilityById = async (id) => {
    const facility = await Facility.findByPk(id, {
        include: [{ model: Building, as: 'buildings', through: { attributes: [] } }]
    })
    if (!facility) throw { status: 404, message: 'Facility not found' }
    return facility
}

const createFacility = async (data) => {
    // Chỉ lấy các trường cần thiết để tránh ghi đè ID hoặc các trường nhạy cảm
    const { name, icon_url, description, is_active } = data
    
    const existing = await Facility.findOne({ where: { name } })
    if (existing) throw { status: 409, message: `Facility "${name}" already exists` }

    return await Facility.create({ name, icon_url, description, is_active })
}

const updateFacility = async (id, data) => {
    const facility = await Facility.findByPk(id)
    if (!facility) throw { status: 404, message: 'Facility not found' }

    if (data.name && data.name !== facility.name) {
        const duplicate = await Facility.findOne({ where: { name: data.name, id: { [Op.ne]: id } } })
        if (duplicate) throw { status: 409, message: `Facility "${data.name}" already exists` }
    }

    return await facility.update(data)
}

const deleteFacility = async (id) => {
    const facility = await Facility.findByPk(id)
    if (!facility) throw { status: 404, message: 'Facility not found' }
    
    // Lưu ý: Hệ thống sẽ tự động xóa các liên kết trong building_facilities nhờ CASCADE
    await facility.destroy()
    return { message: `Facility "${facility.name}" deleted successfully` }
}

module.exports = { getAllFacilities, getFacilityById, createFacility, updateFacility, deleteFacility }