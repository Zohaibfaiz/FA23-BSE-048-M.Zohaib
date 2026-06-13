import express from 'express';
import {
  getUsers,
  updateUserStatus,
  getStats,
  getAuditLogs,
  createAdmin,
  deleteAdmin,
  getSystemConfig,
  updateSystemConfig,
  broadcastNotification,
  getDoctorsAdmin,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('admin', 'superadmin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stats', getStats);
router.get('/doctors', getDoctorsAdmin);
router.post('/notifications', broadcastNotification);

router.get('/audit-logs', requireRole('superadmin'), getAuditLogs);
router.post('/admins', requireRole('superadmin'), createAdmin);
router.delete('/admins/:id', requireRole('superadmin'), deleteAdmin);
router.get('/system-config', requireRole('superadmin'), getSystemConfig);
router.put('/system-config', requireRole('superadmin'), updateSystemConfig);

export default router;
