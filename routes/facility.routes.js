const express = require('express')
const router = express.Router()
const facilityController = require('../controllers/facility.controller')
const authJwt = require('../middlewares/authJwt')
const authJwtOptional = require('../middlewares/authJwtOptional')
const requireAdmin = require('../middlewares/requireAdmin')

router.get('/', authJwtOptional, facilityController.getAllFacilities)

router.get('/:id', authJwt, requireAdmin, facilityController.getFacilityById)

router.post(
  '/',
  authJwt,
  requireAdmin,
  facilityController.createFacility
)

router.put(
  '/:id',
  authJwt,
  requireAdmin,
  facilityController.updateFacility
)

router.delete('/:id', authJwt, requireAdmin, facilityController.deleteFacility)

module.exports = router
