const express = require('express');
const router = express.Router();
const buildingFacilityController = require('../controllers/buildingFacility.controller');

router.post('/', buildingFacilityController.assignFacility);

router.put('/:id', buildingFacilityController.updateStatus);

router.delete('/:id', buildingFacilityController.removeFacility);

module.exports = router;
