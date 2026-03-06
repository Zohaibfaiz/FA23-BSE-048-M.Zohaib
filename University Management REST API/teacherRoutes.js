// =============================================
// routes/teacherRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const ctrl = require('./teacherController');
const { authenticate, authorize, sanitizeInput } = require('./authMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/',     ctrl.getAllTeachers);                          // Any authenticated user
router.get('/:id',  ctrl.getTeacherById);                         // Any authenticated user
router.post('/',    authorize('admin'), sanitizeInput, ctrl.createTeacher);  // Admin only
router.put('/:id',  authorize('admin'), sanitizeInput, ctrl.updateTeacher);  // Admin only
router.delete('/:id', authorize('admin'), ctrl.deleteTeacher);               // Admin only

module.exports = router;
