const express = require('express');
const router = express.Router();

const controller = require('../controllers/serviceType.controller');
const validate = require('../middlewares/validateResult');
const { serviceTypeValidator } = require('../validators');

router.post(
  '/',
  serviceTypeValidator.create,
  validate,
  controller.createServiceType
);

router.get(
  '/',
  serviceTypeValidator.pagination,
  validate,
  controller.getAllServiceTypes
);

router.get('/:id', controller.getServiceTypeById);

router.put(
  '/:id',
  serviceTypeValidator.update,
  validate,
  controller.updateServiceType
);

router.delete('/:id', controller.deleteServiceType);

module.exports = router;
