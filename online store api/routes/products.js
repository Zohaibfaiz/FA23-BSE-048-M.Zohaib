'use strict';

// routes/products.js
// Why express.Router() instead of putting all routes in app.js?
// - Keeps app.js small and focused on wiring/middleware
// - Lets each feature own its routes (scales as the project grows)
// - Enables feature-level middleware and cleaner separation (MVC)
// Restaurant Analogy:
// - Router = Host/Seating plan that directs the customer to the right chef/controller

const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// GET /products -> Return dummy product list.
router.get('/', productController.getProducts);

module.exports = router;
