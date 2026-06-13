import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['patient', 'doctor', 'assistant', 'admin', 'superadmin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'patient' },
    phone: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
export { ROLES };
export default User;
