import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('foodbridge_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (isMounted) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        localStorage.removeItem('foodbridge_token');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token: authToken, user: loggedInUser } = response.data.data;
    localStorage.setItem('foodbridge_token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const sendOtp = async (payload) => {
    const response = await api.post('/auth/send-otp', payload);
    return response.data.data;
  };

  const verifyOtp = async (payload) => {
    const response = await api.post('/auth/verify-otp', payload);
    return response.data.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { token: authToken, user: registeredUser } = response.data.data;
    localStorage.setItem('foodbridge_token', authToken);
    setToken(authToken);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('foodbridge_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const response = await api.get('/auth/me');
    setUser(response.data.data.user);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, sendOtp, verifyOtp, register, logout, refreshUser, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
