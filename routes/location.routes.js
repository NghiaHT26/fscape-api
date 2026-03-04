const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/', locationController.getAllLocations);

router.get('/:id', locationController.getLocationById);

router.post('/', authJwt, requireAdmin, locationController.createLocation);

router.put('/:id', authJwt, requireAdmin, locationController.updateLocation);

router.delete('/:id', authJwt, requireAdmin, locationController.deleteLocation);

router.patch('/:id/status', authJwt, requireAdmin, locationController.toggleLocationStatus);

module.exports = router;
