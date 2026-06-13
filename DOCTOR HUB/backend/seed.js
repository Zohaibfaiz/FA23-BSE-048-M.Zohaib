import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Clinic from './models/Clinic.js';
import Assistant from './models/Assistant.js';
import Appointment from './models/Appointment.js';
import Payment from './models/Payment.js';
import MedicalHistory from './models/MedicalHistory.js';
import Prescription from './models/Prescription.js';
import SystemConfig from './models/SystemConfig.js';
import connectDB from './config/db.js';

dotenv.config();

const seedFilePath = fileURLToPath(import.meta.url);

const connectIfNeeded = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await connectDB();
};

const clearCollections = async () => {
  console.log('Clearing database...');
  await Promise.all([
    User.deleteMany(),
    Doctor.deleteMany(),
    Clinic.deleteMany(),
    Assistant.deleteMany(),
    Appointment.deleteMany(),
    Payment.deleteMany(),
    MedicalHistory.deleteMany(),
    Prescription.deleteMany(),
    SystemConfig.deleteMany(),
  ]);
};

const createDemoData = async () => {
  const password = 'Password@123';

  await User.create({
    name: 'Super Admin',
    email: 'superadmin@doctorhub.com',
    password,
    role: 'superadmin',
    isVerified: true,
  });

  await User.create({
    name: 'Platform Admin',
    email: 'admin@doctorhub.com',
    password,
    role: 'admin',
    isVerified: true,
  });

  const patient = await User.create({
    name: 'Ali Patient',
    email: 'patient@doctorhub.com',
    password,
    role: 'patient',
    phone: '+923001234567',
    isVerified: true,
  });

  const doctorUser = await User.create({
    name: 'Dr. Sarah Khan',
    email: 'doctor@doctorhub.com',
    password,
    role: 'doctor',
    phone: '+923009876543',
    isVerified: true,
    profileImage: '',
  });

  const doctor = await Doctor.create({
    userId: doctorUser._id,
    specialization: 'Cardiologist',
    treatmentType: 'allopathic',
    diseases: ['Heart Disease', 'Hypertension', 'Arrhythmia'],
    bio: 'Board-certified cardiologist with 12 years of experience.',
    experience: 12,
    qualification: 'MBBS, FCPS (Cardiology)',
    rating: 4.8,
    reviewCount: 124,
    isApproved: true,
  });

  const clinic = await Clinic.create({
    doctorId: doctor._id,
    name: 'Heart Care Clinic',
    address: '123 Medical Avenue, Block 5',
    city: 'Karachi',
    phone: '+922112345678',
    mapLink: 'https://maps.google.com',
    schedule: [
      { day: 'mon', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'tue', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'wed', startTime: '09:00', endTime: '13:00', isActive: true },
      { day: 'thu', startTime: '09:00', endTime: '17:00', isActive: true },
      { day: 'fri', startTime: '09:00', endTime: '17:00', isActive: true },
    ],
  });

  const assistantUser = await User.create({
    name: 'Fatima Assistant',
    email: 'assistant@doctorhub.com',
    password,
    role: 'assistant',
    isVerified: true,
  });

  await Assistant.create({
    userId: assistantUser._id,
    clinicId: clinic._id,
    doctorId: doctor._id,
  });

  const appointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    clinicId: clinic._id,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    timeSlot: '10:00',
    status: 'pending',
    timeline: [{ step: 'booked', timestamp: new Date() }],
  });

  await MedicalHistory.create({
    patientId: patient._id,
    records: [
      {
        date: new Date('2024-06-15'),
        doctorId: doctor._id,
        diagnosis: 'Mild hypertension',
        notes: 'Prescribed lifestyle changes and monitoring.',
        createdAt: new Date('2024-06-15'),
      },
    ],
  });

  await SystemConfig.create({ maintenanceMode: false });

  console.log('\n✅ Seed completed!\n');
  console.log('Demo accounts (password: Password@123):');
  console.log('  Super Admin: superadmin@doctorhub.com');
  console.log('  Admin:       admin@doctorhub.com');
  console.log('  Patient:     patient@doctorhub.com');
  console.log('  Doctor:      doctor@doctorhub.com');
  console.log('  Assistant:   assistant@doctorhub.com');
  console.log(`\n  Sample appointment ID: ${appointment._id}`);

};

export const seedDemoData = async ({ reset = true } = {}) => {
  await connectIfNeeded();
  if (reset) {
    await clearCollections();
  }
  await createDemoData();
};

export const ensureDemoData = async () => {
  await connectIfNeeded();
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return { seeded: false };
  }

  await createDemoData();
  return { seeded: true };
};

if (process.argv[1] && path.resolve(process.argv[1]) === seedFilePath) {
  seedDemoData()
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      mongoose.disconnect().finally(() => process.exit(1));
    });
}
