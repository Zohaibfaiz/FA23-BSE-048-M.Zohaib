import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/AuditLog.js';
import SystemConfig from '../models/SystemConfig.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../utils/auditLog.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, users, total, page: Number(page) });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, isVerified } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive, isVerified },
    { new: true }
  ).select('-password');

  if (user.role === 'doctor' && isVerified !== undefined) {
    await Doctor.findOneAndUpdate({ userId: user._id }, { isApproved: isVerified });
  }

  await logAudit({
    userId: req.user._id,
    action: 'update_user_status',
    resource: 'User',
    resourceId: user._id,
    details: { isActive, isVerified },
    ip: req.ip,
  });

  res.json({ success: true, user });
});

export const getStats = asyncHandler(async (req, res) => {
  const { period = 'weekly' } = req.query;

  const now = new Date();
  let startDate;
  if (period === 'daily') {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else if (period === 'monthly') {
    startDate = new Date(now.setMonth(now.getMonth() - 6));
  } else {
    startDate = new Date(now.setDate(now.getDate() - 28));
  }

  const appointments = await Appointment.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        confirmed: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const [totalUsers, totalDoctors, totalPatients, pendingDoctors] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'patient' }),
    Doctor.countDocuments({ isApproved: false }),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalDoctors,
      totalPatients,
      pendingDoctors,
      chartData: appointments,
    },
  });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    AuditLog.countDocuments(),
  ]);

  res.json({ success: true, logs, total, page: Number(page) });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  await logAudit({
    userId: req.user._id,
    action: 'create_admin',
    resource: 'User',
    resourceId: admin._id,
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    user: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'admin') {
    res.status(404);
    throw new Error('Admin not found');
  }

  await user.deleteOne();

  await logAudit({
    userId: req.user._id,
    action: 'delete_admin',
    resource: 'User',
    resourceId: req.params.id,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Admin deleted' });
});

export const getSystemConfig = asyncHandler(async (req, res) => {
  let config = await SystemConfig.findOne();
  if (!config) {
    config = await SystemConfig.create({});
  }
  res.json({ success: true, config });
});

export const updateSystemConfig = asyncHandler(async (req, res) => {
  const config = await SystemConfig.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
  });

  await logAudit({
    userId: req.user._id,
    action: 'update_system_config',
    resource: 'SystemConfig',
    details: req.body,
    ip: req.ip,
  });

  res.json({ success: true, config });
});

export const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, role } = req.body;

  if (role) {
    const users = await User.find({ role }).select('_id');
    await Notification.insertMany(
      users.map((u) => ({
        userId: u._id,
        title,
        message,
        createdBy: req.user._id,
      }))
    );
  } else {
    await Notification.create({
      broadcast: true,
      title,
      message,
      createdBy: req.user._id,
    });
  }

  res.json({ success: true, message: 'Notification sent' });
});

export const getDoctorsAdmin = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('userId', 'name email phone isActive isVerified profileImage')
    .sort({ createdAt: -1 });

  res.json({ success: true, doctors });
});
