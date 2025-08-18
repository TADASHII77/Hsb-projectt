import { BaseEntity, BaseUserFields, BusinessHours, ServiceRadius, PaymentMethod, ApplicationStatus } from './common';

// Business-specific fields
export interface BusinessFields {
  reviews: number;
  logo?: string;
  images: string[];
  expert: boolean;
  services: string[];
  ownerName: {
    firstName: string;
    lastName: string;
  };
  businessPhone: string;
  website?: string;
  description: string;
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
  acceptedPayments: PaymentMethod[];
  googleBusinessLink?: string;
  rating: number;
  verified: boolean;
  category: string;
  applicationStatus: ApplicationStatus;
}

// Complete Business type
export interface Business extends BaseEntity, BaseUserFields, BusinessFields {
  userType: 'Business';
}

// Business creation/registration type
export interface CreateBusinessRequest {
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
  address?: {
    street?: string;
    province?: string;
    state?: string;
    country?: string;
  };
  
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
  acceptedPayments: PaymentMethod[];
  googleBusinessLink?: string;
}

// Business update type
export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  services?: string[];
  category?: string;
  website?: string;
  businessPhone?: string;
  operatingHours?: {
    monday?: BusinessHours;
    tuesday?: BusinessHours;
    wednesday?: BusinessHours;
    thursday?: BusinessHours;
    friday?: BusinessHours;
    saturday?: BusinessHours;
    sunday?: BusinessHours;
  };
  serviceRadius?: ServiceRadius;
  insurance?: boolean;
  insuranceNumber?: string;
  acceptedPayments?: PaymentMethod[];
  googleBusinessLink?: string;
  logo?: string;
  images?: string[];
}

// Business profile type (for display)
export interface BusinessProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    province?: string;
    state?: string;
    country?: string;
  };
  reviews: number;
  logo?: string;
  images: string[];
  expert: boolean;
  services: string[];
  ownerName: {
    firstName: string;
    lastName: string;
  };
  businessPhone: string;
  website?: string;
  description: string;
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
  acceptedPayments: PaymentMethod[];
  googleBusinessLink?: string;
  rating: number;
  verified: boolean;
  category: string;
  applicationStatus: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// Business search and filter types
export interface BusinessSearchFilters {
  job?: string;
  location?: string;
  category?: string;
  verified?: boolean;
  rating?: number;
  sortBy?: string;
  maxDistance?: string;
  bureauVerifiedOnly?: boolean;
  minRating?: string;
  services?: string[];
  insurance?: boolean;
  expert?: boolean;
  applicationStatus?: ApplicationStatus;
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
  services?: string[];
  insurance?: boolean;
  expert?: boolean;
  applicationStatus?: ApplicationStatus;
}

// Business statistics type
export interface BusinessStats {
  totalEnquiries: number;
  completedEnquiries: number;
  pendingEnquiries: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  joinDate: string;
  lastActive: string;
}

// Business dashboard data type
export interface BusinessDashboardData {
  business: BusinessProfile;
  stats: BusinessStats;
  recentEnquiries: any[]; // Will be typed when Enquiry types are available
  recentQuotes: any[]; // Will be typed when Quote types are available
  notifications: any[]; // Will be typed when Notification types are available
}

// Business application types
export interface BusinessApplication {
  _id: string;
  businessId: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  documents: {
    businessLicense?: string;
    insuranceCertificate?: string;
    otherDocuments?: string[];
  };
}

// Business verification types
export interface BusinessVerificationRequest {
  businessId: string;
  documents: {
    businessLicense?: File;
    insuranceCertificate?: File;
    otherDocuments?: File[];
  };
  notes?: string;
}

export interface BusinessVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    application: BusinessApplication;
  };
  error?: string;
}

// Business hours update type
export interface UpdateBusinessHoursRequest {
  operatingHours: {
    monday?: BusinessHours;
    tuesday?: BusinessHours;
    wednesday?: BusinessHours;
    thursday?: BusinessHours;
    friday?: BusinessHours;
    saturday?: BusinessHours;
    sunday?: BusinessHours;
  };
}

// Business service update type
export interface UpdateBusinessServicesRequest {
  services: string[];
  category?: string;
}

// Business contact update type
export interface UpdateBusinessContactRequest {
  businessPhone?: string;
  website?: string;
  googleBusinessLink?: string;
}

// Business payment methods update type
export interface UpdateBusinessPaymentMethodsRequest {
  acceptedPayments: PaymentMethod[];
}

// Business insurance update type
export interface UpdateBusinessInsuranceRequest {
  insurance: boolean;
  insuranceNumber?: string;
}

// Business logo and images update type
export interface UpdateBusinessMediaRequest {
  logo?: File;
  images?: File[];
}

// Business expert status update type
export interface UpdateBusinessExpertStatusRequest {
  expert: boolean;
  reason?: string;
}

// Business rating and review types
export interface BusinessReview {
  _id: string;
  businessId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

// Business search result type
export interface BusinessSearchResult {
  businesses: BusinessProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: BusinessSearchFilters;
}

// Business recommendation type
export interface BusinessRecommendation {
  business: BusinessProfile;
  score: number;
  reasons: string[];
}

// Business comparison type
export interface BusinessComparison {
  businesses: BusinessProfile[];
  comparisonFields: {
    rating: boolean;
    reviews: boolean;
    services: boolean;
    insurance: boolean;
    expert: boolean;
    distance: boolean;
    responseTime: boolean;
  };
}

// Admin business management types
export interface AdminBusinessUpdateRequest {
  verified?: boolean;
  expert?: boolean;
  applicationStatus?: ApplicationStatus;
  rating?: number;
  reviews?: number;
}

export interface AdminBusinessStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  expertBusinesses: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  averageRating: number;
  totalReviews: number;
}

// Business export types
export interface BusinessExportData {
  businesses: BusinessProfile[];
  exportDate: string;
  filters?: BusinessSearchFilters;
}

// Business import types
export interface BusinessImportData {
  businesses: Partial<CreateBusinessRequest>[];
  importDate: string;
  importedBy: string;
}

// Export all business-related types
export type {
  PaymentMethod,
  ApplicationStatus,
  BusinessHours,
  ServiceRadius
};
