const express = require('express');
const router = express.Router();
const controller = require('../controllers/contractTemplate.controller');
const authJwt = require('../middlewares/authJwt');
const requireAdmin = require('../middlewares/requireAdmin');

router.get('/', authJwt, requireAdmin, controller.getAllTemplates);

router.get('/:id', authJwt, requireAdmin, controller.getTemplateById);

router.post('/', authJwt, requireAdmin, controller.createTemplate);

router.put('/:id', authJwt, requireAdmin, controller.updateTemplate);

router.delete('/:id', authJwt, requireAdmin, controller.deleteTemplate);

module.exports = router;
