import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'doctorhub_access_token';
const REFRESH_KEY = 'doctorhub_refresh_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setStoredTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearStoredTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    // Must not set Content-Type — browser adds multipart boundary
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  } else if (!config.headers['Content-Type'] && !config.headers['content-type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // FormData cannot be replayed after a failed request — don't retry uploads
    if (original?.data instanceof FormData) {
      if (error.response?.status === 401) {
        clearStoredTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = getStoredRefreshToken();
        const { data } = await axios.post(
          `${API_URL}/auth/refresh-token`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );
        if (data.accessToken) {
          setStoredTokens(data.accessToken, data.refreshToken);
        }
        return api(original);
      } catch {
        clearStoredTokens();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
