import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import Assistant from '../models/Assistant.js';
import asyncHandler from '../utils/asyncHandler.js';

const defaultTimeline = () => [{ step: 'booked', timestamp: new Date() }];

/** Parse YYYY-MM-DD to local noon to avoid timezone day-shift */
const parseBookingDate = (dateInput) => {
  if (!dateInput) return null;
  const str = String(dateInput).slice(0, 10);
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return new Date(dateInput);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

const dayRange = (dateInput) => {
  const day = parseBookingDate(dateInput);
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, clinicId, date, timeSlot, notes } = req.body;

  if (!doctorId || !clinicId || !date || !timeSlot) {
    res.status(400);
    throw new Error('doctorId, clinicId, date, and timeSlot are required');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor?.isApproved) {
    res.status(400);
    throw new Error('Doctor is not available for booking (pending approval)');
  }

  const clinic = await Clinic.findOne({ _id: clinicId, doctorId });
  if (!clinic) {
    res.status(400);
    throw new Error('Invalid clinic for this doctor');
  }

  const { start, end } = dayRange(date);
  const existing = await Appointment.findOne({
    clinicId,
    date: { $gte: start, $lte: end },
    timeSlot,
    status: { $nin: ['cancelled'] },
  });
  if (existing) {
    res.status(400);
    throw new Error('This time slot is already booked. Please choose another.');
  }

  const appointmentDate = parseBookingDate(date);

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    clinicId,
    date: appointmentDate,
    timeSlot,
    notes,
    status: 'pending',
    timeline: defaultTimeline(),
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('doctorId')
    .populate('clinicId')
    .populate('patientId', 'name email phone');

  res.status(201).json({ success: true, appointment: populated });
});

export const getAppointments = asyncHandler(async (req, res) => {
  const { status, date, clinicId, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) {
    const { start, end } = dayRange(date);
    filter.date = { $gte: start, $lte: end };
  }
  if (clinicId) filter.clinicId = clinicId;

  const role = req.user.role;

  if (role === 'patient') {
    filter.patientId = req.user._id;
  } else if (role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.json({ success: true, appointments: [], total: 0 });
    }
    filter.doctorId = doctor._id;
  } else if (role === 'assistant') {
    const assignments = await Assistant.find({ userId: req.user._id });
    filter.clinicId = { $in: assignments.map((a) => a.clinicId) };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'name email phone profileImage')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profileImage' } })
      .populate('clinicId', 'name city address')
      .populate('paymentId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  res.json({ success: true, appointments, total, page: Number(page) });
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patientId', 'name email phone profileImage')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name profileImage' } })
    .populate('clinicId')
    .populate('paymentId');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  res.json({ success: true, appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  appointment.timeline.push({ step: status, timestamp: new Date() });
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email')
    .populate('clinicId', 'name');

  res.json({ success: true, appointment: populated });
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (
    req.user.role === 'patient' &&
    (appointment.patientId.toString() !== req.user._id.toString() ||
      appointment.status !== 'pending')
  ) {
    res.status(403);
    throw new Error('Can only cancel pending appointments');
  }

  appointment.status = 'cancelled';
  appointment.timeline.push({ step: 'cancelled', timestamp: new Date() });
  await appointment.save();

  res.json({ success: true, appointment });
});
