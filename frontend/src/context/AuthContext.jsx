import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Token verification failed:", err);
          api.setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    api.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const switchDemoRole = async (role) => {
    const data = await api.demoLogin(role);
    api.setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    register,
    switchDemoRole,
    logout,
    // Role helpers
    isCitizen: user?.role === 'CITIZEN',
    isOfficer: user?.role === 'AUTHORITY_OFFICER',
    isAdmin: user?.role === 'SYSTEM_ADMIN',
    isOfficial: user?.role === 'GOVERNMENT_OFFICIAL',
    isUniversity: user?.role === 'UNIVERSITY_TEAM',
    isFaculty: user?.role === 'FACULTY_MENTOR',
    isStudent: user?.role === 'STUDENT_TEAM',
    isIndustry: user?.role === 'INDUSTRY_PARTNER',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

