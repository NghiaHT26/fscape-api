const express = require('express');
const router = express.Router();
const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
const requestController = require('../controllers/request.controller');

router.use(authJwt);

router.get('/', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT), requestController.getAllRequests);

router.get('/:id', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT), requestController.getRequestById);

router.post('/', requireRoles(ROLES.RESIDENT), requestController.createRequest);

router.patch('/:id/assign', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), requestController.assignRequest);

router.patch('/:id/status', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER, ROLES.STAFF, ROLES.RESIDENT), requestController.updateRequestStatus);

module.exports = router;
