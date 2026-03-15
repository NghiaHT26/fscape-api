const assetService = require('../services/asset.service');

const handleError = (res, err) => {
    console.error('[AssetController]', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};

const getAllAssets = async (req, res) => {
    try {
        const result = await assetService.getAllAssets(req.query, req.user);
        return res.status(200).json({ ...result });
    } catch (err) { return handleError(res, err); }
};

const getAssetById = async (req, res) => {
    try {
        const asset = await assetService.getAssetById(req.params.id, req.user);
        return res.status(200).json({ data: asset });
    } catch (err) { return handleError(res, err); }
};

const createAsset = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        const asset = await assetService.createAsset(req.body);
        return res.status(201).json({ message: 'Asset created', data: asset });
    } catch (err) { return handleError(res, err); }
};

const createBatchAssets = async (req, res) => {
    try {
        const { name, asset_type_id, quantity, price, image_url } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'name is required' });
        }
        const result = await assetService.createBatchAssets({ name, asset_type_id, quantity, price, image_url });
        return res.status(201).json({ message: `${result.count} assets created`, ...result });
    } catch (err) { return handleError(res, err); }
};

const updateAsset = async (req, res) => {
    try {
        const asset = await assetService.updateAsset(req.params.id, req.body, req.user.id);
        return res.status(200).json({ message: 'Asset updated', data: asset });
    } catch (err) { return handleError(res, err); }
};

const assignAsset = async (req, res) => {
    try {
        const { room_id, notes } = req.body;
        const asset = await assetService.assignAsset(req.params.id, { room_id: room_id || null, notes }, req.user);
        return res.status(200).json({ message: 'Asset assigned successfully', data: asset });
    } catch (err) { return handleError(res, err); }
};

const deleteAsset = async (req, res) => {
    try {
        const result = await assetService.deleteAsset(req.params.id);
        return res.status(200).json({ ...result });
    } catch (err) { return handleError(res, err); }
};

const getPublicAssetInfo = async (req, res) => {
    try {
        const asset = await assetService.getPublicAssetInfo(req.params.id);
        return res.status(200).json({ data: asset });
    } catch (err) { return handleError(res, err); }
};

module.exports = { 
    getAllAssets, 
    getAssetById, 
    getPublicAssetInfo,
    createAsset, 
    createBatchAssets, 
    updateAsset, 
    assignAsset, 
    deleteAsset 
};
