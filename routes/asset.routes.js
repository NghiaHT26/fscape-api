const express = require('express');
const router = express.Router();
const assetController = require('../controllers/asset.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.get('/', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF), assetController.getAllAssets);

router.get('/:id', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF), assetController.getAssetById);

router.post('/', authJwt, requireAdmin, assetController.createAsset);

router.post('/batch', authJwt, requireAdmin, assetController.createBatchAssets);

router.put('/:id', authJwt, requireAdmin, assetController.updateAsset);

router.patch('/:id/assign', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF), assetController.assignAsset);

router.delete('/:id', authJwt, requireAdmin, assetController.deleteAsset);

module.exports = router;
