// =============================================
// middleware/authMiddleware.js
// JWT Authentication + Role-Based Authorization
// =============================================

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'university_super_secret_key_2024';

// ─────────────────────────────────────────────
// AUTHENTICATION MIDDLEWARE
// Verifies the JWT token in the request header
// ─────────────────────────────────────────────
const authenticate = (req, res, next) => {
  // Step 1: Get token from header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      hint: 'Send token as: Authorization: Bearer <token>'
    });
  }

  // Step 2: Extract token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  // Step 3: Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ─────────────────────────────────────────────
// AUTHORIZATION MIDDLEWARE
// Restricts access based on user role
// ─────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// ─────────────────────────────────────────────
// INPUT SANITIZER (XSS Prevention)
// Strips dangerous characters from inputs
// ─────────────────────────────────────────────
const sanitizeInput = (req, res, next) => {
  const sanitize = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    return value;
  };

  // Sanitize all body fields
  if (req.body) {
    for (let key in req.body) {
      req.body[key] = sanitize(req.body[key]);
    }
  }
  next();
};

module.exports = { authenticate, authorize, sanitizeInput };
