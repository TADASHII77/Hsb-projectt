// Common types shared across different entities

export interface Address {
  street?: string;
  province?: string;
  state?: string;
  country?: string;
}

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUserFields {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface BusinessHours {
  start: string;
  end: string;
  closed: boolean;
}

export interface ServiceRadius {
  city: string;
  distance: string;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface EstimatedBudget {
  min: number;
  max: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and filter types
export interface SearchFilters {
  job?: string;
  location?: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  sortBy?: string;
  maxDistance?: string;
  bureauVerifiedOnly?: boolean;
  minRating?: string;
}

export interface BusinessSearchParams {
  job?: string;
  location?: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  sortBy?: string;
  distance?: number;
  page?: number;
  limit?: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface BusinessRegistrationForm {
  // Owner information
  ownerFirstName: string;
  ownerLastName: string;
  businessPhone: string;
  
  // Business information
  businessName: string;
  businessEmail: string;
  description: string;
  services: string[];
  category: string;
  
  // Contact information
  phone?: string;
  website?: string;
  
  // Address
  address?: Address;
  
  // Business details
  operatingHours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
  
  serviceRadius: ServiceRadius;
  insurance: boolean;
  insuranceNumber?: string;
  acceptedPayments: string[];
  googleBusinessLink?: string;
}

export interface QuoteRequestForm {
  service: string[];
  category: string;
  description: string;
  location: Address;
  estimatedBudget: EstimatedBudget;
  preferredDate?: string;
  preferredTime?: string;
  contactPreference: 'email' | 'phone' | 'both';
  additionalNotes?: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

export interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

// Component props types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  children: React.ReactNode;
}

// Utility types
export type UserRole = 'Customer' | 'Admin';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type EnquiryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type EnquiryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactPreference = 'email' | 'phone' | 'both';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'financing';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
