# AdFlow Pro - API Reference

Complete reference for all API endpoints and features.

## Authentication Endpoints

### POST /api/auth/logout
Logout current user and clear session.

**Auth Required**: Yes

**Response**:
```json
{
  "success": true
}
```

## Cron Job Endpoints

All cron endpoints require `Authorization: Bearer {CRON_SECRET}` header.

### GET /api/cron/publish-scheduled
Publish ads that are scheduled and ready to go live.

**Schedule**: Every hour (via Vercel Cron)

**Response**:
```json
{
  "success": true,
  "published": 3,
  "ads": ["uuid1", "uuid2", "uuid3"]
}
```

### GET /api/cron/expire-ads
Expire ads past their expiry date and send 48h reminders.

**Schedule**: Daily at midnight (via Vercel Cron)

**Response**:
```json
{
  "success": true,
  "expired": 5,
  "reminders": 10
}
```

## Health Check Endpoints

### GET /api/health/db
Check database connectivity and log heartbeat.

**Schedule**: Every 6 hours (via Vercel Cron)

**Auth Required**: No

**Response**:
```json
{
  "status": "ok",
  "duration_ms": 45,
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

## Database Tables

### users
User accounts with role-based access.

**Columns**:
- `id` (UUID, PK) - User ID from auth.users
- `email` (TEXT) - User email
- `full_name` (TEXT) - Full name
- `role` (user_role) - client | moderator | admin | super_admin
- `is_verified_seller` (BOOLEAN) - Verified seller badge
- `avatar_url` (TEXT) - Profile picture URL
- `phone` (TEXT) - Phone number
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `deleted_at` (TIMESTAMPTZ) - Soft delete

**RLS Policies**:
- Users can view their own data
- Staff can view all users
- Users can update their own data
- Admins can update any user

### ads
Sponsored listings with full lifecycle management.

**Columns**:
- `id` (UUID, PK)
- `slug` (TEXT, UNIQUE) - URL-friendly identifier
- `title` (TEXT) - Ad title
- `description` (TEXT) - Ad description
- `user_id` (UUID, FK) - Owner
- `package_id` (UUID, FK) - Selected package
- `category_id` (UUID, FK) - Category
- `city_id` (UUID, FK) - City
- `status` (ad_status) - Current lifecycle status
- `contact_email` (TEXT)
- `contact_phone` (TEXT)
- `website_url` (TEXT)
- `price` (NUMERIC)
- `is_featured` (BOOLEAN) - Featured flag
- `admin_boost` (INTEGER) - Manual ranking boost
- `rank_score` (NUMERIC) - Calculated ranking score
- `freshness_points` (INTEGER) - Freshness score (0-10)
- `last_refreshed_at` (TIMESTAMPTZ)
- `publish_at` (TIMESTAMPTZ) - Scheduled publish time
- `expire_at` (TIMESTAMPTZ) - Expiry time
- `moderation_notes` (TEXT)
- `rejection_reason` (TEXT)
- `view_count` (INTEGER)
- `click_count` (INTEGER)
- `report_count` (INTEGER)
- `is_deleted` (BOOLEAN) - Soft delete
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes**:
- `idx_ads_status` - Status filtering
- `idx_ads_rank_score` - Ranking queries
- `idx_ads_expire_at` - Expiry checks
- `idx_ads_publish_at` - Scheduling
- `idx_ads_title_trgm` - Full-text search
- `idx_ads_description_trgm` - Full-text search

**RLS Policies**:
- Public can view published, non-expired ads
- Owners can view their own ads
- Staff can view all ads
- Clients can create ads
- Owners can update draft ads
- Staff can update any ad

### packages
Ad packages with pricing and features.

**Columns**:
- `id` (UUID, PK)
- `name` (TEXT) - Package name
- `tier` (package_tier) - basic | standard | premium
- `duration_days` (INTEGER) - Visibility duration
- `price` (NUMERIC) - Package price
- `homepage_visibility` (BOOLEAN) - Show on homepage
- `featured_weight` (INTEGER) - Ranking multiplier
- `refresh_rule` (TEXT) - none | manual | auto_3_days
- `description` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Default Packages**:
1. Basic: 7 days, Rs 2,999, 1x weight
2. Standard: 15 days, Rs 6,999, 2x weight, manual refresh
3. Premium: 30 days, Rs 14,999, 3x weight, auto-refresh

**RLS Policies**:
- Public can view all packages
- Super admins can manage packages

### payments
Payment records with verification workflow.

**Columns**:
- `id` (UUID, PK)
- `ad_id` (UUID, FK)
- `user_id` (UUID, FK)
- `package_id` (UUID, FK)
- `amount` (NUMERIC)
- `currency` (TEXT)
- `transaction_ref` (TEXT, UNIQUE) - Payment reference
- `payment_proof_url` (TEXT) - Screenshot URL
- `status` (payment_status) - pending | submitted | verified | rejected
- `submitted_at` (TIMESTAMPTZ)
- `verified_at` (TIMESTAMPTZ)
- `verified_by` (UUID, FK) - Admin who verified
- `rejection_reason` (TEXT)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**RLS Policies**:
- Users can view their own payments
- Staff can view all payments
- Users can create and update pending payments
- Admins can verify/reject payments

## Ad Status Flow

```
draft
  ↓ (user submits)
submitted
  ↓ (moderator reviews)
under_review
  ↓ (approved)
payment_pending
  ↓ (user submits payment)
payment_submitted
  ↓ (admin verifies)
payment_verified
  ↓ (admin schedules)
scheduled
  ↓ (cron publishes)
published
  ↓ (cron expires)
expired
  ↓ (admin archives)
archived
```

## Ranking Algorithm

```typescript
rankScore = 
  (is_featured ? 50 : 0) +
  (package_weight * 10) +
  freshness_points +
  admin_boost +
  (is_verified_seller ? 5 : 0)
```

**Components**:
- Featured: +50 points
- Package weight: +10 (Basic), +20 (Standard), +30 (Premium)
- Freshness: 0-10 points (decays over 30 days)
- Admin boost: 0-100 points (manual)
- Verified seller: +5 points

## Media Normalization

### Supported Sources
1. **Direct Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
2. **GitHub Raw**: `raw.githubusercontent.com/*`
3. **YouTube**: `youtube.com/watch?v=*` or `youtu.be/*`

### Normalization Process
```typescript
// YouTube
youtube.com/watch?v=VIDEO_ID
  → img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg

// Direct images
https://example.com/image.jpg
  → https://example.com/image.jpg (unchanged)

// GitHub raw
raw.githubusercontent.com/user/repo/main/image.png
  → raw.githubusercontent.com/user/repo/main/image.png (unchanged)
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `CRON_SECRET` - Secret for cron endpoint authentication

### Optional
- `NEXT_PUBLIC_APP_URL` - Application URL (for redirects)

## Vercel Cron Configuration

Defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/expire-ads",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/health/db",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently not implemented. Recommended for production:
- Use Vercel Pro rate limiting
- Or implement custom middleware with Redis

## Security Best Practices

1. **Never expose service_role key** to client
2. **Always validate input** with Zod schemas
3. **Use RLS policies** for data access control
4. **Rotate CRON_SECRET** regularly
5. **Enable email confirmation** in production
6. **Monitor audit logs** for suspicious activity
7. **Use HTTPS** in production (automatic on Vercel)

---

For implementation details, see the source code in `/app/api/` directory.
