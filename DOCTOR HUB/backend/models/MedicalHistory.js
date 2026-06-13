import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    diagnosis: { type: String, required: true },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    records: [recordSchema],
    labReports: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
export default MedicalHistory;
