import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import BusinessHoursEditor from '../components/BusinessHoursEditor';
import { useAuth } from '../contexts/AuthContext';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Resolve current business identity from session
  const userEmail = session?.user?.email;
  const storedBusinessId = session?.user?.businessId;

  useEffect(() => {
    fetchBusinessData();
    fetchQuoteRequests();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setIsLoading(true);
      let res = null;
      if (storedBusinessId) {
        res = await apiService.getBusinessById(storedBusinessId);
      } else if (userEmail) {
        res = await apiService.getBusinessByOwnerEmail(userEmail);
      } else if (storedBusinessEmail) {
        res = await apiService.getBusinessByBusinessEmail(storedBusinessEmail);
      }

      if (res?.success) {
        setBusinessData(res.data);
      } else {
        console.warn('No business found for current session.');
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuoteRequests = async () => {
    try {
      // TODO: Implement real API call for quote requests
      setQuoteRequests([]);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      if (!businessData?._id) {
        throw new Error('Missing business _id for update');
      }

      const updatePayload = {
        name: businessData.name,
        businessEmail: businessData.businessEmail,
        phone: businessData.phone, // Owner phone
        businessPhone: businessData.businessPhone, // Business phone
        businessWebsite: businessData.businessWebsite,
        businessDescription: businessData.businessDescription,
        addressDetails: businessData.addressDetails,
        businessHours: businessData.businessHours,
        acceptedPayments: businessData.acceptedPayments,
        providesInsurance: businessData.providesInsurance,
        insuranceNumber: businessData.insuranceNumber,
      };

      const response = await apiService.put(`/businesses/${businessData._id}`, updatePayload);
      if (response.success) {
        setEditMode(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleLogout = () => {
    // Clear business data from localStorage
    localStorage.removeItem('businessId');
    localStorage.removeItem('businessName');
    localStorage.removeItem('businessEmail');
    localStorage.removeItem('userType');
    
    alert('Logged out successfully!');
    
    // Navigate to home
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF2638] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quote Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{quoteRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-semibold text-gray-900">{businessData?.rating || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-2xl font-semibold text-gray-900">
                {businessData?.verified ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quote Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Quote Requests</h3>
        </div>
        <div className="p-6">
          {quoteRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quote requests yet</p>
          ) : (
            <div className="space-y-4">
              {quoteRequests.slice(0, 3).map(quote => (
                <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{quote.customerName}</p>
                    <p className="text-sm text-gray-600">{quote.customerEmail}</p>
                    <p className="text-sm text-gray-500">{quote.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{quote.requestDate}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      quote.status === 'responded' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Business Profile</h3>
        <button
          onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            editMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-[#AF2638] hover:bg-red-700 text-white'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSaving ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessData?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
              <input
                type="email"
                value={businessData?.businessEmail || ''}
                onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone</label>
              <input
                type="tel"
                value={businessData?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
              <input
                type="tel"
                value={businessData?.businessPhone || ''}
                onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={businessData?.businessWebsite || ''}
                onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={businessData?.addressDetails?.streetAddress || ''}
                onChange={(e) => handleNestedInputChange('addressDetails', 'streetAddress', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={businessData?.addressDetails?.city || ''}
                onChange={(e) => handleNestedInputChange('addressDetails', 'city', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <input
                type="text"
                value={businessData?.addressDetails?.province || ''}
                onChange={(e) => handleNestedInputChange('addressDetails', 'province', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={businessData?.addressDetails?.postalCode || ''}
                onChange={(e) => handleNestedInputChange('addressDetails', 'postalCode', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={businessData?.addressDetails?.country || ''}
                onChange={(e) => handleNestedInputChange('addressDetails', 'country', e.target.value)}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Services Offered</h4>
          <div className="flex flex-wrap gap-2">
            {businessData?.services?.map((service, index) => (
              <span key={index} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {service}
              </span>
            )) || <p className="text-gray-500">No services listed</p>}
          </div>
        </div>

        {/* Business Description */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Business Description</h4>
          <textarea
            value={businessData?.businessDescription || ''}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            disabled={!editMode}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
            placeholder="Describe your business and services..."
          />
        </div>

        {/* Business Hours */}
        <div>
          <BusinessHoursEditor
            businessHours={businessData?.businessHours || {}}
            onChange={(hours) => handleInputChange('businessHours', hours)}
            disabled={!editMode}
          />
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Payment Methods</h4>
          <div className="grid grid-cols-2 gap-3">
            {['Cash', 'Debit Card', 'Credit Card', 'Financing'].map(method => (
              <label key={method} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessData?.acceptedPayments?.includes(method) || false}
                  onChange={(e) => {
                    const currentPayments = businessData?.acceptedPayments || [];
                    const newPayments = e.target.checked
                      ? [...currentPayments, method]
                      : currentPayments.filter(p => p !== method);
                    handleInputChange('acceptedPayments', newPayments);
                  }}
                  disabled={!editMode}
                  className="w-4 h-4 text-[#AF2638] focus:ring-[#AF2638] border-gray-300 rounded disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Insurance Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Insurance & Warranty</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Do you provide insurance/warranty?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="providesInsurance"
                    value="yes"
                    checked={businessData?.providesInsurance === 'yes'}
                    onChange={(e) => handleInputChange('providesInsurance', e.target.value)}
                    disabled={!editMode}
                    className="w-4 h-4 text-[#AF2638] focus:ring-[#AF2638] disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="providesInsurance"
                    value="no"
                    checked={businessData?.providesInsurance === 'no'}
                    onChange={(e) => handleInputChange('providesInsurance', e.target.value)}
                    disabled={!editMode}
                    className="w-4 h-4 text-[#AF2638] focus:ring-[#AF2638] disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
            
            {businessData?.providesInsurance === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Number</label>
                <input
                  type="text"
                  value={businessData?.insuranceNumber || ''}
                  onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AF2638] disabled:bg-gray-100"
                  placeholder="Enter your insurance number"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuotes = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quote Requests</h3>
      </div>
      <div className="p-6">
        {quoteRequests.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quote requests</h3>
            <p className="mt-1 text-sm text-gray-500">Start getting quote requests from customers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quoteRequests.map(quote => (
              <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{quote.customerName}</h4>
                    <p className="text-sm text-gray-600">{quote.customerEmail}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    quote.status === 'responded' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {quote.status}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-700"><strong>Service:</strong> {quote.service}</p>
                  <p className="text-sm text-gray-700"><strong>Request Date:</strong> {quote.requestDate}</p>
                </div>
                {quote.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-[#AF2638] text-white rounded-md hover:bg-red-700 text-sm">
                      Send Quote
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {businessData?.name || 'Business Owner'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'profile', name: 'Profile', icon: '👤' },
              { id: 'quotes', name: 'Quote Requests', icon: '📋' },
              { id: 'settings', name: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#AF2638] text-[#AF2638]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'quotes' && renderQuotes()}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard; 