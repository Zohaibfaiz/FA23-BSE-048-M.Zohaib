// ============================================================
// AdFlow Pro - Complete TypeScript Type Definitions
// ============================================================

export type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin';

export type AdStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'payment_pending'
  | 'payment_submitted'
  | 'payment_verified'
  | 'scheduled'
  | 'published'
  | 'expired'
  | 'archived';

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';
export type MediaSourceType = 'github_raw' | 'direct_image' | 'youtube' | 'other';
export type MediaValidationStatus = 'pending' | 'valid' | 'invalid';
export type PackageTier = 'basic' | 'standard' | 'premium';
export type NotificationType =
  | 'status_change'
  | 'payment_required'
  | 'payment_verified'
  | 'payment_rejected'
  | 'ad_expiring_soon'
  | 'ad_expired'
  | 'moderation_note'
  | 'system';

// ============================================================
// DATABASE ENTITY TYPES
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_verified_seller: boolean;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  website_url: string | null;
  description: string | null;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  tier: PackageTier;
  duration_days: number;
  price: number;
  homepage_visibility: boolean;
  featured_weight: number;
  refresh_rule: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  country: string;
  is_active: boolean;
  created_at: string;
}

export interface Ad {
  id: string;
  slug: string;
  title: string;
  description: string;
  user_id: string;
  package_id: string | null;
  category_id: string | null;
  city_id: string | null;
  status: AdStatus;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  price: number | null;
  is_featured: boolean;
  admin_boost: number;
  rank_score: number;
  freshness_points: number;
  last_refreshed_at: string | null;
  publish_at: string | null;
  expire_at: string | null;
  moderation_notes: string | null;
  rejection_reason: string | null;
  view_count: number;
  click_count: number;
  report_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdMedia {
  id: string;
  ad_id: string;
  source_type: MediaSourceType;
  original_url: string;
  normalized_thumbnail_url: string | null;
  youtube_video_id: string | null;
  validation_status: MediaValidationStatus;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Payment {
  id: string;
  ad_id: string;
  user_id: string;
  package_id: string;
  amount: number;
  currency: string;
  transaction_ref: string | null;
  payment_proof_url: string | null;
  status: PaymentStatus;
  submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  ad_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AdStatusHistory {
  id: string;
  ad_id: string;
  from_status: AdStatus | null;
  to_status: AdStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface LearningQuestion {
  id: string;
  question: string;
  options: Array<{ text: string; is_correct: boolean }>;
  explanation: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SystemHealthLog {
  id: string;
  check_type: string;
  status: 'ok' | 'warning' | 'error';
  message: string | null;
  metadata: Record<string, unknown> | null;
  duration_ms: number | null;
  created_at: string;
}

// ============================================================
// JOINED / ENRICHED TYPES
// ============================================================

export interface AdWithRelations extends Ad {
  user?: User;
  package?: Package;
  category?: Category;
  city?: City;
  media?: AdMedia[];
  payment?: Payment;
}

export interface PublicAd {
  id: string;
  slug: string;
  title: string;
  description: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  price: number | null;
  is_featured: boolean;
  rank_score: number;
  view_count: number;
  click_count: number;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
  seller_name: string | null;
  is_verified_seller: boolean;
  package_name: string | null;
  package_tier: PackageTier | null;
  category_name: string | null;
  category_slug: string | null;
  city_name: string | null;
  city_slug: string | null;
  media?: AdMedia[];
}

// ============================================================
// FORM TYPES (Zod validated, see lib/validations.ts)
// ============================================================

export interface CreateAdForm {
  title: string;
  description: string;
  category_id: string;
  city_id: string;
  package_id: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  price?: number;
  media_urls: string[];
}

export interface PaymentSubmitForm {
  ad_id: string;
  transaction_ref: string;
  payment_proof_url: string;
  notes?: string;
}

export interface ReviewAdForm {
  ad_id: string;
  action: 'approve' | 'reject';
  notes?: string;
  rejection_reason?: string;
}

export interface ScheduleAdForm {
  ad_id: string;
  publish_at: string;
  is_featured?: boolean;
  admin_boost?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface AnalyticsSummary {
  totalAds: number;
  activeAds: number;
  pendingReview: number;
  expiredAds: number;
  totalRevenue: number;
  revenueByPackage: { package: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  moderationStats: { approved: number; rejected: number; pending: number };
  adsByCategory: { category: string; count: number }[];
  adsByCity: { city: string; count: number }[];
}

// ============================================================
// AD STATUS FLOW
// ============================================================
export const AD_STATUS_FLOW: Record<AdStatus, AdStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['payment_pending', 'archived'],
  payment_pending: ['payment_submitted'],
  payment_submitted: ['payment_verified', 'payment_pending'],
  payment_verified: ['scheduled', 'published'],
  scheduled: ['published'],
  published: ['expired', 'archived'],
  expired: ['archived'],
  archived: [],
};

export const AD_STATUS_LABELS: Record<AdStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  payment_pending: 'Payment Pending',
  payment_submitted: 'Payment Submitted',
  payment_verified: 'Payment Verified',
  scheduled: 'Scheduled',
  published: 'Published',
  expired: 'Expired',
  archived: 'Archived',
};

export const AD_STATUS_COLORS: Record<AdStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  payment_pending: 'bg-orange-100 text-orange-700',
  payment_submitted: 'bg-purple-100 text-purple-700',
  payment_verified: 'bg-teal-100 text-teal-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  published: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
};
