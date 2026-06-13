import mongoose from 'mongoose';

const scheduleSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    blockedSlots: [{ type: String }],
  },
  { _id: false }
);

const clinicSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    phone: { type: String },
    mapLink: { type: String, default: '' },
    schedule: [scheduleSlotSchema],
  },
  { timestamps: true }
);

const Clinic = mongoose.model('Clinic', clinicSchema);
export default Clinic;
