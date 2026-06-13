import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import Assistant from '../models/Assistant.js';
import { getFileUrl } from '../config/multer.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createPayment = asyncHandler(async (req, res) => {
  const appointmentId = req.body?.appointmentId;

  if (!appointmentId) {
    res.status(400);
    throw new Error('appointmentId is required');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Payment screenshot is required (JPEG or PNG, max 5MB)');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  if (appointment.patientId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only pay for your own appointments');
  }
  if (appointment.status === 'cancelled') {
    res.status(400);
    throw new Error('Cannot pay for a cancelled appointment');
  }

  const existing = await Payment.findOne({ appointmentId });
  if (existing) {
    res.status(400);
    throw new Error('Payment already submitted for this appointment');
  }

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Valid payment amount is required');
  }

  const payment = await Payment.create({
    appointmentId,
    screenshot: getFileUrl(req.file.filename),
    amount,
    status: 'pending',
  });

  appointment.paymentId = payment._id;
  if (!appointment.timeline) appointment.timeline = [];
  appointment.timeline.push({ step: 'payment_uploaded', timestamp: new Date() });
  await appointment.save();

  const populated = await Appointment.findById(appointmentId).populate('paymentId');

  res.status(201).json({ success: true, payment, appointment: populated });
});

export const getPendingPayments = asyncHandler(async (req, res) => {
  const { clinicId, date, status = 'pending' } = req.query;

  const assignments = await Assistant.find({ userId: req.user._id });
  const clinicIds = assignments.map((a) => a.clinicId.toString());

  if (!clinicIds.length) {
    return res.json({
      success: true,
      payments: [],
      stats: { pendingCount: 0, verifiedToday: 0 },
    });
  }

  const appointmentFilter = { clinicId: { $in: clinicIds } };
  if (clinicId && clinicIds.includes(clinicId)) {
    appointmentFilter.clinicId = clinicId;
  }
  if (date) {
    const d = new Date(date);
    appointmentFilter.date = {
      $gte: new Date(d.setHours(0, 0, 0, 0)),
      $lte: new Date(d.setHours(23, 59, 59, 999)),
    };
  }

  const appointmentIds = await Appointment.distinct('_id', appointmentFilter);

  const payments = await Payment.find({
    appointmentId: { $in: appointmentIds },
    status,
  })
    .populate({
      path: 'appointmentId',
      populate: [
        { path: 'patientId', select: 'name email phone' },
        { path: 'clinicId', select: 'name city' },
        { path: 'doctorId', populate: { path: 'userId', select: 'name' } },
      ],
    })
    .sort({ createdAt: -1 });

  const verifiedToday = await Payment.countDocuments({
    verifiedBy: req.user._id,
    status: 'verified',
    updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  res.json({
    success: true,
    payments,
    stats: {
      pendingCount: payments.filter((p) => p.status === 'pending').length,
      verifiedToday,
    },
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { status, verificationNote } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be verified or rejected');
  }

  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  const appointment = await Appointment.findById(payment.appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Linked appointment not found');
  }

  payment.status = status;
  payment.verifiedBy = req.user._id;
  payment.verificationNote = verificationNote || '';
  await payment.save();

  if (status === 'verified') {
    appointment.status = 'confirmed';
    appointment.timeline.push({ step: 'payment_verified', timestamp: new Date() });
    appointment.timeline.push({ step: 'confirmed', timestamp: new Date() });
  } else {
    appointment.timeline.push({ step: 'payment_rejected', timestamp: new Date() });
  }
  await appointment.save();

  res.json({ success: true, payment, appointment });
});
