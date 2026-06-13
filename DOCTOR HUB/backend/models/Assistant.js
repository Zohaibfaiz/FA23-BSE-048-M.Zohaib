import mongoose from 'mongoose';

const assistantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

assistantSchema.index({ userId: 1, clinicId: 1 }, { unique: true });

const Assistant = mongoose.model('Assistant', assistantSchema);
export default Assistant;
