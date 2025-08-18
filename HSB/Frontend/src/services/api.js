
// Use local development API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async fetchWithErrorHandling(url, options = {}) {
    try {
      // Add admin token if available and URL is admin-related
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Check if this is an admin request and add auth header
      if (url.includes('/admin')) {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          headers['Authorization'] = `Bearer ${adminToken}`;
        }
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract meaningful error message from response
        let errorMessage = 'An error occurred';
        
        if (data && data.message) {
          errorMessage = data.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid credentials';
        } else if (response.status === 400) {
          errorMessage = 'Invalid request data';
        } else if (response.status === 404) {
          errorMessage = 'Resource not found';
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error';
        } else if (response.status >= 500) {
          errorMessage = 'Server error';
        } else if (response.status >= 400) {
          errorMessage = 'Request error';
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // If it's already a formatted error, re-throw it
      if (error.status) {
        throw error;
      }
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error - unable to connect to server');
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      // Handle other errors
      const genericError = new Error(error.message || 'An unexpected error occurred');
      genericError.status = 500;
      throw genericError;
    }
  }

  // Generic HTTP methods
  async get(endpoint) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`);
  }

  async post(endpoint, data) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.fetchWithErrorHandling(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
    });
  }

  // Get all businesses
  async getBusinesses() {
    return this.fetchWithErrorHandling(`${this.baseURL}/businesses`);
  }

  // Get business by ID
  async getBusinessById(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/businesses/${id}`);
  }

  // Search businesses by text query
  async searchBusinessesByQuery(query) {
    return this.fetchWithErrorHandling(`${this.baseURL}/businesses/search/${encodeURIComponent(query)}`);
  }

  // Filter businesses with comprehensive parameters
  async filterBusinesses(filters) {
    return this.fetchWithErrorHandling(`${this.baseURL}/businesses/filter`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Search businesses with job, location, and filters
  async searchBusinesses(params) {
    const {
      job,
      location,
      category,
      verified,
      expert,
      rating,
      distance,
      sortBy,
      page = 1,
      limit = 50
    } = params;

    const filters = {
      page,
      limit,
      status: 'approved'
    };

    // Add job/service search
    if (job) {
      filters.services = [job];
    }

    // Add category search
    if (category) {
      filters.category = category;
    }

    // Add location search
    if (location) {
      filters.city = location;
    }

    // Add other filters
    if (verified !== undefined) filters.verified = verified;
    if (expert !== undefined) filters.expert = expert;
    if (rating) filters.rating = rating;
    if (distance) filters.distance = distance;
    if (sortBy) filters.sortBy = sortBy;

    return this.filterBusinesses(filters);
  }

  // Get businesses by location
  async getBusinessesByLocation(location) {
    return this.fetchWithErrorHandling(`${this.baseURL}/businesses/filter`, {
      method: 'POST',
      body: JSON.stringify({ city: location }),
    });
  }



  // Health check
  async healthCheck() {
    return this.fetchWithErrorHandling(`${this.baseURL}/health`);
  }

  // Admin endpoints
  async getAdminStats() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/stats`);
  }

  async getAdminBusinesses(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/businesses${queryString ? '?' + queryString : ''}`);
  }

  async createBusiness(businessData) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/businesses`, {
      method: 'POST',
      body: JSON.stringify(businessData),
    });
  }

  async updateBusiness(id, businessData) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessData),
    });
  }

  async deleteBusiness(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleBusinessVerification(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/businesses/${id}/verify`, {
      method: 'PATCH',
    });
  }

  async getAdminUsers() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/users`);
  }

  // Convenience: fetch a single user by email using admin listing endpoint
  async getUserByEmail(email) {
    const query = new URLSearchParams({ search: email, limit: 1 }).toString();
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/users?${query}`);
  }

  // Update user by id
  async updateUserById(id, payload) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async exportBusinesses() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/export/businesses`);
  }

  async uploadFile(file, businessName = 'temp') {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.baseURL}/businesses/upload?businessName=${encodeURIComponent(businessName)}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  // Request quote from business (now using enquiry system)
  async requestQuote(businessId, customerData) {
    // Transform frontend data format to backend expected format
    const requestData = {
      businessId: businessId,
      customerName: customerData.name,
      customerEmail: customerData.email,
      service: customerData.service || "General Service",
      description: customerData.description || "Quote request from customer",
      category: customerData.category || "General"
    };
    
    return this.fetchWithErrorHandling(`${this.baseURL}/enquiry`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Jobs endpoints for user
  async getJobsByUserEmail(email) {
    // Reuse GET /jobs with search filter if available; otherwise, fetch all and filter client-side.
    // Backend currently doesn't expose filter by customer email, so we fetch all and filter.
    const res = await this.get('/jobs');
    if (!res?.success) return { success: false, data: [] };
    const jobs = res.data || [];
    return {
      success: true,
      data: jobs.filter(j => j?.customerInfo?.email?.toLowerCase() === email?.toLowerCase())
    };
  }

  // Auth endpoints
  async registerCustomer(payload) {
    return this.fetchWithErrorHandling(`${this.baseURL}/auth/register-customer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async registerBusiness(payload) {
    return this.fetchWithErrorHandling(`${this.baseURL}/auth/register-business`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(payload) {
    return this.fetchWithErrorHandling(`${this.baseURL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export default new ApiService(); 