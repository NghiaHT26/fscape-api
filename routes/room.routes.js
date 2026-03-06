const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const authJwt = require('../middlewares/authJwt');
const authJwtOptional = require('../middlewares/authJwtOptional');
const requireAdmin = require('../middlewares/requireAdmin');
const requireRoles = require('../middlewares/requireRoles');
const { ROLES } = require('../constants/roles');

router.get('/', authJwtOptional, roomController.getAllRooms);

router.get('/:id', authJwtOptional, roomController.getRoomById);

router.post('/', authJwt, requireAdmin, roomController.createRoom);

router.put('/:id', authJwt, requireAdmin, roomController.updateRoom);

router.delete('/:id', authJwt, requireAdmin, roomController.deleteRoom);

router.patch(
  '/:id/status',
  authJwt,
  requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER),
  roomController.toggleRoomStatus
);

module.exports = router;
