export type UserRole = 'client' | 'moderator' | 'admin' | 'super_admin';
export type AdStatus = 'draft'|'submitted'|'under_review'|'payment_pending'|'payment_submitted'|'payment_verified'|'scheduled'|'published'|'expired'|'archived'|'rejected';
export type PackageType = 'basic' | 'standard' | 'premium';
export type MediaSourceType = 'github_raw' | 'direct_image' | 'youtube' | 'other_url';
export type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'failed';
export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface User {
  id: string; email: string; full_name: string|null; role: UserRole;
  avatar_url: string|null; is_verified: boolean; is_active: boolean;
  created_at: string; updated_at: string;
}
export interface SellerProfile {
  id: string; user_id: string; business_name: string|null;
  phone: string|null; whatsapp: string|null; city: string|null;
  bio: string|null; website_url: string|null; is_verified: boolean;
  verified_at: string|null; total_ads: number;
}
export interface Category {
  id: string; name: string; slug: string; description: string|null;
  icon: string|null; color: string|null; ad_count: number;
  is_active: boolean; sort_order: number;
}
export interface City {
  id: string; name: string; slug: string; province: string|null;
  country: string; ad_count: number; is_active: boolean;
}
export interface Package {
  id: string; name: string; type: PackageType; price: number;
  duration_days: number; featured_weight: number; homepage_visibility: boolean;
  category_priority: boolean; auto_refresh: boolean;
  refresh_interval_days: number|null; description: string|null;
  features: string[]; is_active: boolean;
}
export interface Ad {
  id: string; slug: string; title: string; description: string|null;
  category_id: string|null; city_id: string|null; owner_id: string;
  package_id: string|null; status: AdStatus; is_featured: boolean;
  admin_boost: number; rank_score: number; view_count: number;
  click_count: number; contact_clicks: number; publish_at: string|null;
  expire_at: string|null; rejection_reason: string|null;
  moderator_notes: string|null; is_deleted: boolean;
  created_at: string; updated_at: string;
}
export interface AdWithDetails extends Ad {
  category_name: string|null; category_slug: string|null; category_icon: string|null;
  city_name: string|null; city_slug: string|null; package_name: string|null;
  package_type: PackageType|null; package_weight: number|null;
  owner_name: string|null; business_name: string|null; seller_verified: boolean;
  primary_media_url: string|null; primary_media_type: MediaSourceType|null;
}
export interface AdMedia {
  id: string; ad_id: string; source_type: MediaSourceType;
  original_url: string; normalized_thumbnail_url: string|null;
  validation_status: ValidationStatus; is_primary: boolean; sort_order: number;
}
export interface Payment {
  id: string; ad_id: string; user_id: string; package_id: string;
  amount: number; transaction_ref: string; proof_url: string|null;
  status: PaymentStatus; submitted_at: string|null; verified_at: string|null;
  verified_by: string|null; rejection_reason: string|null; notes: string|null;
  created_at: string;
}
export interface Notification {
  id: string; user_id: string; ad_id: string|null; type: string;
  title: string; message: string|null; is_read: boolean; created_at: string;
}
export interface AuditLog {
  id: string; actor_id: string|null; actor_role: UserRole|null;
  action: string; entity_type: string; entity_id: string|null;
  old_value: Record<string,unknown>|null; new_value: Record<string,unknown>|null;
  created_at: string;
}
export interface ApiResponse<T> { data: T|null; error: string|null; message?: string; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface AnalyticsOverview {
  total_ads: number; active_ads: number; pending_ads: number; expired_ads: number;
  total_revenue: number; monthly_revenue: number; approval_rate: number; rejection_rate: number;
}
export interface RevenueByPackage { package_name: string; package_type: PackageType; revenue: number; ad_count: number; }
export interface AdsByCategory { category_name: string; count: number; color: string; }
