import express from 'express';
import {
  createClinic,
  getClinicsByDoctor,
  updateClinic,
  addAssistant,
  updateSchedule,
} from '../controllers/clinicController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/:doctorId', getClinicsByDoctor);

router.use(protect);
router.post('/', requireRole('doctor'), createClinic);
router.put('/:id', requireRole('doctor'), updateClinic);
router.put('/:id/schedule', requireRole('doctor'), updateSchedule);
router.post('/:id/assistants', requireRole('doctor'), addAssistant);

export default router;
