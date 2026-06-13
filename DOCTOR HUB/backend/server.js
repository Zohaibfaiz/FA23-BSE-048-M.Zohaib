import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { checkMaintenance } from './middleware/maintenance.js';
import { ensureDemoData } from './seed.js';

import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import clinicRoutes from './routes/clinicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(apiLimiter);
app.use(checkMaintenance);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Doctor Hub API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const { seeded } = await ensureDemoData();
    if (seeded) {
      console.log('Development demo data seeded');
    }
  }

  app.listen(PORT, () => {
    console.log(`Doctor Hub API running on port ${PORT}`);
  });
};

// For Vercel serverless deployment
if (process.env.VERCEL) {
  connectDB().catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
} else {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
