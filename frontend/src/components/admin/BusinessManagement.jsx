import React, { useState, useEffect } from 'react';
import { useBusinesses } from '../../hooks/useBusinesses.jsx';
import apiService from '../../services/api';
import { showSuccess, showError, showWarning } from '../../utils/alert';

const BusinessManagement = () => {
  const { businesses, loading, refetch } = useBusinesses();
  const [showAddModal, setShowAddModal] = useState(false);  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    rating: 4.0,
    reviews: 0,
    services: [],
    verified: false,
    expert: false,
    distance: 0,
    category: '',
    address: '',
    phone: '', // Owner phone (from base schema)
    businessPhone: '', // Business phone
    website: '',
    description: '',
    serviceAreas: '',
    expertise: ''
  });

  const categories = ['Heating', 'Cooling', 'Installation', 'Repair', 'Maintenance', 'Expert'];
  const serviceOptions = [
    'Heating', 'Cooling', 'Ventilation', 'AC Repair', 'Furnace Service', 'Duct Cleaning',
    'Installation', 'Maintenance', 'Emergency Repair', 'Heat Pump', 'Air Conditioning',
    'Boiler Service', 'Residential', 'Commercial', 'Industrial', 'Smart Thermostats',
    'Energy Efficiency', 'Emergency Service', 'Furnace Repair', 'AC Installation',
    'Duct Work', '24/7 Service', 'Quick Response', 'Eco-Friendly', 'Solar Integration'
  ];

  const filteredBusinesses = businesses.filter(business => {
    // Helper function to format address for search
    const formatAddressForSearch = (business) => {
      if (!business.address) return "";
      const { street, province, state, country } = business.address;
      const parts = [street, province, state, country].filter(Boolean);
      return parts.join(" ").toLowerCase();
    };

    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatAddressForSearch(business).includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && business.verified) ||
                         (filterStatus === 'unverified' && !business.verified) ||
                         (filterStatus === 'expert' && business.expert);
    
    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rating: 4.0,
      reviews: 0,
      services: [],
      verified: false,
      expert: false,
      distance: 0,
      category: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      serviceAreas: '',
      expertise: ''
    });
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      rating: business.rating,
      reviews: business.reviews,
      services: business.services,
      verified: business.verified,
      expert: business.expert,
      distance: business.distance,
      category: business.category,
      address: business.address,
      phone: business.phone, // Owner phone
      businessPhone: business.businessPhone || '', // Business phone
      website: business.website,
      description: business.description,
      serviceAreas: business.serviceAreas,
      expertise: business.expertise
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        // Update business
        const businessId = selectedBusiness._id || selectedBusiness.id;
        const result = await apiService.updateBusiness(businessId, formData);
        if (result.success) {
          showSuccess('Business updated successfully!', 'Update Success');
        } else {
          showError('Failed to update business: ' + (result.message || 'Unknown error'), 'Update Failed');
        }
      } else {
        // Add new business
        const result = await apiService.createBusiness(formData);
        if (result.success) {
          showSuccess('Business created successfully!', 'Creation Success');
        } else {
          showError('Failed to create business: ' + (result.message || 'Unknown error'), 'Creation Failed');
        }
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedBusiness(null);
      refetch();
    } catch (error) {
      console.error('Error saving business:', error);
      showError('An error occurred while saving the business. Please try again.', 'Save Error');
    }
  };

  const handleDelete = async (businessId) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        const result = await apiService.deleteBusiness(businessId);
        if (result.success) {
          showSuccess('Business deleted successfully!', 'Delete Success');
          refetch();
        } else {
          showError('Failed to delete business: ' + (result.message || 'Unknown error'), 'Delete Failed');
        }
      } catch (error) {
        console.error('Error deleting business:', error);
        showError('An error occurred while deleting the business. Please try again.', 'Delete Error');
      }
    }
  };

  const handleToggleVerification = async (business) => {
    try {
      const result = await apiService.toggleBusinessVerification(business._id || business.id);
      console.log('Verification toggled successfully:', result);
      refetch();
    } catch (error) {
      console.error('Error updating verification:', error);
      // Show user-friendly error message
      showError('Failed to update verification status. Please try again.', 'Verification Error');
    }
  };

  const BusinessModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEdit ? 'Edit Business' : 'Add New Business'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                <input
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="+1234567890"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: parseFloat(e.target.value)})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Services</label>
              <div className="mt-2 grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {serviceOptions.map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, services: [...formData.services, service]});
                        } else {
                          setFormData({...formData, services: formData.services.filter(s => s !== service)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Areas</label>
              <input
                type="text"
                value={formData.serviceAreas}
                onChange={(e) => setFormData({...formData, serviceAreas: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Toronto, Ontario; Mississauga, Ontario"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Expertise</label>
              <input
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="HVAC Installation, Emergency Service, Repair"
                required
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Verified</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.expert}
                  onChange={(e) => setFormData({...formData, expert: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Expert Service</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedBusiness(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#AF2638] text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                {isEdit ? 'Update' : 'Add'} Business
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading businesses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Management</h2>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all businesses in your platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#AF2638] hover:bg-red-700"
          >
            <span className="mr-2">+</span>
            Add Business
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Businesses</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="expert">Expert Service</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              Showing {filteredBusinesses.length} of {businesses.length} businesses
            </span>
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        👷
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{business.name}</div>
                      <div className="text-sm text-gray-500">
                        <div>Owner: {business.phone}</div>
                        <div>Business: {business.businessPhone || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {business.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{business.rating}</span>
                    <span className="ml-1 text-yellow-400">⭐</span>
                    <span className="ml-1 text-sm text-gray-500">({business.reviews})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {business.verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                    {business.expert && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🚨 24/7
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {business.distance}km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      onClick={() => handleToggleVerification(business)}
                      className={`px-3 py-1 rounded text-xs ${
                        business.verified 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {business.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleEdit(business)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && <BusinessModal />}
      {showEditModal && <BusinessModal isEdit={true} />}
    </div>
  );
};

export default BusinessManagement;
