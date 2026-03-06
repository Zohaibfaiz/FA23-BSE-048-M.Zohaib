// =============================================
// routes/courseRoutes.js
// =============================================
const express = require('express');
const router = express.Router();
const ctrl = require('./courseController');
const { authenticate, authorize, sanitizeInput } = require('./authMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/',     ctrl.getAllCourses);                          // Any authenticated user
router.get('/:id',  ctrl.getCourseById);                         // Any authenticated user
router.post('/',    authorize('admin'), sanitizeInput, ctrl.createCourse);  // Admin only
router.put('/:id',  authorize('admin'), sanitizeInput, ctrl.updateCourse);  // Admin only
router.delete('/:id', authorize('admin'), ctrl.deleteCourse);               // Admin only

module.exports = router;
