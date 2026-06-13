import MedicalHistory from '../models/MedicalHistory.js';
import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';

const canAccessHistory = async (req, patientId) => {
  if (req.user.role === 'patient' && req.user._id.toString() === patientId) {
    return true;
  }
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    return !!doctor;
  }
  if (['admin', 'superadmin'].includes(req.user.role)) return true;
  return false;
};

export const getMedicalHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!(await canAccessHistory(req, patientId))) {
    res.status(403);
    throw new Error('Not authorized to view this history');
  }

  let history = await MedicalHistory.findOne({ patientId }).populate({
    path: 'records.doctorId',
    populate: { path: 'userId', select: 'name' },
  });

  if (!history) {
    history = { patientId, records: [], labReports: [] };
  }

  res.json({ success: true, history });
});

export const addMedicalRecord = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { diagnosis, notes, date } = req.body;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(403);
    throw new Error('Only doctors can add medical records');
  }

  let history = await MedicalHistory.findOne({ patientId });
  if (!history) {
    history = await MedicalHistory.create({ patientId, records: [] });
  }

  history.records.push({
    date: date || new Date(),
    doctorId: doctor._id,
    diagnosis,
    notes: notes || '',
    createdAt: new Date(),
  });

  await history.save();

  const populated = await MedicalHistory.findById(history._id).populate({
    path: 'records.doctorId',
    populate: { path: 'userId', select: 'name' },
  });

  res.status(201).json({ success: true, history: populated });
});

export const uploadLabReport = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const patientId = req.user._id;

  if (!req.file) {
    res.status(400);
    throw new Error('Lab report file is required');
  }

  let history = await MedicalHistory.findOne({ patientId });
  if (!history) {
    history = await MedicalHistory.create({ patientId, records: [], labReports: [] });
  }

  const { getFileUrl } = await import('../config/multer.js');
  history.labReports.push({
    title: title || 'Lab Report',
    fileUrl: getFileUrl(req.file.filename),
  });
  await history.save();

  res.status(201).json({ success: true, history });
});
