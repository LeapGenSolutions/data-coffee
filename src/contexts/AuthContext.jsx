import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '../lib/queryClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: authData, isLoading: authLoading, error: authError } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    onError: (error) => {
      console.log('Authentication error:', error.message);
      setIsInitialized(true);
    },
    onSuccess: () => {
      setIsInitialized(true);
    }
  });

  const login = async (credentials) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setLocation('/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      });
      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user: authData?.user,
    isLoading: authLoading,
    isAuthenticated: !!authData?.user,
    isInitialized,
    login,
    logout,
    error: authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 