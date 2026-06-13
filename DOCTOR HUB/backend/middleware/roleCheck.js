export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Role ${req.user.role} is not authorized for this action`));
    }
    next();
  };
