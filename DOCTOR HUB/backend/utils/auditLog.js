import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ userId, action, resource, resourceId, details, ip }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ip,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};
