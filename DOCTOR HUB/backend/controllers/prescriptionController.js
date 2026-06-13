import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';

const lockPrescriptions = async (prescriptions) => {
  for (const rx of prescriptions) {
    if (rx.checkAndLock() && rx.isModified('isLocked')) {
      await rx.save();
    }
  }
};

export const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, medicines, notes } = req.body;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can create prescriptions');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.doctorId.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error('Invalid appointment');
  }

  const existing = await Prescription.findOne({ appointmentId });
  if (existing) {
    res.status(400);
    throw new Error('Prescription already exists for this appointment');
  }

  const prescription = await Prescription.create({
    appointmentId,
    patientId: appointment.patientId,
    doctorId: req.user._id,
    medicines,
    notes,
  });

  res.status(201).json({ success: true, prescription });
});

export const getPrescriptionsByAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.appointmentId;
  const prescriptions = await Prescription.find({
    appointmentId,
  }).populate('doctorId', 'name');

  await lockPrescriptions(prescriptions);

  res.json({ success: true, prescriptions });
});

export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === 'patient'
      ? { patientId: req.user._id }
      : { patientId: req.params.patientId };

  const prescriptions = await Prescription.find(filter)
    .populate('doctorId', 'name')
    .populate('appointmentId', 'date timeSlot')
    .sort({ createdAt: -1 });

  await lockPrescriptions(prescriptions);

  res.json({ success: true, prescriptions });
});
