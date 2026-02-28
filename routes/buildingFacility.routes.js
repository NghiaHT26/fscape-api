const express = require('express');
const router = express.Router();
const buildingFacilityController = require('../controllers/buildingFacility.controller');

// Quản lý liên kết Building ↔ Facility
router.post('/', buildingFacilityController.assignFacility);         // POST /api/building-facilities
router.put('/:id', buildingFacilityController.updateStatus);         // PUT  /api/building-facilities/:id
router.delete('/:id', buildingFacilityController.removeFacility);    // DELETE /api/building-facilities/:id

module.exports = router;