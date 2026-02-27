'use strict';

// middleware/errorHandler.js
// Centralized error-handling middleware.
// Express treats a middleware as an "error handler" when it has 4 args:
// (err, req, res, next)
// Restaurant Analogy:
// - Middleware = Manager who handles problems in the kitchen
//   (instead of every chef/controller handling complaints differently)

function errorHandler(err, req, res, next) {
  // If a controller called next(err), it lands here.
  // If headers already sent, delegate to default Express handler.
  if (res.headersSent) return next(err);

  const statusCode = Number(err.statusCode) || 500;

  const payload = {
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: err.message || 'Something went wrong',
  };

  // Avoid leaking stack traces in production.
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
