import express from 'express';
import {
  createPrescription,
  getPrescriptionsByAppointment,
  getPatientPrescriptions,
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { checkPrescriptionLock } from '../middleware/immutable.js';

const router = express.Router();

router.use(protect);

router.post('/', requireRole('doctor'), createPrescription);
router.get('/me', getPatientPrescriptions);
router.get('/patient/:patientId', getPatientPrescriptions);
router.get('/appointment/:appointmentId', getPrescriptionsByAppointment);

router.put('/:id', checkPrescriptionLock, (_req, res) => {
  res.status(403).json({ success: false, message: 'Prescriptions cannot be edited after creation' });
});
router.delete('/:id', checkPrescriptionLock, (_req, res) => {
  res.status(403).json({ success: false, message: 'Prescriptions cannot be deleted' });
});

export default router;
