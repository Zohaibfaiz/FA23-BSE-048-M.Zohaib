import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setStoredTokens, clearStoredTokens } from '../utils/api';
import { ROLE_DASHBOARD } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchUser);
    const onLogout = () => {
      setUser(null);
      clearStoredTokens();
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setStoredTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setStoredTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  };

  const dashboardPath = user ? ROLE_DASHBOARD[user.role] : '/login';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, fetchUser, dashboardPath, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
