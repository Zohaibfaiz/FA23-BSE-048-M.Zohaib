// =============================================
// routes/authRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./authController');
const { authenticate, sanitizeInput } = require('./authMiddleware');

router.post('/register', sanitizeInput, register);   // Public
router.post('/login',    sanitizeInput, login);      // Public
router.get('/me',        authenticate,  getMe);      // Protected

module.exports = router;
