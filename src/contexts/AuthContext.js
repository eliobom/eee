import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../apiClient';

const STORAGE_KEYS = {
  token: 'twm_token',
  user: 'twm_user',
};

// Storage adapter for web
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateSession = async () => {
    try {
      // First, hydrate apiClient to ensure both systems are in sync
      await apiClient.hydrateSession();

      const [storedToken, storedUser] = await Promise.all([
        storage.getItem(STORAGE_KEYS.token),
        storage.getItem(STORAGE_KEYS.user),
      ]);

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
          // Sync with apiClient
          apiClient.setCurrentUser(parsed);
          apiClient.setToken(storedToken);
        }
      }
    } catch (error) {
      console.error('Error hydrating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSession = async (newToken, newUser) => {
    try {
      await Promise.all([
        storage.setItem(STORAGE_KEYS.token, String(newToken || '')),
        storage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(newUser || null)
        ),
      ]);
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  };

  const clearSession = async () => {
    setUser(null);
    setToken(null);
    // Clear apiClient session
    apiClient.clearSession();
    try {
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.token),
        storage.removeItem(STORAGE_KEYS.user),
      ]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    // Sync with apiClient
    apiClient.setCurrentUser(userData);
    apiClient.setToken(userToken);
    persistSession(userToken, userData);
  };

  const logout = async () => {
    await clearSession();
  };

  useEffect(() => {
    hydrateSession();
  }, []);

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
