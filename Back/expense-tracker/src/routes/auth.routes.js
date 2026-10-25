const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validate.middleware');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
