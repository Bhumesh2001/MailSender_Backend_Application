const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/user/register', userController.signupUser);
router.post('/user/login', userController.loginUser);
router.post('/mail', userController.mailSender);

module.exports = router;