'use strict';

// middleware/auth.js
// Router-level auth middleware (applied only to /users routes).
// Restaurant Analogy:
// - Middleware = Security Guard at a VIP area (users routes)
//   The guard checks your "token" (header) before letting you proceed.
// - If the token is valid, you can reach the Controller (Chef).

function auth(req, res, next) {
  // Simulated token validation using headers.
  // Accept either:
  // - Authorization: Bearer demo-token
  // - x-auth-token: demo-token
  const authHeader = req.headers.authorization;
  const xToken = req.headers['x-auth-token'];

  let token = null;

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice('Bearer '.length).trim();
  } else if (typeof xToken === 'string') {
    token = xToken.trim();
  }

  // In a real app, you'd verify JWT signatures, expiration, audience, etc.
  // Here we simulate a single known-good token.
  if (token !== 'demo-token') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid token. Provide Authorization: Bearer demo-token',
    });
  }

  // Optionally attach auth context (useful in controllers)
  req.user = { id: 'demo-user', role: 'customer' };

  next();
}

module.exports = auth;
