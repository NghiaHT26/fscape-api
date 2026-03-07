const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authJwt = require('../middlewares/authJwt');

router.post('/trigger-job', authJwt, invoiceController.triggerInvoiceJob);

router.get('/my', authJwt, invoiceController.getMyInvoices);

router.get('/:id', authJwt, invoiceController.getInvoiceById);


module.exports = router;
