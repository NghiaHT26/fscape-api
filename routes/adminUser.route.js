const express = require('express');
const router = express.Router();

const authJwt = require('../middlewares/authJwt');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');
const controller = require('../controllers/adminUser.controller');

router.use(authJwt);

router.post('/', requireRoles(ROLES.ADMIN), controller.createUser);

router.get('/', requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), controller.listUsers);

router.patch('/:id/status', requireRoles(ROLES.ADMIN), controller.updateUserStatus);

router.patch('/:id/building', requireRoles(ROLES.ADMIN), controller.assignBuilding);

module.exports = router;
