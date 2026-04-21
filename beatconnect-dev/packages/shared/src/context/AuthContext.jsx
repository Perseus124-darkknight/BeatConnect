import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep internal sync if needed, but primary hydration is now synchronous
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiLogin(username, password);
      if (data.token) {
        setToken(data.token);
        const userData = { 
          username: data.username || username,
          role: data.role || 'user'
        };
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      console.error('[AUTH CONTEXT] Login error:', err);
      return { success: false, error: 'Connection error' };
    }
  };

  const register = async (username, password) => {
    try {
      const data = await apiRegister(username, password);
      if (data.message && !data.error) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err) {
      console.error('[AUTH CONTEXT] Registration error:', err);
      return { success: false, error: 'Connection error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
