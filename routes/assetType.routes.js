const express = require('express');
const router = express.Router();
const assetTypeController = require('../controllers/assetType.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.get('/', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF), assetTypeController.getAllAssetTypes);

router.get('/:id', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF), assetTypeController.getAssetTypeById);

router.post('/', authJwt, requireAdmin, assetTypeController.createAssetType);

router.put('/:id', authJwt, requireAdmin, assetTypeController.updateAssetType);

router.delete('/:id', authJwt, requireAdmin, assetTypeController.deleteAssetType);

module.exports = router;
