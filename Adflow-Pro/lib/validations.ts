import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  role: z.enum(['client', 'moderator', 'admin', 'super_admin']).default('client'),
});

// ============================================================
// AD SCHEMAS
// ============================================================
const MEDIA_URL_REGEX =
  /^https:\/\/.+\.(jpg|jpeg|png)(\?.*)?$|^https:\/\/(www\.)?youtube\.com\/.+|^https:\/\/youtu\.be\/.+/i;

export const MediaUrlSchema = z.string().regex(
  MEDIA_URL_REGEX,
  'Must be an https jpg/png image URL or a YouTube URL'
);

export const CreateAdSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  category_id: z.string().uuid('Please select a valid category'),
  city_id: z.string().uuid('Please select a valid city'),
  package_id: z.string().uuid('Please select a valid package'),
  contact_email: z.string().email('Please enter a valid contact email'),
  contact_phone: z.string().optional(),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  price: z.number().min(0).max(1_000_000).optional(),
  media_urls: z
    .array(MediaUrlSchema)
    .min(1, 'Please add at least one media URL')
    .max(10, 'Maximum 10 media items allowed'),
});

export type CreateAdInput = z.infer<typeof CreateAdSchema>;

export const UpdateAdSchema = CreateAdSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================
// PAYMENT SCHEMAS
// ============================================================
export const SubmitPaymentSchema = z.object({
  ad_id: z.string().uuid(),
  transaction_ref: z
    .string()
    .min(4, 'Transaction reference must be at least 4 characters')
    .max(100),
  payment_proof_url: z.string().url('Payment proof must be a valid URL'),
  notes: z.string().max(500).optional(),
});

export type SubmitPaymentInput = z.infer<typeof SubmitPaymentSchema>;

export const VerifyPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  action: z.enum(['verify', 'reject']),
  rejection_reason: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

// ============================================================
// MODERATION SCHEMAS
// ============================================================
export const ReviewAdSchema = z.object({
  ad_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional(),
  rejection_reason: z.string().max(500).optional(),
});

export const ScheduleAdSchema = z.object({
  ad_id: z.string().uuid(),
  publish_at: z.string().datetime('Please enter a valid date and time'),
  is_featured: z.boolean().default(false),
  admin_boost: z.number().int().min(0).max(100).default(0),
});

export type ScheduleAdInput = z.infer<typeof ScheduleAdSchema>;

// ============================================================
// PACKAGE / CATEGORY / CITY SCHEMAS
// ============================================================
export const PackageSchema = z.object({
  name: z.string().min(2).max(50),
  tier: z.enum(['basic', 'standard', 'premium']),
  duration_days: z.number().int().min(1).max(365),
  price: z.number().min(0).max(10_000),
  homepage_visibility: z.boolean().default(false),
  featured_weight: z.number().int().min(1).max(10),
  refresh_rule: z.enum(['none', 'manual', 'auto_3_days']).default('none'),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
});

export const CategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const CitySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  state: z.string().max(50).optional(),
  country: z.string().min(2).max(3).default('US'),
  is_active: z.boolean().default(true),
});

// ============================================================
// REPORT SCHEMA
// ============================================================
export const ReportAbuseSchema = z.object({
  ad_id: z.string().uuid(),
  reason: z.enum([
    'spam',
    'misleading',
    'inappropriate',
    'fraud',
    'duplicate',
    'other',
  ]),
  details: z.string().max(1000).optional(),
  reporter_email: z.string().email().optional(),
});

// ============================================================
// SEARCH / FILTER SCHEMAS
// ============================================================
export const SearchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  sort: z.enum(['rank_score', 'created_at', 'price_asc', 'price_desc']).default('rank_score'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});
