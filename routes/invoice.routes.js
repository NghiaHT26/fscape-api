const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authJwt = require('../middlewares/authJwt');
const validate = require('../middlewares/validateResult');
const validator = require('../validators/invoice.validator');

router.post('/trigger-job', authJwt, invoiceController.triggerInvoiceJob);

router.get('/my', authJwt, invoiceController.getMyInvoices);

router.get('/:id', authJwt, validator.paramId, validate, invoiceController.getInvoiceById);

module.exports = router;
