import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';

const AdminAuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin-auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.isAdmin) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, clear storage and require login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setAdminUser(userData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#213A59] to-[#AF2638] rounded-full mb-4">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Access</h2>
          <p className="text-gray-600">Please wait while we authenticate your session...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Render protected content with admin context
  return (
    <AdminContext.Provider value={{ adminUser, handleLogout, isAuthenticated }}>
      {children}
    </AdminContext.Provider>
  );
};

// Create admin context for child components
const AdminContext = React.createContext({
  adminUser: null,
  handleLogout: () => {},
  isAuthenticated: false
});

// Custom hook to use admin context
export const useAdminAuth = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthGuard');
  }
  return context;
};

export default AdminAuthGuard;
