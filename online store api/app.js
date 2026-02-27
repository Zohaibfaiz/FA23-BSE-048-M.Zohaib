'use strict';

// app.js (Main server entry point)
// This file wires the HTTP server together:
// - Global middleware
// - Routers (feature modules)
// - 404 handler
// - Centralized error handler
// Keeping it lean supports scalable MVC growth.

const express = require('express');

const { PORT } = require('./config/server');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();

// Request lifecycle (high level):
// Restaurant Analogy mapping:
// - Client = Customer
// - Middleware = Waiter / Security Guard
// - Router = Host who directs you to the right area
// - Controller = Chef
// - Response = Food
//
// Typical flow for an incoming request:
// 1) app-level middleware runs in the order you register it (top to bottom)
// 2) Express tries to match a route (including mounted routers like /products and /users)
// 3) If matched: route middleware -> controller -> response
// 4) If not matched: global 404 handler runs
// 5) If any handler calls next(err): centralized error handler returns a consistent error response

// 1) Built-in middleware: parse JSON bodies.
// Without express.json(), req.body would be undefined for JSON requests.
app.use(express.json());

// 2) Global middleware: logs every request.
app.use(logger);

// 3) Routers: modular route handling.
// Mounting routers keeps app.js clean and each feature isolated.
app.use('/products', productRoutes);
app.use('/users', userRoutes);

// 4) Global 404 handler: runs if no route matched.
// Restaurant Analogy:
// - Customer asked for a dish that doesn't exist on the menu.
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// 5) Centralized error handling middleware (must be last).
app.use(errorHandler);

// Start the server.
app.listen(PORT, () => {
  console.log(`Mini Online Store API listening on port ${PORT}`);
});

module.exports = app;
