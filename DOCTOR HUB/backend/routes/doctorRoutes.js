import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorSchedule,
} from '../controllers/doctorController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', optionalAuth, getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/schedule', getDoctorSchedule);
router.put('/:id', protect, requireRole('doctor'), updateDoctor);

export default router;
