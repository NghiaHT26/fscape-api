const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');

router.get('/', requestController.getAllRequests);

router.get('/:id', requestController.getRequestById);

router.post('/', requestController.createRequest);

router.patch('/:id/assign', requestController.assignRequest);

router.patch('/:id/status', requestController.updateRequestStatus);

module.exports = router;
