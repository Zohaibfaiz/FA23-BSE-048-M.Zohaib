import mongoose from 'mongoose';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    date: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: { type: String, default: '' },
    timeline: [
      {
        step: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export { STATUSES };
export default Appointment;
