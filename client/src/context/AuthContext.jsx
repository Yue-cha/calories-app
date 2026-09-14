import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [computedStats, setComputedStats] = useState(null);
  const [needsWeeklyWeightUpdate, setNeedsWeeklyWeightUpdate] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('calo_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setComputedStats(data.computedStats);
      setNeedsWeeklyWeightUpdate(!!data.needsWeeklyWeightUpdate);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      localStorage.removeItem('calo_token');
      setUser(null);
      setProfile(null);
      setComputedStats(null);
      setNeedsWeeklyWeightUpdate(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('calo_token', data.token);
    setUser(data.user);
    setProfile(data.profile);
    setComputedStats(data.computedStats);
    setNeedsWeeklyWeightUpdate(!!data.needsWeeklyWeightUpdate);
    return data;
  };

  const register = async (registrationData) => {
    const data = await api.register(registrationData);
    localStorage.setItem('calo_token', data.token);
    setUser(data.user);
    setProfile(data.profile);
    setComputedStats(data.computedStats);
    setNeedsWeeklyWeightUpdate(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('calo_token');
    setUser(null);
    setProfile(null);
    setComputedStats(null);
    setNeedsWeeklyWeightUpdate(false);
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.profile);
      setComputedStats(data.computedStats);
      setNeedsWeeklyWeightUpdate(!!data.needsWeeklyWeightUpdate);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const submitWeeklyWeight = async (weight) => {
    const data = await api.updateWeeklyWeight(weight);
    setProfile(data.profile);
    setComputedStats(data.computedStats);
    setNeedsWeeklyWeightUpdate(false);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        computedStats,
        needsWeeklyWeightUpdate,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
        submitWeeklyWeight,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
