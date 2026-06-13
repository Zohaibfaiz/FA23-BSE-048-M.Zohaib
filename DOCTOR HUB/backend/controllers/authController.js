import crypto from 'crypto';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

const sendTokens = async (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  profileImage: user.profileImage,
  isActive: user.isActive,
  isVerified: user.isVerified,
});

// @desc    Register user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialization, treatmentType } = req.body;

  const allowedRoles = ['patient', 'doctor'];
  const userRole = allowedRoles.includes(role) ? role : 'patient';

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (userRole === 'doctor' && (!specialization?.trim() || !treatmentType)) {
    res.status(400);
    throw new Error('Doctors must provide specialization and treatment type');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: userRole,
    phone,
    isVerified: userRole === 'patient',
  });

  if (userRole === 'doctor') {
    await Doctor.create({
      userId: user._id,
      specialization: specialization.trim(),
      treatmentType,
      isApproved: false,
    });
  }

  const tokens = await sendTokens(user, res);

  res.status(201).json({
    success: true,
    user: sanitizeUser(user),
    ...tokens,
  });
});

// @desc    Login
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account suspended. Contact support.');
  }

  const tokens = await sendTokens(user, res);

  res.json({
    success: true,
    user: sanitizeUser(user),
    ...tokens,
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }

  const tokens = await sendTokens(user, res);

  res.json({
    success: true,
    user: sanitizeUser(user),
    ...tokens,
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  let extra = {};
  if (req.user.role === 'doctor') {
    extra.doctorProfile = await Doctor.findOne({ userId: req.user._id });
  }

  res.json({
    success: true,
    user: { ...sanitizeUser(req.user), ...extra },
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profileImage } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, profileImage },
    { new: true, runValidators: true }
  );

  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Doctor Hub — Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});
