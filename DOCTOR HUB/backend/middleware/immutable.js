export const blockHistoryMutation = (_req, res, next) => {
  res.status(405);
  throw new Error('Medical history records cannot be edited or deleted');
};

export const checkPrescriptionLock = async (req, res, next) => {
  const Prescription = (await import('../models/Prescription.js')).default;
  const prescription = await Prescription.findById(req.params.id || req.body.prescriptionId);

  if (prescription) {
    prescription.checkAndLock();
    if (prescription.isLocked) {
      await prescription.save();
      res.status(403);
      throw new Error('Prescription is locked and cannot be modified');
    }
  }
  next();
};
