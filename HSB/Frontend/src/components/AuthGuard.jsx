import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

// Beautiful Alert Component
const Alert = ({ type, title, message, onClose, isVisible }) => {
  if (!isVisible) return null;
  
  const alertStyles = {
    error: {
      container: 'bg-red-50 border-l-4 border-red-400',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700',
      iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    success: {
      container: 'bg-green-50 border-l-4 border-green-400',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  };

  const style = alertStyles[type] || alertStyles.error;

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 rounded-md shadow-lg ${style.container} transform transition-all duration-300 ease-in-out`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${style.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={style.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${style.title}`}>
            {title}
          </h3>
          <div className={`mt-2 text-sm ${style.message}`}>
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors ${style.icon}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthGuard = ({ children, requiredUserType, dashboardType }) => {
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Alert state
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'error',
    title: '',
    message: ''
  });

  // Check authentication
  const userType = localStorage.getItem('userType');
  const isAuthenticated = userType === requiredUserType;

  // Alert helper functions
  const showAlert = (type, title, message) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message
    });
    
    // Auto-hide success alerts
    if (type === 'success') {
      setTimeout(() => {
        setAlert(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  // If authenticated, render the protected component
  if (isAuthenticated) {
    return children;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hide alert when user starts typing
    if (alert.isVisible) {
      hideAlert();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock login logic - in real app this would be an API call
      if (formData.email && formData.password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        if (requiredUserType === 'business') {
          localStorage.setItem('userType', 'business');
          localStorage.setItem('businessId', 'business_' + Date.now());
          localStorage.setItem('businessName', 'Demo Business');
          localStorage.setItem('businessEmail', formData.email);
        } else {
          localStorage.setItem('userType', 'customer');
          localStorage.setItem('userId', 'user_' + Date.now());
          localStorage.setItem('userName', 'Demo User');
          localStorage.setItem('userEmail', formData.email);
        }
        
        showAlert('success', 'Login Successful!', 'Welcome back! Redirecting to your dashboard...');
        
        // Redirect after success
        setTimeout(() => {
          window.location.reload(); // Force page reload to update auth state
        }, 1500);
      } else {
        showAlert('error', 'Login Failed', 'Please enter both email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('error', 'Login Error', 'An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterRedirect = () => {
    if (requiredUserType === 'business') {
      navigate('/business');
    } else {
      navigate('/job');
    }
  };

  // Show login prompt if not authenticated
  if (!showLoginForm) {
    return (
      <>
        {/* Alert Component */}
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={hideAlert}
          isVisible={alert.isVisible}
        />
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="mb-6">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {dashboardType} Access Required
              </h2>
              
              <p className="text-gray-600 mb-6">
                You need to be logged in as a {requiredUserType === 'business' ? 'business owner' : 'customer'} to access this dashboard.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="w-full bg-[#AF2638] hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Login to {dashboardType}
                </button>
                
                <div className="text-center">
                  <span className="text-gray-500 text-sm">Don't have an account? </span>
                  <button
                    onClick={handleRegisterRedirect}
                    className="text-[#AF2638] hover:text-red-700 text-sm font-medium"
                  >
                    {requiredUserType === 'business' ? 'Register Your Business' : 'Post a Job to Sign Up'}
                  </button>
                </div>
                
                <div className="pt-4 border-t">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show login form
  return (
    <>
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
        isVisible={alert.isVisible}
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login to {dashboardType}
            </h2>
            <p className="text-gray-600">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-[#AF2638] hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">Don't have an account? </span>
                <button
                  type="button"
                  onClick={handleRegisterRedirect}
                  className="text-[#AF2638] hover:text-red-700 text-sm font-medium"
                >
                  {requiredUserType === 'business' ? 'Register Your Business' : 'Post a Job to Sign Up'}
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Home
                </button>
              </div>
            </div>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Login</h4>
            <p className="text-xs text-blue-600">
              For demo purposes, enter any email and password to login. 
              In production, this would validate against real user credentials.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthGuard; 