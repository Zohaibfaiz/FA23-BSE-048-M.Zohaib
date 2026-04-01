# AdFlow Pro - Sponsored Listing Marketplace

A production-ready sponsored listing marketplace with moderation, payment verification, automated scheduling, and analytics.

## 📸 Project Screenshots

### 🏠 Home Page
![Home Page](https://github.com/user-attachments/assets/a16b3693-779b-46f2-b984-7da4f29d514a)

---

### 🔐 Login / Signup
![Login](https://github.com/user-attachments/assets/b4bf83b6-983f-4fc2-87fe-c5deccf03ca7)

---

### 📊 Dashboard
![Dashboard](https://github.com/user-attachments/assets/c65a85ce-a3d4-4778-8781-fa370cbe0174)

---

### 📚 Features Page
![Features](https://github.com/user-attachments/assets/3c0ea494-766d-46ef-8446-7b0446025445)

---

### 👨‍🎓 User Panel
![User Panel](https://github.com/user-attachments/assets/46a70359-5969-4d80-9a3e-bdf18d6db8a3)

---

### ⚙️ Admin Panel
![Admin Panel](https://github.com/user-attachments/assets/c36fe42f-c99f-405a-a233-d46426e3d0d5)

---

### 📅 Additional Feature
![Extra Feature](https://github.com/user-attachments/assets/92c34e91-c4b7-4e75-81a7-e488783099e1)

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
