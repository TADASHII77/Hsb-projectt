import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.js';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentSession = authService.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.signOut();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in function
  const signIn = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.signIn(credentials);
      
      if (result.success) {
        setSession({
          user: result.user,
          token: result.token,
        });
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    authService.signOut();
    setSession(null);
    return { success: true };
  };

  // Get current session
  const getSession = () => {
    return session;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!session;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return session?.user?.role === role;
  };

  // Update user data
  const updateUser = (userData) => {
    if (authService.updateUser(userData)) {
      setSession(prev => ({
        ...prev,
        user: { ...prev.user, ...userData }
      }));
      return true;
    }
    return false;
  };

  // Context value
  const value = {
    session,
    loading,
    signIn,
    signOut,
    getSession,
    isAuthenticated,
    hasRole,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
