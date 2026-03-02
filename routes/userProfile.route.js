const express = require('express');
const router = express.Router();

const authJwt = require('../middlewares/authJwt');
const userController = require('../controllers/userProfile.controller'); 

router.get('/me', authJwt, userController.getProfile);
router.put('/me', authJwt, userController.updateProfile);

module.exports = router;