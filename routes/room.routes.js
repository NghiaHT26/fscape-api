const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const roomController = require('../controllers/room.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/', roomController.getAllRooms);

router.get('/:id', roomController.getRoomById);

router.post(
  '/',
  authJwt,
  requireAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image_3d', maxCount: 1 },
    { name: 'blueprint', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  roomController.createRoom
);

router.put(
  '/:id',
  authJwt,
  requireAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image_3d', maxCount: 1 },
    { name: 'blueprint', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
  ]),
  roomController.updateRoom
);

router.delete('/:id', authJwt, requireAdmin, roomController.deleteRoom);

module.exports = router;
