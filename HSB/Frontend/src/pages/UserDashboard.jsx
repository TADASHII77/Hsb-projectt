import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import AuthGuard from '../components/AuthGuard';

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
    },
    warning: {
      container: 'bg-yellow-50 border-l-4 border-yellow-400',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
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

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [userJobs, setUserJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'error',
    title: '',
    message: ''
  });

  // Mock user ID - in real app this would come from authentication
  const userId = localStorage.getItem('userId') || 'user123';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  useEffect(() => {
    fetchUserData();
    fetchUserJobs();
  }, []);

  // Alert helper functions
  const showAlert = (type, title, message) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message
    });
    
    // Auto-hide alert after 5 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        setAlert(prev => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      // Mock user data - in real app this would be an API call
      const mockUserData = {
        id: userId,
        name: localStorage.getItem('userName') || 'John Doe',
        email: userEmail,
        phone: localStorage.getItem('userPhone') || '+1-234-567-8900',
        address: {
          street: '123 Main Street',
          city: 'Delhi',
          province: 'Delhi',
          postalCode: '110001',
          country: 'India'
        },
        joinDate: '2024-01-15',
        preferences: {
          notifications: {
            email: true,
            sms: false
          },
          serviceCategories: ['HVAC', 'Plumbing', 'Electrical']
        }
      };
      setUserData(mockUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showAlert('error', 'Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserJobs = async () => {
    try {
      // Mock job data - in real app this would be an API call
      const mockJobs = [
        {
          id: 1,
          service: 'HVAC Repair',
          description: 'Air conditioning not working properly',
          city: 'Delhi',
          postalCode: '110001',
          budget: '₹5000-₹8000',
          status: 'open',
          datePosted: '2024-01-20',
          responses: 3
        },
        {
          id: 2,
          service: 'Plumbing',
          description: 'Kitchen sink leaking',
          city: 'Mumbai',
          postalCode: '400001',
          budget: '₹2000-₹3000',
          status: 'in_progress',
          datePosted: '2024-01-18',
          responses: 5,
          assignedTechnician: 'Mumbai Plumbing Experts'
        },
        {
          id: 3,
          service: 'Electrical',
          description: 'Install ceiling fan in bedroom',
          city: 'Delhi',
          postalCode: '110002',
          budget: '₹1500-₹2500',
          status: 'completed',
          datePosted: '2024-01-15',
          responses: 7,
          assignedTechnician: 'Delhi Electrical Services',
          completedDate: '2024-01-17'
        }
      ];
      setUserJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching user jobs:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Mock save - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update localStorage
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userPhone', userData.phone);
      
      setEditMode(false);
      showAlert('success', 'Profile Updated', 'Your profile has been updated successfully!');
    } catch (error) {
      console.error('Error saving user data:', error);
      showAlert('error', 'Save Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userType');
    
    showAlert('success', 'Logged Out', 'You have been successfully logged out.');
    
    // Navigate to home after 2 seconds
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF2638] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requiredUserType="customer" dashboardType="User Dashboard">
      {/* Alert Component */}
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={hideAlert}
        isVisible={alert.isVisible}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">User Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {userData?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-[#AF2638] text-[#AF2638]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-[#AF2638] text-[#AF2638]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-[#AF2638] text-[#AF2638]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-md">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Jobs Posted</p>
                        <p className="text-2xl font-semibold text-blue-900">{userJobs.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-md">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Active Jobs</p>
                        <p className="text-2xl font-semibold text-yellow-900">
                          {userJobs.filter(job => job.status === 'open' || job.status === 'in_progress').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-md">
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Completed Jobs</p>
                        <p className="text-2xl font-semibold text-green-900">
                          {userJobs.filter(job => job.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Jobs */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Recent Jobs</h3>
                  <div className="space-y-4">
                    {userJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{job.service}</h4>
                            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {job.city} • {job.budget} • Posted {job.datePosted}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {formatStatus(job.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/job')}
                      className="bg-[#AF2638] hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Post New Job
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Job Posts</h2>
                  <button
                    onClick={() => navigate('/job')}
                    className="bg-[#AF2638] hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Post New Job
                  </button>
                </div>
                
                <div className="space-y-6">
                  {userJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{job.service}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)} mt-2`}>
                            {formatStatus(job.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Posted {job.datePosted}</p>
                          <p className="text-sm font-medium text-gray-900">{job.budget}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{job.city}, {job.postalCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Responses</p>
                          <p className="font-medium">{job.responses} technicians interested</p>
                        </div>
                      </div>
                      
                      {job.assignedTechnician && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Assigned Technician</p>
                          <p className="font-medium text-[#AF2638]">{job.assignedTechnician}</p>
                        </div>
                      )}
                      
                      {job.completedDate && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Completed Date</p>
                          <p className="font-medium">{job.completedDate}</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <button className="text-[#AF2638] hover:text-red-700 text-sm font-medium">
                          View Details
                        </button>
                        {job.status === 'open' && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Edit Job
                          </button>
                        )}
                        {job.status === 'completed' && (
                          <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-[#AF2638] hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={userData?.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={userData?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={userData?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <input
                        type="text"
                        value={userData?.joinDate || ''}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={userData?.address?.street || ''}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={userData?.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        value={userData?.address?.province || ''}
                        onChange={(e) => handleInputChange('address.province', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={userData?.address?.postalCode || ''}
                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={userData?.address?.country || ''}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Notification Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={userData?.preferences?.notifications?.email || false}
                        onChange={(e) => handleInputChange('preferences.notifications.email', e.target.checked)}
                        disabled={!editMode}
                        className="h-4 w-4 text-[#AF2638] focus:ring-[#AF2638] border-gray-300 rounded disabled:opacity-50"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                        Email notifications for job updates
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={userData?.preferences?.notifications?.sms || false}
                        onChange={(e) => handleInputChange('preferences.notifications.sms', e.target.checked)}
                        disabled={!editMode}
                        className="h-4 w-4 text-[#AF2638] focus:ring-[#AF2638] border-gray-300 rounded disabled:opacity-50"
                      />
                      <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                        SMS notifications for urgent updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default UserDashboard; 