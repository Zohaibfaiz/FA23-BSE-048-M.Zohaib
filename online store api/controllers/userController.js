'use strict';

// controllers/userController.js
// Restaurant Analogy:
// - Controller = Chef preparing user-related dishes (get user, create user)

function getUserById(req, res, next) {
  try {
    // Demonstrates route parameters: /users/:id -> req.params
    const { id } = req.params;

    // Basic validation example.
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User id must be a positive integer',
      });
    }

    // Dummy user record.
    const user = {
      id: numericId,
      name: 'Demo User',
      email: 'demo.user@example.com',
      // show that auth middleware ran (req.user attached)
      requestedBy: req.user,
    };

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}

function createUser(req, res, next) {
  try {
    // Demonstrates JSON body parsing: express.json() populates req.body
    const { name, email } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'name and email are required',
      });
    }

    // Dummy "created" user.
    const createdUser = {
      id: Date.now(),
      name,
      email,
    };

    res.status(201).json({
      message: 'User created',
      data: createdUser,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserById,
  createUser,
};
