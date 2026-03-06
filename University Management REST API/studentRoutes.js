// =============================================
// routes/studentRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const ctrl = require('./studentController');
const { authenticate, authorize, sanitizeInput } = require('./authMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/',     ctrl.getAllStudents);                          // Any authenticated user
router.get('/:id',  ctrl.getStudentById);                         // Any authenticated user
router.post('/',    authorize('admin'), sanitizeInput, ctrl.createStudent);  // Admin only
router.put('/:id',  authorize('admin'), sanitizeInput, ctrl.updateStudent);  // Admin only
router.delete('/:id', authorize('admin'), ctrl.deleteStudent);               // Admin only

module.exports = router;
