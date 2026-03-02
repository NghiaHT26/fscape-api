const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const Building = require('../models/building.model');
const Location = require('../models/location.model');
const BuildingImage = require('../models/buildingImage.model');
const Facility = require('../models/facility.model');
const BuildingFacility = require('../models/buildingFacility.model');
const University = require('../models/university.model');
const Room = require('../models/room.model');
const RoomType = require('../models/roomType.model');

const getAllBuildings = async ({ page = 1, limit = 10, location_id, search, is_active } = {}) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (location_id) where.location_id = location_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Building.findAndCountAll({
        where,
        include: [
            { model: Location, as: 'location', attributes: ['id', 'name'] },
            { model: BuildingImage, as: 'images', attributes: ['id', 'image_url'] },
            { model: Facility, as: 'facilities', through: { attributes: ['is_active'] } }
        ],
        limit: Number(limit),
        offset: Number(offset),
        distinct: true,
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data: rows
    };
};

const getBuildingById = async (id) => {
    const building = await Building.findByPk(id, {
        include: [
            { model: Location, as: 'location' },
            { model: BuildingImage, as: 'images' },
            { model: Facility, as: 'facilities' }
        ]
    });
    
    if (!building) throw { status: 404, message: 'Building not found' };

    const rooms = await Room.findAll({
        where: { building_id: id },
        order: [['floor', 'ASC'], ['room_number', 'ASC']]
    });

    const uniqueRoomTypeIds = [...new Set(rooms.map(room => room.room_type_id))];

    // 4. Query lấy thông tin chi tiết của các Room Types đó
    let roomTypes = [];
    if (uniqueRoomTypeIds.length > 0) {
        roomTypes = await RoomType.findAll({
            where: {
                id: uniqueRoomTypeIds
            }
        });
    }

    const nearbyUniversities = await University.findAll({
        where: { location_id: building.location_id, is_active: true },
        attributes: ['id', 'name', 'address', 'latitude', 'longitude']
    });

    const buildingData = building.toJSON();
    buildingData.nearby_universities = nearbyUniversities;
    buildingData.rooms = rooms;
    buildingData.room_types = roomTypes;

    return buildingData;
};

const createBuilding = async (data) => {
    const { facilities, images, ...buildingData } = data;
    
    const transaction = await sequelize.transaction();

    try {
        const building = await Building.create(buildingData, { transaction });

        if (images && images.length > 0) {
            const imageRecords = images.map(url => ({ building_id: building.id, image_url: url }));
            await BuildingImage.bulkCreate(imageRecords, { transaction });
        }

        if (facilities && facilities.length > 0) {
            const facilityRecords = facilities.map(fId => ({ building_id: building.id, facility_id: fId }));
            await BuildingFacility.bulkCreate(facilityRecords, { transaction });
        }

        await transaction.commit();
        return getBuildingById(building.id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateBuilding = async (id, data) => {
    const { facilities, images, ...updateData } = data;
    const building = await Building.findByPk(id);
    if (!building) throw { status: 404, message: 'Building not found' };

    const transaction = await sequelize.transaction();
    try {
        await building.update(updateData, { transaction });

        // Sync Images
        if (images) {
            await BuildingImage.destroy({ where: { building_id: id }, transaction });
            await BuildingImage.bulkCreate(images.map(url => ({ building_id: id, image_url: url })), { transaction });
        }

        // Sync Facilities
        if (facilities) {
            await BuildingFacility.destroy({ where: { building_id: id }, transaction });
            await BuildingFacility.bulkCreate(facilities.map(fId => ({ building_id: id, facility_id: fId })), { transaction });
        }

        await transaction.commit();
        return getBuildingById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteBuilding = async (id) => {
    const building = await Building.findByPk(id);
    if (!building) throw { status: 404, message: 'Building not found' };
    
    await building.destroy();
    return { message: `Building "${building.name}" deleted successfully` };
};

const toggleBuildingStatus = async (id) => {
    const building = await Building.findByPk(id)
    if (!building) throw { status: 404, message: 'Building not found' }

    building.is_active = !building.is_active
    await building.save()

    return building
}

module.exports = { 
    getAllBuildings, 
    getBuildingById, 
    createBuilding, 
    updateBuilding, 
    deleteBuilding, 
    toggleBuildingStatus 
};