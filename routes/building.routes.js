const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building.controller');
const authJwt = require('../middlewares/authJwt');
const authJwtOptional = require('../middlewares/authJwtOptional');
const requireAdmin = require('../middlewares/requireAdmin');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.get('/', authJwtOptional, buildingController.getAllBuildings);

router.get(
  "/:buildingId/staffs",

  buildingController.getStaffsInBuilding
);

router.get('/:id', authJwtOptional, buildingController.getBuildingById);

router.post(
    '/',
    authJwt,
    requireAdmin,
    buildingController.createBuilding
);

router.put(
    '/:id',
    authJwt,
    requireAdmin,
    buildingController.updateBuilding
);

router.delete('/:id', authJwt, requireAdmin, buildingController.deleteBuilding);

router.patch('/:id/status', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), buildingController.toggleBuildingStatus);

module.exports = router;
