import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/', requireRole('patient'), createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/status', requireRole('doctor', 'admin', 'superadmin'), updateAppointmentStatus);
router.delete('/:id', requireRole('patient', 'doctor', 'admin'), cancelAppointment);

export default router;
