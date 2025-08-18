import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { signInSchema } from '../services/auth.js';

// Alert Component (reused from AuthGuard)
const Alert = ({ type, title, message, onClose, isVisible }) => {
  if (!isVisible) return null;

  const alertStyles = {
    error: {
      container: "bg-red-50 border-l-4 border-red-400",
      icon: "text-red-400",
      title: "text-red-800",
      message: "text-red-700",
      iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    success: {
      container: "bg-green-50 border-l-4 border-green-400",
      icon: "text-green-400",
      title: "text-green-800",
      message: "text-green-700",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
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
          <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
          <div className={`mt-2 text-sm ${style.message}`}>
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-gray-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent transition-colors ${style.icon}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Alert state
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'error',
    title: '',
    message: '',
  });

  // Get return URL from location state
  const from = location.state?.from?.pathname || '/';

  // Alert helper functions
  const showAlert = (type, title, message) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message,
    });

    // Auto-hide alert after 8 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, isVisible: false }));
      }, 8000);
    }
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      // Validate credentials using Zod schema
      const validatedCredentials = await signInSchema.parseAsync(formData);
      
      // Attempt to sign in
      const result = await signIn(validatedCredentials);
      
      if (result.success) {
        showAlert(
          'success',
          'Login Successful!',
          'Welcome back! Redirecting...'
        );
        
        // Redirect to the page they were trying to access or dashboard
        setTimeout(() => {
          // Use the return URL if available, otherwise go to appropriate dashboard
          const returnUrl = location.state?.from?.pathname;
          if (returnUrl && returnUrl !== '/login') {
            navigate(returnUrl);
          } else {
            if (result.user.role === 'Business') {
              navigate('/business-dashboard');
            } else {
              navigate('/user-dashboard');
            }
          }
        }, 1000);
      } else {
        showAlert(
          'error',
          'Login Failed',
          result.error || 'Invalid credentials'
        );
      }
    } catch (error) {
      if (error.name === 'ZodError') {
        // Handle validation errors
        const errors = {};
        error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setFieldErrors(errors);
        
        showAlert(
          'error',
          'Validation Error',
          'Please correct the errors in the form.'
        );
      } else {
        showAlert(
          'error',
          'Login Error',
          'An error occurred during login. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration redirect
  const handleRegisterRedirect = (userType) => {
    if (userType === 'business') {
      navigate('/business-registration');
    } else {
      navigate('/job-posting');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <>
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
        isVisible={alert.isVisible}
      />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Registration Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <span className="text-gray-500 text-sm">
                Don't have an account?{' '}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRegisterRedirect('customer')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
              >
                Register as Customer
              </button>
              <button
                onClick={() => handleRegisterRedirect('business')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm"
              >
                Register Business
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
