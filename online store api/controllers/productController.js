'use strict';

// controllers/productController.js
// Controllers contain request handling + business logic.
// They should be thin and focused: parse input, call services/DB (omitted here), return a response.
// Restaurant Analogy:
// - Controller = Chef (prepares the requested dish)

function getProducts(req, res, next) {
  try {
    // Dummy product list.
    const products = [
      { id: 1, name: 'Wireless Mouse', price: 19.99, currency: 'USD' },
      { id: 2, name: 'Mechanical Keyboard', price: 89.99, currency: 'USD' },
      { id: 3, name: 'USB-C Cable', price: 9.99, currency: 'USD' },
    ];

    // Response = Food delivered to the customer.
    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
};
