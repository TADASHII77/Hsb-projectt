const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

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

  async getTechnicianByOwnerEmail(email) {
    const q = encodeURIComponent(email || '');
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/by-owner-email?email=${q}`);
  }

  async getTechnicianByBusinessEmail(email) {
    const q = encodeURIComponent(email || '');
    return this.fetchWithErrorHandling(`${this.baseURL}/technicians/by-business-email?email=${q}`);
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

  async exportTechnicians() {
    return this.fetchWithErrorHandling(`${this.baseURL}/admin/export/technicians`);
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${this.baseURL}/admin/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
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

  async registerTechnician(payload) {
    return this.fetchWithErrorHandling(`${this.baseURL}/auth/register-technician`, {
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