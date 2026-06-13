import User from '../models/User.js';
import { verifyAccessToken } from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is suspended');
  }

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    } catch {
      req.user = null;
    }
  }
  next();
});
