import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Shared Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Voter Pages
import VoterDashboard from './pages/voter/VoterDashboard';

// Creator Pages
import CreatorDashboard from './pages/creator/CreatorDashboard';
import NewElection from './pages/creator/NewElection';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';

// Common Election Pages
import ElectionDetail from './pages/elections/ElectionDetail';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-primaryBg">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primaryGold/20 border-t-primaryGold rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-heading font-bold text-[10px] text-primaryGold">SV</div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#151515',
              color: '#F5F0E8',
              border: '1px solid #1F1F1F',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#151515' } },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/elections/:id" element={<ElectionDetail />} />

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {/* Voter Routes */}
            <Route path="/voter/dashboard" element={
              <ProtectedRoute allowedRoles={['voter', 'election_creator', 'super_admin']}>
                <VoterDashboard />
              </ProtectedRoute>
            } />

            {/* Creator Routes */}
            <Route path="/creator/dashboard" element={
              <ProtectedRoute allowedRoles={['election_creator', 'super_admin']}>
                <CreatorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/creator/elections/new" element={
              <ProtectedRoute allowedRoles={['election_creator', 'super_admin']}>
                <NewElection />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminRequests />
              </ProtectedRoute>
            } />
          </Route>

          {/* System Routes */}
          <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center bg-primaryBg text-dangerRed">Unauthorized Access</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
