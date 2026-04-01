# AdFlow Pro Deployment Checklist

## 1. Supabase Setup

- Create a new Supabase project.
- Open the SQL Editor in Supabase.
- Run [`supabase/migrations/001_initial_schema.sql`](C:/Users/user/Documents/GitHub/Fa23-BSE-014.AHMAR/Adflow%20Pro/supabase/migrations/001_initial_schema.sql).
- Confirm these tables exist:
  `users`, `seller_profiles`, `packages`, `categories`, `cities`, `ads`, `ad_media`, `payments`, `notifications`, `audit_logs`, `ad_status_history`, `system_health_logs`.
- Confirm the `handle_new_user` trigger exists so Supabase Auth users are mirrored into `public.users`.

## 2. Supabase Auth

- In Supabase Auth, enable Email/Password sign-in.
- Set your production site URL to your Vercel domain.
- Add these redirect URLs:
  `https://your-domain.vercel.app/auth/login`
  `https://your-domain.vercel.app/auth/register`
- Create at least one `super_admin` user by updating the `role` in `public.users` after signup.

## 3. Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

Production values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=generate_a_long_random_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 4. Vercel Project

- Push this repo to GitHub.
- Import the repo into Vercel.
- Framework preset: `Next.js`
- Root directory: repo root
- Install command: default
- Build command: `npm run build`
- Output directory: default

## 5. Cron Jobs

[`vercel.json`](C:/Users/user/Documents/GitHub/Fa23-BSE-014.AHMAR/Adflow%20Pro/vercel.json) already includes:

- `/api/cron/publish-scheduled` -> daily at 01:00 UTC
- `/api/cron/expire-ads` -> daily at 02:00 UTC
- `/api/health/db` -> daily at 03:00 UTC

Notes:

- These schedules are Hobby-plan safe. If you need hourly or more frequent cron runs, upgrade the Vercel project to Pro and adjust [`vercel.json`](C:/Users/user/Documents/GitHub/Fa23-BSE-014.AHMAR/Adflow%20Pro/vercel.json).
- `publish-scheduled` and `expire-ads` now accept Vercel Bearer cron auth via `CRON_SECRET`.
- Make sure `CRON_SECRET` is present in Vercel before going live.

## 6. Production Smoke Test

After deploy, verify:

1. Register a new client account.
2. Confirm a row appears in `public.users`.
3. Create a draft ad.
4. Submit it for review.
5. Approve it from the moderator dashboard.
6. Submit payment proof from the client dashboard.
7. Verify payment from the admin dashboard.
8. Schedule or publish the ad from admin.
9. Confirm the ad appears on `/explore`.
10. Confirm expired ads disappear from public listings.

## 7. RBAC Validation

- Client cannot access `/moderator`, `/admin`, or `/super-admin`.
- Moderator can access moderation queue but not super admin controls.
- Admin can verify payments and publish ads.
- Super admin can manage packages, categories, and cities.

## 8. Database Validation

Confirm these records are created during workflow:

- `payments`
- `notifications`
- `audit_logs`
- `ad_status_history`
- `system_health_logs`

## 9. Recommended Go-Live Checks

- Rotate `SUPABASE_SERVICE_ROLE_KEY` if it was ever shared in development.
- Use a strong `CRON_SECRET`.
- Review Supabase RLS policies once in production.
- Create backup/export policy for Postgres.
- Add your real support/legal contact info in:
  [`app/contact/page.tsx`](C:/Users/user/Documents/GitHub/Fa23-BSE-014.AHMAR/Adflow%20Pro/app/contact/page.tsx)
  [`app/terms/page.tsx`](C:/Users/user/Documents/GitHub/Fa23-BSE-014.AHMAR/Adflow%20Pro/app/terms/page.tsx)

## 10. Final Ready Signal

The app is deployment-ready when all of these are true:

- `npm run build` passes
- Supabase migration is applied
- Vercel env vars are set
- One `super_admin` exists
- Smoke test passes end-to-end
