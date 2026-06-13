import mongoose from 'mongoose';

const TREATMENT_TYPES = ['allopathic', 'homeopathic', 'herbal'];

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: { type: String, required: true, trim: true },
    treatmentType: {
      type: String,
      enum: TREATMENT_TYPES,
      required: true,
      index: true,
    },
    diseases: [{ type: String, trim: true }],
    bio: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    qualification: { type: String, default: '' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

doctorSchema.index({ diseases: 1 });
doctorSchema.index({ rating: -1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export { TREATMENT_TYPES };
export default Doctor;
