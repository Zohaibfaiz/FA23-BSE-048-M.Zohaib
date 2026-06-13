import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { DashboardLayout } from './components/shared/DashboardLayout';
import {
  PATIENT_NAV,
  DOCTOR_NAV,
  ASSISTANT_NAV,
  ADMIN_NAV,
  SUPERADMIN_NAV,
} from './utils/constants';

import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/errors/NotFound';
import { PublicLayout } from './components/public/PublicLayout';
import PublicDoctors from './pages/Public/PublicDoctors';
import PublicDoctorProfile from './pages/Public/PublicDoctorProfile';

import PatientHome from './pages/Patient/PatientHome';
import FindDoctors from './pages/Patient/FindDoctors';
import DoctorProfile from './pages/Patient/DoctorProfile';
import BookAppointment from './pages/Patient/BookAppointment';
import MyAppointments from './pages/Patient/MyAppointments';
import MedicalHistory from './pages/Patient/MedicalHistory';
import Prescriptions from './pages/Patient/Prescriptions';
import PatientProfile from './pages/Patient/PatientProfile';

import DoctorOverview from './pages/Doctor/DoctorOverview';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorPatients from './pages/Doctor/DoctorPatients';
import DoctorPrescriptions from './pages/Doctor/DoctorPrescriptions';
import DoctorClinics from './pages/Doctor/DoctorClinics';
import DoctorSchedule from './pages/Doctor/DoctorSchedule';
import DoctorProfilePage from './pages/Doctor/DoctorProfile';

import PendingPayments from './pages/Assistant/PendingPayments';
import VerifiedPayments from './pages/Assistant/VerifiedPayments';
import AppointmentQueue from './pages/Assistant/AppointmentQueue';

import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageDoctors from './pages/Admin/ManageDoctors';
import ManagePatients from './pages/Admin/ManagePatients';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';

import SystemConfig from './pages/SuperAdmin/SystemConfig';
import AuditLogs from './pages/SuperAdmin/AuditLogs';
import AdminManagement from './pages/SuperAdmin/AdminManagement';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'linear-gradient(135deg, #1a322c, #122420)',
                color: '#f5f0e6',
                border: '1px solid rgba(201, 169, 98, 0.35)',
                borderRadius: '2px 14px 2px 14px',
                fontFamily: 'Outfit, sans-serif',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<PublicLayout />}>
              <Route path="/doctors" element={<PublicDoctors />} />
              <Route path="/doctors/:id" element={<PublicDoctorProfile />} />
            </Route>

            <Route
              path="/patient"
              element={
                <ProtectedRoute roles={['patient']}>
                  <DashboardLayout navItems={PATIENT_NAV} role="patient" />
                </ProtectedRoute>
              }
            >
              <Route index element={<PatientHome />} />
              <Route path="doctors" element={<FindDoctors />} />
              <Route path="doctors/:id" element={<DoctorProfile />} />
              <Route path="book/:doctorId" element={<BookAppointment />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="history" element={<MedicalHistory />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            <Route
              path="/doctor"
              element={
                <ProtectedRoute roles={['doctor']}>
                  <DashboardLayout navItems={DOCTOR_NAV} role="doctor" />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorOverview />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="clinics" element={<DoctorClinics />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="profile" element={<DoctorProfilePage />} />
            </Route>

            <Route
              path="/assistant"
              element={
                <ProtectedRoute roles={['assistant']}>
                  <DashboardLayout navItems={ASSISTANT_NAV} role="assistant" />
                </ProtectedRoute>
              }
            >
              <Route index element={<PendingPayments />} />
              <Route path="verified" element={<VerifiedPayments />} />
              <Route path="queue" element={<AppointmentQueue />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin', 'superadmin']}>
                  <DashboardLayout navItems={ADMIN_NAV} role="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route
              path="/superadmin"
              element={
                <ProtectedRoute roles={['superadmin']}>
                  <DashboardLayout navItems={SUPERADMIN_NAV} role="superadmin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin" replace />} />
              <Route path="config" element={<SystemConfig />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="admins" element={<AdminManagement />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
