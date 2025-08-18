import { BaseEntity, BaseUserFields, NotificationPreferences, UserRole, UserStatus } from './common';

// User/Admin specific fields
export interface UserFields {
  role: UserRole;
  status: UserStatus;
  preferences: {
    notifications: NotificationPreferences;
  };
  lastActive: string;
  joinDate: string;
  enquiryCount: number;
  enquiries: string[]; // Array of Enquiry IDs
}

// Complete User type
export interface User extends BaseEntity, BaseUserFields, UserFields {
  userType: 'User';
}

// User creation/registration type
export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  address?: {
    street?: string;
    province?: string;
    state?: string;
    country?: string;
  };
  role?: UserRole;
}

// User update type
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: {
    street?: string;
    province?: string;
    state?: string;
    country?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
  };
}

// User profile type (for display)
export interface UserProfile {
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
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  enquiryCount: number;
  preferences: {
    notifications: NotificationPreferences;
  };
}

// User session type
export interface UserSession {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

// User authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserProfile;
    token: string;
  };
  error?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  address?: {
    street?: string;
    province?: string;
    state?: string;
    country?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserProfile;
    token: string;
  };
  error?: string;
}

// User statistics type
export interface UserStats {
  totalEnquiries: number;
  remainingEnquiries: number;
  completedEnquiries: number;
  activeEnquiries: number;
  joinDate: string;
  lastActive: string;
}

// User preferences update type
export interface UpdateUserPreferencesRequest {
  notifications: {
    email?: boolean;
    sms?: boolean;
  };
}

// User password change type
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// User password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// User verification types
export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// User account management types
export interface DeactivateAccountRequest {
  password: string;
  reason?: string;
}

export interface ReactivateAccountRequest {
  email: string;
  token: string;
}

// User search and filter types
export interface UserSearchFilters {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  name?: string;
  province?: string;
  state?: string;
  joinDateFrom?: string;
  joinDateTo?: string;
  lastActiveFrom?: string;
  lastActiveTo?: string;
}

export interface UserSearchParams {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  name?: string;
  province?: string;
  state?: string;
  joinDateFrom?: string;
  joinDateTo?: string;
  lastActiveFrom?: string;
  lastActiveTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Admin user management types
export interface AdminUserUpdateRequest {
  role?: UserRole;
  status?: UserStatus;
  enquiryCount?: number;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  customers: number;
  admins: number;
  newUsersThisMonth: number;
  activeUsersThisMonth: number;
}

// User activity types
export interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface UserActivityLog {
  activities: UserActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User notification types
export interface UserNotification {
  _id: string;
  userId: string;
  type: 'enquiry_update' | 'quote_received' | 'account_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push?: boolean;
}

// User dashboard types
export interface UserDashboardData {
  user: UserProfile;
  stats: UserStats;
  recentEnquiries: any[]; // Will be typed when Enquiry types are available
  notifications: UserNotification[];
  activities: UserActivity[];
}

// Export all user-related types
export type {
  UserRole,
  UserStatus,
  NotificationPreferences
};
