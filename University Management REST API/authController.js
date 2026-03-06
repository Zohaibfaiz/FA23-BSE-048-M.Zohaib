// =============================================
// controllers/authController.js
// Register + Login + JWT Token Generation
// =============================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { users } = require('./dataStore');

const JWT_SECRET  = process.env.JWT_SECRET  || 'university_super_secret_key_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h'; // Token expires in 1 hour

// ─────────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // 2. Check if user already exists
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // 3. Hash password (NEVER store plain text passwords!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student' // Default = student
    };
    users.push(newUser);

    // 5. Respond (don't send password back)
    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 2. Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 4. Generate JWT Token
    // Structure: Header.Payload.Signature
    const token = jwt.sign(
      {
        id:    user.id,
        email: user.email,
        role:  user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // 5. Send token to client
    res.status(200).json({
      message: 'Login successful!',
      token,  // Client stores this and sends it in every request header
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
};

// ─────────────────────────────────────────────
// GET CURRENT USER (Protected Route)
// GET /api/auth/me
// ─────────────────────────────────────────────
const getMe = (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  res.json({
    id:    user.id,
    name:  user.name,
    email: user.email,
    role:  user.role
  });
};

module.exports = { register, login, getMe };
