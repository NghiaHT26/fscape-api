const express = require('express')
const router = express.Router()
const roomTypeController = require('../controllers/roomType.controller')
const authJwt = require('../middlewares/authJwt')
const requireAdmin = require('../middlewares/requireAdmin')

router.get('/', roomTypeController.getAllRoomTypes)

router.get('/:id', roomTypeController.getRoomTypeById)

router.post('/', authJwt, requireAdmin, roomTypeController.createRoomType)

router.put('/:id', authJwt, requireAdmin, roomTypeController.updateRoomType)

router.delete('/:id', authJwt, requireAdmin, roomTypeController.deleteRoomType)

module.exports = router
