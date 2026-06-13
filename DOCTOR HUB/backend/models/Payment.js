import mongoose from 'mongoose';

const STATUSES = ['pending', 'verified', 'rejected'];

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true,
      index: true,
    },
    screenshot: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationNote: { type: String, default: '' },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export { STATUSES };
export default Payment;
