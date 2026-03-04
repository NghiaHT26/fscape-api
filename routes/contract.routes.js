const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const authJwt = require('../middlewares/authJwt');

router.get('/', contractController.getAllContracts);

router.get('/my', authJwt, contractController.getMyContracts);

router.get('/:id', contractController.getContractById);

router.post('/', contractController.createContract);

router.put('/:id', contractController.updateContract);

router.delete('/:id', contractController.deleteContract);

router.patch('/:id/approve', authJwt, contractController.approveContract);

module.exports = router;
