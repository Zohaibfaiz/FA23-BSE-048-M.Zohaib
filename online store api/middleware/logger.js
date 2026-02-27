'use strict';

// middleware/logger.js
// Global logger middleware.
// Restaurant Analogy:
// - Client = Customer placing an order
// - Middleware = Waiter who notes what was ordered (method + URL) and when
// - Controller = Chef who prepares the food (business logic)
// - Response = Food delivered back to the customer

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  // Using originalUrl preserves the full path (including mounted router paths).
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  // Middleware flow note:
  // Calling next() passes control to the next middleware/route handler.
  next();
}

module.exports = logger;
