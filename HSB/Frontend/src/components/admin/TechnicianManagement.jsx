import React, { useState, useEffect } from 'react';
import { useTechnicians } from '../../hooks/useTechnicians';
import apiService from '../../services/api';
import { showSuccess, showError, showWarning } from '../../utils/alert';

const TechnicianManagement = () => {
  const { technicians, loading, refetch } = useTechnicians();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    rating: 4.0,
    reviews: 0,
    services: [],
    verified: false,
    emergency: false,
    distance: 0,
    category: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    serviceAreas: '',
    expertise: ''
  });

  const categories = ['Heating', 'Cooling', 'Installation', 'Repair', 'Maintenance', 'Emergency'];
  const serviceOptions = [
    'Heating', 'Cooling', 'Ventilation', 'AC Repair', 'Furnace Service', 'Duct Cleaning',
    'Installation', 'Maintenance', 'Emergency Repair', 'Heat Pump', 'Air Conditioning',
    'Boiler Service', 'Residential', 'Commercial', 'Industrial', 'Smart Thermostats',
    'Energy Efficiency', 'Emergency Service', 'Furnace Repair', 'AC Installation',
    'Duct Work', '24/7 Service', 'Quick Response', 'Eco-Friendly', 'Solar Integration'
  ];

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && tech.verified) ||
                         (filterStatus === 'unverified' && !tech.verified) ||
                         (filterStatus === 'emergency' && tech.emergency);
    
    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      rating: 4.0,
      reviews: 0,
      services: [],
      verified: false,
      emergency: false,
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

  const handleEdit = (technician) => {
    setSelectedTechnician(technician);
    setFormData({
      name: technician.name,
      rating: technician.rating,
      reviews: technician.reviews,
      services: technician.services,
      verified: technician.verified,
      emergency: technician.emergency,
      distance: technician.distance,
      category: technician.category,
      address: technician.address,
      phone: technician.phone,
      website: technician.website,
      description: technician.description,
      serviceAreas: technician.serviceAreas,
      expertise: technician.expertise
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        // Update technician
        const techId = selectedTechnician.technicianId || selectedTechnician.id;
        const result = await apiService.updateTechnician(techId, formData);
        if (result.success) {
          showSuccess('Technician updated successfully!', 'Update Success');
        } else {
          showError('Failed to update technician: ' + (result.message || 'Unknown error'), 'Update Failed');
        }
      } else {
        // Add new technician
        const result = await apiService.createTechnician(formData);
                if (result.success) {
          showSuccess('Technician created successfully!', 'Creation Success');
      } else {
          showError('Failed to create technician: ' + (result.message || 'Unknown error'), 'Creation Failed');
        }
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedTechnician(null);
      refetch();
    } catch (error) {
      console.error('Error saving technician:', error);
      showError('An error occurred while saving the technician. Please try again.', 'Save Error');
    }
  };

  const handleDelete = async (technicianId) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      try {
        const result = await apiService.deleteTechnician(technicianId);
                if (result.success) {
          showSuccess('Technician deleted successfully!', 'Delete Success');
        refetch();
        } else {
          showError('Failed to delete technician: ' + (result.message || 'Unknown error'), 'Delete Failed');
        }
      } catch (error) {
        console.error('Error deleting technician:', error);
        showError('An error occurred while deleting the technician. Please try again.', 'Delete Error');
      }
    }
  };

  const handleToggleVerification = async (technician) => {
    try {
      const result = await apiService.toggleTechnicianVerification(technician.technicianId || technician.id);
      console.log('Verification toggled successfully:', result);
      refetch();
    } catch (error) {
      console.error('Error updating verification:', error);
      // Show user-friendly error message
      showError('Failed to update verification status. Please try again.', 'Verification Error');
    }
  };

  const TechnicianModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isEdit ? 'Edit Technician' : 'Add New Technician'}
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
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
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
                  checked={formData.emergency}
                  onChange={(e) => setFormData({...formData, emergency: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Emergency Service</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedTechnician(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#AF2638] text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                {isEdit ? 'Update' : 'Add'} Technician
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
        <div className="text-lg text-gray-600">Loading technicians...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Technician Management</h2>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all HVAC technicians in your platform.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#AF2638] hover:bg-red-700"
          >
            <span className="mr-2">+</span>
            Add Technician
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
              placeholder="Search technicians..."
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
              <option value="all">All Technicians</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="emergency">Emergency Service</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              Showing {filteredTechnicians.length} of {technicians.length} technicians
            </span>
          </div>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
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
            {filteredTechnicians.map((technician) => (
              <tr key={technician.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        👷
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                      <div className="text-sm text-gray-500">{technician.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {technician.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{technician.rating}</span>
                    <span className="ml-1 text-yellow-400">⭐</span>
                    <span className="ml-1 text-sm text-gray-500">({technician.reviews})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {technician.verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                    {technician.emergency && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🚨 24/7
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {technician.distance}km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      onClick={() => handleToggleVerification(technician)}
                      className={`px-3 py-1 rounded text-xs ${
                        technician.verified 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {technician.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleEdit(technician)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(technician.id)}
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
      {showAddModal && <TechnicianModal />}
      {showEditModal && <TechnicianModal isEdit={true} />}
    </div>
  );
};

export default TechnicianManagement; 