import SystemConfig from '../models/SystemConfig.js';
import asyncHandler from '../utils/asyncHandler.js';

export const checkMaintenance = asyncHandler(async (req, res, next) => {
  if (req.user?.role === 'superadmin') return next();

  const config = await SystemConfig.findOne();
  if (config?.maintenanceMode) {
    res.status(503);
    throw new Error('Platform is under maintenance. Please try again later.');
  }
  next();
});
