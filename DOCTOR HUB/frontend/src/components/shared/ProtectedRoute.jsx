import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD } from '../../utils/constants';

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const warned = useRef(false);

  const wrongRole = Boolean(roles && user && !roles.includes(user.role));

  useEffect(() => {
    if (wrongRole && !warned.current) {
      warned.current = true;
      toast.error(`This page is for ${roles.join('/')} only. You are logged in as ${user.role}.`);
    }
  }, [wrongRole, roles, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (wrongRole) {
    return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  }

  return children;
};
