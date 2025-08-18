import { z } from 'zod';
import apiService from './api.js';

// Validation schema for login credentials
export const signInSchema = z.object({
  email: z.string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

// User session type
export const userSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['Customer', 'Business']),
  businessId: z.string().nullable().optional(),
});

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'auth_user';
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return userSessionSchema.parse(user);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      this.signOut();
      return null;
    }
  }

  // Store authentication data
  setAuth(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  // Sign in with credentials
  async signIn(credentials) {
    try {
      // Validate credentials
      const validatedCredentials = await signInSchema.parseAsync(credentials);
      
      // Call backend login endpoint
      const response = await apiService.login(validatedCredentials);
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Extract user data from response
      const userData = response.data;
      
      // Create user session object
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        businessId: userData.businessId || null,
      };

      // Validate user data
      const validatedUser = userSessionSchema.parse(user);

      // Store authentication data
      // Note: Since your backend doesn't return JWT tokens, we'll use a simple session approach
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.setAuth(sessionToken, validatedUser);

      return {
        success: true,
        user: validatedUser,
        token: sessionToken,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid credentials format',
          details: error.errors,
        };
      }
      
      // Handle specific API errors
      if (error.status) {
        let errorMessage = error.message;
        
        // Enhance error messages based on status codes
        if (error.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.status === 400) {
          if (error.message.includes('required')) {
            errorMessage = 'Please fill in all required fields.';
          } else {
            errorMessage = error.message;
          }
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again in a few minutes.';
        } else if (error.isNetworkError) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        return {
          success: false,
          error: errorMessage,
          status: error.status,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  // Sign out
  signOut() {
    this.clearAuth();
    return { success: true };
  }

  // Get current session
  getSession() {
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      user: this.getUser(),
      token: this.getToken(),
    };
  }

  // Refresh session (if needed)
  async refreshSession() {
    const user = this.getUser();
    if (!user) {
      return null;
    }

    // For now, just return the current session
    // In a real implementation, you might want to validate with the backend
    return this.getSession();
  }

  // Update user data (e.g., after profile update)
  updateUser(userData) {
    const currentUser = this.getUser();
    if (!currentUser) return false;

    const updatedUser = { ...currentUser, ...userData };
    const validatedUser = userSessionSchema.parse(updatedUser);
    
    localStorage.setItem(this.userKey, JSON.stringify(validatedUser));
    return true;
  }
}

export default new AuthService();
