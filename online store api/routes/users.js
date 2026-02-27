'use strict';

// routes/users.js
// This router is mounted at /users in app.js.
// Router-level middleware is applied here so it affects ONLY /users routes.
// Restaurant Analogy:
// - Router-level auth middleware = Security guard at the VIP entrance for "users" area

const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// Router-level auth middleware: applies to all routes defined on this router.
router.use(auth);

// GET /users/:id -> Demonstrate route parameters.
router.get('/:id', userController.getUserById);

// POST /users -> Accept JSON data using req.body.
router.post('/', userController.createUser);

module.exports = router;
