const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async fetchWithErrorHandling(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
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

  // Get all technicians
  async getTechnicians() {
   
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians`);
  }

  // Get technician by ID
  async getTechnicianById(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/${id}`);
  }

  // Search technicians
  async searchTechnicians(query) {
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/search/${encodeURIComponent(query)}`);
  }

  // Filter technicians
  async filterTechnicians(filters) {
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/filter`, {
      method: 'POST',
      body: JSON.stringify(filters),
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

  async getAdminTechnicians(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/technicians${queryString ? '?' + queryString : ''}`);
  }

  async createTechnician(technicianData) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/technicians`, {
      method: 'POST',
      body: JSON.stringify(technicianData),
    });
  }

  async updateTechnician(id, technicianData) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(technicianData),
    });
  }

  async deleteTechnician(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/technicians/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTechnicianVerification(id) {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/technicians/${id}/verify`, {
      method: 'PATCH',
    });
  }

  async getAdminUsers() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/users`);
  }

  async exportTechnicians() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/export/technicians`);
  }

  // Request quote from technician
  async requestQuote(technicianId, customerData) {
    // Transform frontend data format to backend expected format
    const requestData = {
      customerName: customerData.name,
      customerEmail: customerData.email
    };
    
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/${technicianId}/quote`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
}

export default new ApiService(); 