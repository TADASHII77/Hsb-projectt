import { BaseEntity, Address, Attachment, EstimatedBudget, EnquiryStatus, EnquiryPriority, ContactPreference } from './common';

// Enquiry-specific fields
export interface EnquiryFields {
  business: string; // Business ID
  user: string; // User ID
  service: string[];
  location: Address;
  description: string;
  category: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  estimatedBudget: EstimatedBudget;
  preferredDate?: string;
  preferredTime?: string;
  contactPreference: ContactPreference;
  additionalNotes?: string;
  attachments: Attachment[];
}

// Complete Enquiry type
export interface Enquiry extends BaseEntity, EnquiryFields {}

// Enquiry creation type
export interface CreateEnquiryRequest {
  businessId: string;
  service: string[];
  category: string;
  description: string;
  location: Address;
  estimatedBudget: EstimatedBudget;
  preferredDate?: string;
  preferredTime?: string;
  contactPreference: ContactPreference;
  additionalNotes?: string;
  attachments?: File[];
}

// Enquiry update type
export interface UpdateEnquiryRequest {
  service?: string[];
  category?: string;
  description?: string;
  location?: Address;
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  estimatedBudget?: EstimatedBudget;
  preferredDate?: string;
  preferredTime?: string;
  contactPreference?: ContactPreference;
  additionalNotes?: string;
  attachments?: File[];
}

// Enquiry profile type (for display)
export interface EnquiryProfile {
  _id: string;
  business: {
    _id: string;
    name: string;
    logo?: string;
    rating: number;
    verified: boolean;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: string[];
  location: Address;
  description: string;
  category: string;
  status: EnquiryStatus;
  priority: EnquiryPriority;
  estimatedBudget: EstimatedBudget;
  preferredDate?: string;
  preferredTime?: string;
  contactPreference: ContactPreference;
  additionalNotes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Enquiry status update type
export interface UpdateEnquiryStatusRequest {
  status: EnquiryStatus;
  notes?: string;
}

// Enquiry priority update type
export interface UpdateEnquiryPriorityRequest {
  priority: EnquiryPriority;
  reason?: string;
}

// Enquiry assignment type
export interface AssignEnquiryRequest {
  businessId: string;
  notes?: string;
}

// Enquiry response type
export interface EnquiryResponse {
  _id: string;
  enquiryId: string;
  businessId: string;
  message: string;
  price?: number;
  estimatedTime?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// Enquiry quote type
export interface EnquiryQuote {
  _id: string;
  enquiryId: string;
  businessId: string;
  business: {
    _id: string;
    name: string;
    logo?: string;
    rating: number;
    verified: boolean;
  };
  price: number;
  estimatedTime: string;
  description: string;
  terms?: string;
  validUntil?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// Enquiry search and filter types
export interface EnquirySearchFilters {
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  category?: string;
  service?: string[];
  businessId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface EnquirySearchParams {
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  category?: string;
  service?: string[];
  businessId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  budgetMin?: number;
  budgetMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Enquiry statistics type
export interface EnquiryStats {
  totalEnquiries: number;
  pendingEnquiries: number;
  inProgressEnquiries: number;
  completedEnquiries: number;
  cancelledEnquiries: number;
  averageResponseTime: number;
  averageBudget: number;
  totalQuotes: number;
  acceptedQuotes: number;
}

// Enquiry dashboard data type
export interface EnquiryDashboardData {
  stats: EnquiryStats;
  recentEnquiries: EnquiryProfile[];
  recentQuotes: EnquiryQuote[];
  notifications: any[]; // Will be typed when Notification types are available
}

// Enquiry timeline type
export interface EnquiryTimelineEvent {
  _id: string;
  enquiryId: string;
  type: 'created' | 'status_changed' | 'priority_changed' | 'assigned' | 'quote_received' | 'quote_accepted' | 'completed' | 'cancelled';
  title: string;
  description: string;
  actor: {
    _id: string;
    name: string;
    type: 'user' | 'business' | 'admin';
  };
  data?: any;
  timestamp: string;
}

export interface EnquiryTimeline {
  enquiryId: string;
  events: EnquiryTimelineEvent[];
}

// Enquiry notification types
export interface EnquiryNotification {
  _id: string;
  enquiryId: string;
  recipientId: string;
  recipientType: 'user' | 'business' | 'admin';
  type: 'enquiry_created' | 'status_updated' | 'quote_received' | 'quote_accepted' | 'reminder' | 'deadline_approaching';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: string;
}

// Enquiry reminder type
export interface EnquiryReminder {
  _id: string;
  enquiryId: string;
  type: 'response_reminder' | 'follow_up' | 'deadline_reminder';
  message: string;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

// Enquiry export type
export interface EnquiryExportData {
  enquiries: EnquiryProfile[];
  exportDate: string;
  filters?: EnquirySearchFilters;
}

// Enquiry bulk operations type
export interface BulkEnquiryOperation {
  enquiryIds: string[];
  operation: 'update_status' | 'update_priority' | 'assign_business' | 'delete';
  data?: any;
}

// Enquiry template type
export interface EnquiryTemplate {
  _id: string;
  name: string;
  category: string;
  services: string[];
  description: string;
  estimatedBudget: EstimatedBudget;
  contactPreference: ContactPreference;
  createdBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Enquiry from template type
export interface CreateEnquiryFromTemplateRequest {
  templateId: string;
  businessId: string;
  location: Address;
  preferredDate?: string;
  preferredTime?: string;
  additionalNotes?: string;
  customizations?: {
    description?: string;
    estimatedBudget?: EstimatedBudget;
    services?: string[];
  };
}

// Enquiry analytics type
export interface EnquiryAnalytics {
  totalEnquiries: number;
  enquiriesByStatus: Record<EnquiryStatus, number>;
  enquiriesByPriority: Record<EnquiryPriority, number>;
  enquiriesByCategory: Record<string, number>;
  averageResponseTime: number;
  averageBudget: number;
  conversionRate: number;
  topServices: Array<{
    service: string;
    count: number;
  }>;
  enquiriesOverTime: Array<{
    date: string;
    count: number;
  }>;
}

// Admin enquiry management types
export interface AdminEnquiryUpdateRequest {
  status?: EnquiryStatus;
  priority?: EnquiryPriority;
  businessId?: string;
  notes?: string;
}

export interface AdminEnquiryStats {
  totalEnquiries: number;
  pendingEnquiries: number;
  inProgressEnquiries: number;
  completedEnquiries: number;
  cancelledEnquiries: number;
  averageResponseTime: number;
  averageBudget: number;
  totalQuotes: number;
  acceptedQuotes: number;
  enquiriesByStatus: Record<EnquiryStatus, number>;
  enquiriesByPriority: Record<EnquiryPriority, number>;
  enquiriesByCategory: Record<string, number>;
}

// Enquiry search result type
export interface EnquirySearchResult {
  enquiries: EnquiryProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: EnquirySearchFilters;
}

// Export all enquiry-related types
export type {
  EnquiryStatus,
  EnquiryPriority,
  ContactPreference,
  Address,
  Attachment,
  EstimatedBudget
};
