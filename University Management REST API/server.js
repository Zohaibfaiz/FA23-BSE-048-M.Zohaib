// =============================================
// server.js - Main Entry Point
// University Management REST API
// =============================================

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const teacherRoutes = require('./teacherRoutes');

const app = express();

// ─────────────────────────────────────────────
// 1. SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// Helmet: Sets secure HTTP headers (XSS protection etc.)
app.use(helmet());

// CORS: Only allow trusted origins
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting: DDoS Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// ─────────────────────────────────────────────
// 2. BODY PARSER
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit body size

// ─────────────────────────────────────────────
// 3. ROUTES
// ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/teachers', teacherRoutes);

// ─────────────────────────────────────────────
// 4. ROOT ENDPOINT
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🎓 University Management API is running!' });
});

// ─────────────────────────────────────────────
// 5. 404 HANDLER
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─────────────────────────────────────────────
// 6. GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ─────────────────────────────────────────────
// 7. START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
