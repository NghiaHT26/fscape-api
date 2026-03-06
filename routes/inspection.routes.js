const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspection.controller');
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

const staffOrAbove = requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF);

router.post('/preview', authJwt, staffOrAbove, inspectionController.previewInspection);

router.post('/', authJwt, staffOrAbove, inspectionController.confirmInspection);

router.post('/:id/settle', authJwt, staffOrAbove, inspectionController.settleInspection);

module.exports = router;
