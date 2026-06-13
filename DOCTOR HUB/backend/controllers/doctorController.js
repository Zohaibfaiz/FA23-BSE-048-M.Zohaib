import Doctor from '../models/Doctor.js';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDoctors = asyncHandler(async (req, res) => {
  const { disease, type, city, rating, page = 1, limit = 12 } = req.query;
  const filter = { isApproved: true };

  if (type) filter.treatmentType = type;
  if (disease) filter.diseases = { $regex: disease, $options: 'i' };
  if (rating) filter.rating = { $gte: Number(rating) };

  let doctors = await Doctor.find(filter)
    .populate('userId', 'name profileImage phone isVerified')
    .sort({ rating: -1 })
    .lean();

  if (city) {
    const clinicDoctorIds = await Clinic.distinct('doctorId', {
      city: { $regex: city, $options: 'i' },
    });
    doctors = doctors.filter((d) =>
      clinicDoctorIds.some((id) => id.toString() === d._id.toString())
    );
  }

  const start = (Number(page) - 1) * Number(limit);
  const paginated = doctors.slice(start, start + Number(limit));

  const withClinics = await Promise.all(
    paginated.map(async (doc) => {
      const clinics = await Clinic.find({ doctorId: doc._id }).select('name city address');
      return { ...doc, clinics };
    })
  );

  res.json({
    success: true,
    doctors: withClinics,
    total: doctors.length,
    page: Number(page),
    pages: Math.ceil(doctors.length / Number(limit)),
  });
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(
    'userId',
    'name email phone profileImage isVerified'
  );
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const clinics = await Clinic.find({ doctorId: doctor._id });

  res.json({ success: true, doctor, clinics });
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor || doctor._id.toString() !== req.params.id) {
    const target = await Doctor.findById(req.params.id);
    if (!target || target.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
  }

  const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name profileImage');

  res.json({ success: true, doctor: updated });
});

export const getDoctorSchedule = asyncHandler(async (req, res) => {
  const { clinicId } = req.query;
  const filter = { doctorId: req.params.id };
  if (clinicId) filter._id = clinicId;

  const clinics = await Clinic.find(filter).select('name schedule city');
  res.json({ success: true, clinics });
});
