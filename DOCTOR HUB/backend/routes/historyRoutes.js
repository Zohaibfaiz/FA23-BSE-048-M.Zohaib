import express from 'express';
import {
  getMedicalHistory,
  addMedicalRecord,
  uploadLabReport,
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { blockHistoryMutation } from '../middleware/immutable.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.get('/:patientId', getMedicalHistory);
router.post('/:patientId', requireRole('doctor'), addMedicalRecord);
router.post('/lab-reports/upload', requireRole('patient'), upload.single('report'), uploadLabReport);

router.put('/:patientId', blockHistoryMutation);
router.delete('/:patientId', blockHistoryMutation);
router.patch('/:patientId', blockHistoryMutation);

export default router;
