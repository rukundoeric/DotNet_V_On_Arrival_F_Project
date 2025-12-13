import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/Auth/login`, {
        email,
        password
      });

      const { token, userId, email: userEmail, firstName, lastName, role, permissions } = response.data;

      const userData = {
        userId,
        email: userEmail,
        firstName,
        lastName,
        role,
        permissions
      };

      // Save to state
      setUser(userData);
      setToken(token);

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await axios.post(`${API_URL}/Auth/signup`, signupData);

      const { token, userId, email: userEmail, firstName, lastName, role, permissions } = response.data;

      const userData = {
        userId,
        email: userEmail,
        firstName,
        lastName,
        role,
        permissions
      };

      // Save to state
      setUser(userData);
      setToken(token);

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const isAdmin = () => user?.role === 'Admin';
  const isOfficer = () => user?.role === 'Officer';
  const isUser = () => user?.role === 'User';

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    hasPermission,
    isAdmin,
    isOfficer,
    isUser,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
