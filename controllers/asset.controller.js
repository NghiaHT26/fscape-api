const assetService = require('../services/asset.service');

const handleError = (res, err) => {
    console.error('[AssetController]', err);
    return res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
};

const getAllAssets = async (req, res) => {
    try {
        const result = await assetService.getAllAssets({ ...req.query, user: req.user });
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return handleError(res, err); }
};

const getAssetById = async (req, res) => {
    try {
        const asset = await assetService.getAssetById(req.params.id, req.user);
        return res.status(200).json({ success: true, data: asset });
    } catch (err) { return handleError(res, err); }
};

const createAsset = async (req, res) => {
    try {
        const { qr_code, name, building_id } = req.body;
        if (!qr_code || !name || !building_id) {
            return res.status(400).json({ success: false, message: 'QR Code, Name and Building ID are required' });
        }
        const asset = await assetService.createAsset(req.body, req.user);
        return res.status(201).json({ success: true, message: 'Asset created', data: asset });
    } catch (err) { return handleError(res, err); }
};

const updateAsset = async (req, res) => {
    try {
        // Lấy ID người thực hiện từ middleware auth (nếu có)
        const performer_id = req.user ? req.user.id : null;
        const asset = await assetService.updateAsset(req.params.id, req.body, req.user);
        return res.status(200).json({ success: true, message: 'Asset updated', data: asset });
    } catch (err) { return handleError(res, err); }
};

const deleteAsset = async (req, res) => {
    try {
        const result = await assetService.deleteAsset(req.params.id, req.user);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return handleError(res, err); }
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset };