const { Op } = require('sequelize');
const AssetType = require('../models/assetType.model');
const Asset = require('../models/asset.model');
const { ROLES } = require('../constants/roles');

const TIMESTAMP_FIELDS = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];

const getAllAssetTypes = async (query = {}, user = {}) => {
    const { page = 1, limit = 10, search, is_active } = query;
    const offset = (page - 1) * limit;
    const where = {};

    if (is_active !== undefined) {
        where.is_active = is_active === 'true' || is_active === true;
    }
    if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await AssetType.findAndCountAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']]
    });

    let data = rows;
    if (user.role !== ROLES.ADMIN) {
        data = rows.map(row => {
            const obj = row.toJSON();
            for (const field of TIMESTAMP_FIELDS) delete obj[field];
            return obj;
        });
    }

    const [totalActive, totalOverall] = await Promise.all([
        AssetType.count({ where: { is_active: true } }),
        AssetType.count()
    ]);

    return {
        total: count, // This is the filtered count for pagination
        totalOverall,
        active_count: totalActive,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit),
        data
    };
};

const getAssetTypeById = async (id, user = {}) => {
    const assetType = await AssetType.findByPk(id);
    if (!assetType) throw { status: 404, message: 'Asset type not found' };

    if (user.role !== ROLES.ADMIN) {
        const data = assetType.toJSON();
        for (const field of TIMESTAMP_FIELDS) delete data[field];
        return data;
    }
    return assetType;
};

const createAssetType = async (data) => {
    if (!data.name) {
        throw { status: 400, message: 'Asset type name is required' };
    }

    const duplicate = await AssetType.findOne({ where: { name: { [Op.iLike]: data.name } } });
    if (duplicate) {
        throw { status: 409, message: `Asset type "${data.name}" already exists` };
    }



    return AssetType.create(data);
};

const updateAssetType = async (id, data) => {
    const assetType = await AssetType.findByPk(id);
    if (!assetType) throw { status: 404, message: 'Asset type not found' };

    if (data.name && data.name.toLowerCase() !== assetType.name.toLowerCase()) {
        const duplicate = await AssetType.findOne({
            where: { name: { [Op.iLike]: data.name }, id: { [Op.ne]: id } }
        });
        if (duplicate) {
            throw { status: 409, message: `Asset type "${data.name}" already exists` };
        }
    }



    await assetType.update(data);
    return assetType;
};

const deleteAssetType = async (id) => {
    const assetType = await AssetType.findByPk(id);
    if (!assetType) throw { status: 404, message: 'Asset type not found' };

    // Check if any assets are linked
    const linkedAssetsCount = await Asset.count({ where: { asset_type_id: id } });
    if (linkedAssetsCount > 0) {
        throw { status: 400, message: `Cannot delete asset type because it is linked to ${linkedAssetsCount} asset(s). Consider deactivating it instead.` };
    }

    await assetType.destroy();
    return { message: `Asset type "${assetType.name}" has been deleted successfully` };
};

module.exports = { getAllAssetTypes, getAssetTypeById, createAssetType, updateAssetType, deleteAssetType };
