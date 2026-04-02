# AdFlow Pro - Sponsored Listing Marketplace

A production-ready sponsored listing marketplace with moderation, payment verification, automated scheduling, and analytics.
## 🚀 Live Demo

<h3>🌐 AdFlow Pro - Live Preview</h3>

<p align="center">
  <a href="https://adflow-pro-pink.vercel.app" target="_blank">
    🔗 Click here to view the live project
  </a>
</p>


## 📸 Project Screenshots

<p align="center">

  <h3>🏠 Home Page</h3>
  <img src="https://github.com/user-attachments/assets/bfdb5c11-3140-4f20-851a-ded600a18790" width="800"/><br><br>

  <h3>📋 Dashboard Overview</h3>
  <img src="https://github.com/user-attachments/assets/c723752c-dc35-42d6-8fb3-a85cb97e7f94" width="800"/><br><br>

  <h3>📊 Analytics / Data View</h3>
  <img src="https://github.com/user-attachments/assets/7a5c9eea-9269-4ef9-83a3-73f1cb24d0bd" width="800"/><br><br>

  <h3>🔐 Authentication Pages</h3>
  <img src="https://github.com/user-attachments/assets/d87ef4a6-af84-47c4-a4fc-40c7b6c3f568" width="400"/>
  <img src="https://github.com/user-attachments/assets/a8e839df-1ac1-4b26-97e1-b09ec806b031" width="400"/><br><br>

  <h3>⚙️ Features / Functional Screens</h3>
  <img src="https://github.com/user-attachments/assets/a8305e61-432c-46cd-ac13-201b25f704c4" width="400"/>
  <img src="https://github.com/user-attachments/assets/30ce2a43-98b5-4d8b-a40f-25cca8db4bb1" width="400"/><br><br>

  <h3>📱 Responsive View</h3>
  <img src="https://github.com/user-attachments/assets/e587f12e-e17c-408a-b5cc-747937c9980c" width="400"/>

</p>


## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup Supabase (see Setup section below)

# 3. Configure environment
cp .env.example .env.local
# Add your Supabase credentials

# 4. Run development server
npm run dev
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase Postgres with Row Level Security
- **Auth**: Supabase Auth with role-based access
- **UI**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel with Cron automation

## Features

### User Roles & RBAC
- **Client**: Create ads, submit payments, track status
- **Moderator**: Review and approve/reject ads
- **Admin**: Verify payments, schedule ads, manage analytics
- **Super Admin**: Manage packages, categories, cities, system settings

### Ad Lifecycle
Draft → Submitted → Under Review → Payment Pending → Payment Submitted → Payment Verified → Scheduled → Published → Expired → Archived

### Package System
- **Basic**: 7 days, no homepage visibility, 1x weight, Rs 2,999
- **Standard**: 15 days, category priority, 2x weight, manual refresh, Rs 6,999
- **Premium**: 30 days, homepage visibility, 3x weight, auto-refresh every 3 days, Rs 14,999

### Ranking Formula
```
rankScore = (featured ? 50 : 0) + (packageWeight * 10) + freshnessPoints + adminBoost + verifiedSellerPoints
```

### External Media Strategy
- No local uploads - only external URLs
- Supports: Direct images, GitHub raw URLs, YouTube (auto-thumbnail)
- Automatic normalization and validation
- Fallback to placeholder on error

### Automation
- **Hourly**: Publish scheduled ads
- **Daily**: Expire ads + send 48h reminders
- **Every 6 hours**: Database health check

## Setup (5 Minutes)

### 1. Supabase Setup

```bash
# 1. Create project at https://supabase.com
# 2. Go to SQL Editor → New Query
# 3. Copy/paste supabase/migrations/001_initial_schema.sql
# 4. Click "Run"
# 5. (Optional) Run supabase/seed.sql for sample data
# 6. Get credentials from Settings → API
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

Open http://localhost:3000

### 3. Create First User

1. Go to `/auth/register`
2. Create account
3. Login and start creating ads!

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your_github_repo_url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com and import your GitHub repository
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (generate a random string)
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)

3. Deploy!

### 3. Configure Cron Jobs

Vercel Cron is automatically configured via `vercel.json`:
- Publish scheduled ads: Every hour
- Expire ads: Daily at midnight
- Health check: Every 6 hours

The cron endpoints are protected by the `CRON_SECRET` environment variable.

## Project Structure

```
adflow-pro/
├── app/
│   ├── api/
│   │   ├── auth/logout/route.ts
│   │   ├── cron/
│   │   │   ├── expire-ads/route.ts
│   │   │   └── publish-scheduled/route.ts
│   │   └── health/db/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── ads/create/page.tsx
│   │   └── page.tsx
│   ├── ads/[slug]/page.tsx
│   ├── explore/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── auth.ts
│   ├── media.ts
│   ├── ranking.ts
│   ├── types.ts
│   ├── utils.ts
│   └── validations.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.example
├── vercel.json
├── package.json
├── tailwind.config.ts
└── README.md
```

## API Routes

### Public
- `GET /api/health/db` - Database health check

### Cron Jobs (Protected by CRON_SECRET)
- `GET /api/cron/publish-scheduled` - Publish scheduled ads
- `GET /api/cron/expire-ads` - Expire ads and send reminders

### Auth
- `POST /api/auth/logout` - Logout user

## Database Schema

### Core Tables
- `users` - User accounts with roles
- `seller_profiles` - Seller business information
- `packages` - Ad packages (Basic, Standard, Premium)
- `categories` - Ad categories
- `cities` - Available cities
- `ads` - Sponsored listings
- `ad_media` - External media URLs
- `payments` - Payment records
- `notifications` - User notifications
- `audit_logs` - System audit trail
- `ad_status_history` - Ad status changes
- `learning_questions` - Quiz questions
- `system_health_logs` - System health monitoring

### Views
- `v_public_ads` - Public ads with joined data

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control via user metadata
- Service role key never exposed to client
- Cron endpoints protected by secret
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries

## Business Rules

1. Only published, non-expired ads visible publicly
2. Payment record mandatory before publishing
3. All status changes logged in audit trail
4. Duplicate transaction references blocked
5. Featured ads always ranked first
6. Expired ads never shown publicly
7. Rank score recalculated on updates

## Analytics Dashboard

Track key metrics:
- Total/active/pending/expired ads
- Revenue by package and monthly trends
- Moderation approval/rejection rates
- Ads by category and city distribution

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License - feel free to use for your projects!

---

Built with ❤️ using Next.js 14, Supabase, and Tailwind CSS
