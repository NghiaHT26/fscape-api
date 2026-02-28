const { Op } = require('sequelize')
const Location = require('../models/location.model')
const Building = require('../models/building.model')
const University = require('../models/university.model')

/**
 * Lấy danh sách địa điểm có phân trang, lọc và tìm kiếm
 */
const getAllLocations = async ({ page = 1, limit = 10, search, is_active } = {}) => {
    const offset = (page - 1) * limit
    const where = {}

    // Tìm kiếm theo tên khu vực
    if (search) where.name = { [Op.iLike]: `%${search}%` }
    
    // Lọc theo trạng thái hoạt động
    if (is_active !== undefined) {
        where.is_active = is_active === 'true' || is_active === true
    }

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

/**
 * Lấy chi tiết 1 địa điểm theo ID
 */
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

/**
 * Tạo địa điểm mới
 */
const createLocation = async (data) => {
    const { name } = data
    
    // Kiểm tra tên địa điểm duy nhất
    const existing = await Location.findOne({ where: { name } })
    if (existing) throw { status: 409, message: `Location "${name}" already exists` }

    return await Location.create(data)
}

/**
 * Cập nhật thông tin địa điểm
 */
const updateLocation = async (id, data) => {
    const location = await Location.findByPk(id)
    if (!location) throw { status: 404, message: 'Location not found' }

    // Kiểm tra trùng tên khi đổi tên
    if (data.name && data.name !== location.name) {
        const duplicate = await Location.findOne({ 
            where: { name: data.name, id: { [Op.ne]: id } } 
        })
        if (duplicate) throw { status: 409, message: `Location "${data.name}" already exists` }
    }

    return await location.update(data)
}

/**
 * Xóa địa điểm (Chỉ xóa khi không có tòa nhà liên quan)
 */
const deleteLocation = async (id) => {
    const location = await Location.findByPk(id)
    if (!location) throw { status: 404, message: 'Location not found' }
    
    // Kiểm tra ràng buộc khóa ngoại với bảng buildings thông qua location_id
    const buildingsCount = await Building.count({ where: { location_id: id } })
    if (buildingsCount > 0) {
        throw { 
            status: 400, 
            message: 'Cannot delete location with associated buildings. Please remove buildings first.' 
        }
    }

    await location.destroy()
    return { message: `Location "${location.name}" deleted successfully` }
}

module.exports = { 
    getAllLocations, 
    getLocationById, 
    createLocation, 
    updateLocation, 
    deleteLocation 
}