import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicines: [medicineSchema],
    notes: { type: String, default: '' },
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },
  },
  { timestamps: true }
);

prescriptionSchema.methods.checkAndLock = function checkAndLock() {
  const hoursSinceCreation =
    (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation >= 24 && !this.isLocked) {
    this.isLocked = true;
    this.lockedAt = new Date();
  }
  return this.isLocked;
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
