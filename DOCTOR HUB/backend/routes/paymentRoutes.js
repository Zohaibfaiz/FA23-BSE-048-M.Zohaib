import express from 'express';
import {
  createPayment,
  getPendingPayments,
  verifyPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { upload } from '../config/multer.js';
const router = express.Router();

const uploadScreenshot = (req, res, next) => {
  upload.single('screenshot')(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message || 'File upload failed'));
    }
    next();
  });
};

router.use(protect);

router.post('/', requireRole('patient'), uploadScreenshot, createPayment);
router.get('/pending', requireRole('assistant'), getPendingPayments);
router.patch('/:id/verify', requireRole('assistant'), verifyPayment);

export default router;
