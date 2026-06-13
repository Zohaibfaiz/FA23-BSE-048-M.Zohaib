import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';
import Assistant from '../models/Assistant.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createClinic = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can create clinics');
  }

  const clinic = await Clinic.create({ ...req.body, doctorId: doctor._id });
  res.status(201).json({ success: true, clinic });
});

export const getClinicsByDoctor = asyncHandler(async (req, res) => {
  const clinics = await Clinic.find({ doctorId: req.params.doctorId });
  res.json({ success: true, clinics });
});

export const updateClinic = asyncHandler(async (req, res) => {
  const clinic = await Clinic.findById(req.params.id);
  if (!clinic) {
    res.status(404);
    throw new Error('Clinic not found');
  }

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor || clinic.doctorId.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const updated = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, clinic: updated });
});

export const addAssistant = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const clinic = await Clinic.findById(req.params.id);

  if (!clinic) {
    res.status(404);
    throw new Error('Clinic not found');
  }

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor || clinic.doctorId.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  let assistantUser = await User.findOne({ email });
  if (!assistantUser) {
    assistantUser = await User.create({
      name: req.body.name || email.split('@')[0],
      email,
      password: req.body.password || 'Assistant@123',
      role: 'assistant',
      isVerified: true,
    });
  } else if (assistantUser.role !== 'assistant') {
    assistantUser.role = 'assistant';
    await assistantUser.save();
  }

  const assistant = await Assistant.findOneAndUpdate(
    { userId: assistantUser._id, clinicId: clinic._id },
    { doctorId: doctor._id },
    { upsert: true, new: true }
  );

  res.json({ success: true, assistant, user: { name: assistantUser.name, email: assistantUser.email } });
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const { schedule } = req.body;
  const clinic = await Clinic.findById(req.params.id);

  if (!clinic) {
    res.status(404);
    throw new Error('Clinic not found');
  }

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor || clinic.doctorId.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  clinic.schedule = schedule;
  await clinic.save();

  res.json({ success: true, clinic });
});
