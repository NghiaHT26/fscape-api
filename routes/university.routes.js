const express = require('express');
const router = express.Router();
const universityController = require('../controllers/university.controller');

router.get('/', universityController.getAllUniversities);

router.get('/:id', universityController.getUniversityById);

router.post('/', authJwt, requireAdmin, universityController.createUniversity);

router.put('/:id', authJwt, requireAdmin, universityController.updateUniversity);

router.delete('/:id', authJwt, requireAdmin, universityController.deleteUniversity);

router.patch('/:id/status', authJwt, requireAdmin, universityController.toggleUniversityStatus);

module.exports = router;
