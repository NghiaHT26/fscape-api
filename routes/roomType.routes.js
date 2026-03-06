const express = require('express')
const router = express.Router()
const roomTypeController = require('../controllers/roomType.controller')
const authJwt = require('../middlewares/authJwt')
const authJwtOptional = require('../middlewares/authJwtOptional')
const requireAdmin = require('../middlewares/requireAdmin')
const requireRoles = require('../middlewares/requireRoles')
const { ROLES } = require('../constants/roles')

router.get('/', authJwtOptional, roomTypeController.getAllRoomTypes)

router.get('/:id', authJwtOptional, roomTypeController.getRoomTypeById)

router.post('/', authJwt, requireAdmin, roomTypeController.createRoomType)

router.put('/:id', authJwt, requireAdmin, roomTypeController.updateRoomType)

router.delete('/:id', authJwt, requireAdmin, roomTypeController.deleteRoomType)

// Template assets
router.get('/:id/assets', authJwt, requireRoles(ROLES.ADMIN, ROLES.BUILDING_MANAGER), roomTypeController.getTemplateAssets)
router.put('/:id/assets', authJwt, requireAdmin, roomTypeController.replaceTemplateAssets)

module.exports = router
