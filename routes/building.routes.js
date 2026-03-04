const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const buildingController = require('../controllers/building.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/', buildingController.getAllBuildings);

router.get('/:id', buildingController.getBuildingById);

router.post(
    '/',
    authJwt,
    requireAdmin,
    upload.fields([
        { name: 'thumbnail_url', maxCount: 1 },
        { name: 'image_url', maxCount: 10 }
    ]),
    buildingController.createBuilding
);

router.put(
    '/:id',
    authJwt,
    requireAdmin,
    upload.fields([
        { name: 'thumbnail_url', maxCount: 1 },
        { name: 'images_url', maxCount: 10 }
    ]),
    buildingController.updateBuilding
);

router.delete('/:id', authJwt, requireAdmin, buildingController.deleteBuilding);

router.patch('/:id/status', authJwt, requireAdmin, buildingController.toggleBuildingStatus);

module.exports = router;
