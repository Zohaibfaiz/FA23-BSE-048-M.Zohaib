// lib/validations/schemas.ts
import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// ─── Create Ad ───────────────────────────────────────────────

export const createAdSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  price: z.number().positive().optional().nullable(),
  price_label: z.string().max(50).optional(),
  contact_phone: z.string().max(20).optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_whatsapp: z.string().max(20).optional(),
  city_id: z.string().uuid('Please select a city'),
  category_id: z.string().uuid('Please select a category'),
  package_id: z.string().uuid('Please select a package'),
  media_urls: z
    .array(z.string().url('Each media entry must be a valid URL'))
    .min(1, 'At least one media URL is required')
    .max(5, 'Maximum 5 media URLs allowed'),
});

// ─── Payment Submission ──────────────────────────────────────

export const submitPaymentSchema = z.object({
  ad_id: z.string().uuid(),
  transaction_ref: z.string().min(4, 'Transaction reference required').max(100),
  amount: z.number().positive('Amount must be positive'),
  payment_method: z.string().min(2),
  proof_url: z.string().url('Payment proof must be a valid URL (image/doc link)'),
  notes: z.string().max(500).optional(),
});

// ─── Moderator Review ────────────────────────────────────────

export const moderatorReviewSchema = z.object({
  ad_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  note: z.string().min(3, 'Please provide a review note').max(500),
});

// ─── Admin Payment Verification ─────────────────────────────

export const adminPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  action: z.enum(['verify', 'reject']),
  rejection_reason: z.string().max(500).optional(),
});

// ─── Admin Publish / Schedule ────────────────────────────────

export const adminPublishSchema = z.object({
  ad_id: z.string().uuid(),
  action: z.enum(['publish_now', 'schedule', 'mark_featured']),
  publish_at: z.string().optional(), // ISO date string for scheduled
  is_featured: z.boolean().optional(),
  admin_boost: z.number().int().min(0).max(50).optional(),
});

// ─── Abuse Report ────────────────────────────────────────────

export const abuseReportSchema = z.object({
  ad_id: z.string().uuid(),
  reason: z.string().min(5, 'Please provide a reason').max(200),
  details: z.string().max(1000).optional(),
});

// ─── Package Management (Super Admin) ────────────────────────

export const packageSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  price: z.number().positive(),
  duration_days: z.number().int().positive(),
  homepage_visibility: z.boolean(),
  featured_weight: z.number().int().min(1).max(10),
  refresh_rule: z.enum(['none', 'manual', 'auto_3days']),
  description: z.string().max(300).optional(),
  features: z.array(z.string()).max(10),
});

// Type exports
export type LoginInput          = z.infer<typeof loginSchema>;
export type RegisterInput        = z.infer<typeof registerSchema>;
export type CreateAdInput        = z.infer<typeof createAdSchema>;
export type SubmitPaymentInput   = z.infer<typeof submitPaymentSchema>;
export type ModeratorReviewInput = z.infer<typeof moderatorReviewSchema>;
export type AdminPaymentInput    = z.infer<typeof adminPaymentSchema>;
export type AdminPublishInput    = z.infer<typeof adminPublishSchema>;
export type AbuseReportInput     = z.infer<typeof abuseReportSchema>;
export type PackageInput         = z.infer<typeof packageSchema>;
