const express = require('express');
const router = express.Router();
const requireAdmin = require('../middlewares/requireAdmin');
const controller = require('../controllers/adminUser.controller');

router.use(requireAdmin);

router.post('/', controller.createUser);
router.get('/', controller.listUsers);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deactivateUser);

module.exports = router;