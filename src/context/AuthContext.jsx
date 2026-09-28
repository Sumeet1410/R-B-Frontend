import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, setUserData, getUserData, getAuthToken } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await apiRequest('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            setToken(storedToken);
            setUserData(res.user);
          } else {
            setAuthToken(null);
            setUserData(null);
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('Session expired or backend offline:', err.message);
          setAuthToken(null);
          setUserData(null);
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        setAuthToken(res.token);
        setUserData(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const registerCitizen = async (formData) => {
    try {
      const res = await apiRequest('/auth/register/citizen', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        setAuthToken(res.token);
        setUserData(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Quick switch for demo and test evaluation - fetches real JWT from backend
  const setDemoUser = async (demoUser) => {
    try {
      const res = await apiRequest('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role: demoUser?.role, email: demoUser?.email })
      });

      if (res.success && res.token) {
        setUser(res.user);
        setToken(res.token);
        setAuthToken(res.token);
        setUserData(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('Backend demo-login failed, falling back:', err.message);
      const dummyToken = 'demo-jwt-token-rnb-gujarat';
      setUser(demoUser);
      setToken(dummyToken);
      setAuthToken(dummyToken);
      setUserData(demoUser);
      return { success: true, user: demoUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerCitizen,
        setDemoUser,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
