const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const facilityController = require('../controllers/facility.controller')
const authJwt = require('../middlewares/authJwt')
const requireAdmin = require('../middlewares/requireAdmin')

router.get('/', facilityController.getAllFacilities)

router.get('/:id', facilityController.getFacilityById)

router.post(
  '/',
  authJwt,
  requireAdmin,
  upload.single('image_url'),
  facilityController.createFacility
)

router.put(
  '/:id',
  authJwt,
  requireAdmin,
  upload.single('image_url'),
  facilityController.updateFacility
)

router.delete('/:id', authJwt, requireAdmin, facilityController.deleteFacility)

module.exports = router
