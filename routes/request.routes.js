const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const requestController = require('../controllers/request.controller');

router.get('/', requestController.getAllRequests);

router.get('/:id', requestController.getRequestById);

router.post(
    '/',
    upload.array('images', 5),
    requestController.createRequest
);

router.patch('/:id/assign', upload.none(), requestController.assignRequest);

router.patch(
  '/:id/status',
  upload.array('images', 5),
  requestController.updateRequestStatus
);

module.exports = router;
