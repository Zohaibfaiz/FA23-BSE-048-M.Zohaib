# 🚀 AdFlow Pro — Pakistan's Premier Sponsored Listing Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-blue?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

> **Live Demo:** `https://adflow-pro.vercel.app` *(replace with your deployed URL)*

---

## ✨ Features

- 🔐 **4 User Roles** — Client, Moderator, Admin, Super Admin (RBAC via Supabase RLS)
- 📋 **Complete Ad Lifecycle** — Draft → Submitted → Under Review → Payment Pending → Verified → Published → Expired
- 🏆 **AI Ranking Formula** — `rankScore = featured(50) + packageWeight×10 + freshness + adminBoost + verifiedSeller`
- 💳 **Payment Verification** — External URL proof submission, admin manual verification
- 📦 **3 Packages** — Basic (7d), Standard (15d), Premium (30d + homepage + auto-refresh)
- 🎬 **External Media Only** — YouTube thumbnails, GitHub raw, direct image URLs (NO file uploads)
- ⏰ **Cron Automation** — Auto-publish scheduled ads, expire old ads, 48h reminders
- 📊 **Analytics Dashboard** — Revenue, moderation rates, ads by category/city (Recharts)
- 🚨 **Abuse Reporting** — Report button on every ad, admin review panel
- ✅ **Seller Verified Badge** — Managed by Super Admin
- 🗑️ **Soft Delete** — Ads never hard-deleted (deleted_at field)
- 📱 **Fully Responsive** — Mobile-first design

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Frontend    | Next.js 14+ (App Router) |
| Backend     | Supabase (Postgres + Auth + RLS) |
| Styling     | Tailwind CSS + Framer Motion |
| Charts      | Recharts |
| Validation  | Zod + React Hook Form |
| Auth        | Supabase Auth (email/password) |
| Deployment  | Vercel + Vercel Cron |

---

## 🗂️ Folder Structure

```
adflow-pro/
├── app/
│   ├── page.tsx                    ← Homepage
│   ├── layout.tsx                  ← Root layout
│   ├── globals.css                 ← Global styles
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (public)/
│   │   ├── explore/                ← Browse ads with filters
│   │   ├── ads/[slug]/             ← Ad detail page
│   │   ├── packages/               ← Pricing page
│   │   ├── categories/             ← All categories
│   │   ├── faq/
│   │   ├── contact/
│   │   └── terms/
│   ├── (dashboard)/
│   │   ├── client/                 ← Create ads, submit payment
│   │   ├── moderator/              ← Review queue
│   │   ├── admin/                  ← Payments, publish, analytics
│   │   └── superadmin/             ← Manage packages/users
│   └── api/
│       ├── ads/report/             ← Abuse report endpoint
│       ├── cron/
│       │   ├── publish-scheduled/  ← Auto-publish (hourly)
│       │   ├── expire-ads/         ← Auto-expire (daily)
│       │   └── db-heartbeat/       ← Health check (6h)
│       └── health/db/              ← Public health endpoint
├── components/
│   ├── ads/                        ← AdCard, AbuseReport, StatusBadge
│   ├── layout/                     ← Navbar, Footer, Hero, Packages, Stats
│   ├── dashboard/                  ← DashboardSidebar
│   └── forms/                      ← CreateAdForm, SubmitPaymentForm
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── utils/media.ts              ← URL normalization
│   └── validations/schemas.ts      ← Zod schemas
├── types/index.ts
├── middleware.ts                    ← Auth + role protection
├── vercel.json                      ← Cron schedules
└── supabase/
    ├── migrations/001_schema.sql   ← Full DB schema
    └── seed/001_seed.sql           ← Sample data (25 ads)
```

---

## 🚀 Local Setup (Step-by-Step)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/adflow-pro.git
cd adflow-pro
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create new project
2. SQL Editor → Run `supabase/migrations/001_schema.sql`
3. SQL Editor → Run `supabase/seed/001_seed.sql`
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=any-random-secret-string
```

### 4. Create Demo Users

In Supabase → Authentication → Users, create:

| Email | Password | Role |
|-------|----------|------|
| client@demo.com   | demo1234 | client (default) |
| mod@demo.com      | demo1234 | moderator |
| admin@demo.com    | demo1234 | admin |
| superadmin@demo.com | demo1234 | super_admin |

Then in Supabase SQL Editor, update roles:
```sql
UPDATE public.users SET role='moderator'   WHERE email='mod@demo.com';
UPDATE public.users SET role='admin'       WHERE email='admin@demo.com';
UPDATE public.users SET role='super_admin' WHERE email='superadmin@demo.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## ☁️ Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/adflow-pro.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Import your repo
2. Add all environment variables from `.env.example`
3. Deploy!

### 3. Cron Jobs (Auto-configured)

`vercel.json` already configures:
- `/api/cron/publish-scheduled` → every hour
- `/api/cron/expire-ads` → daily at 1 AM
- `/api/cron/db-heartbeat` → every 6 hours

Vercel will automatically call these with `Authorization: Bearer YOUR_CRON_SECRET`

---

## 🎯 Ad Lifecycle

```
Draft
  ↓ (client submits)
Submitted
  ↓ (moderator approves)
Payment Pending
  ↓ (client submits proof)
Payment Submitted
  ↓ (admin verifies)
Payment Verified
  ↓ (admin publishes or schedules)
Scheduled → Published
  ↓ (expire_at reached — cron job)
Expired → Archived
```

---

## 📊 Ranking Formula

```
rankScore = 
  (is_featured ? 50 : 0)
  + (package.featured_weight × 10)   // Basic=1x, Standard=2x, Premium=3x
  + freshness_points                   // 0–30 based on days since publish
  + admin_boost                        // 0–50 manual boost
  + (is_verified_seller ? 5 : 0)
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your domain URL |
| `CRON_SECRET` | ✅ | Secret to secure cron endpoints |

---

## 👨‍💻 Student Notes

This project demonstrates:
- **Server Components** (data fetching without useEffect)
- **Client Components** (interactive UI with 'use client')
- **Row Level Security** (database-level access control)
- **Middleware** (Next.js Edge for auth-protected routes)
- **Zod validation** (type-safe form validation)
- **Cron Jobs** (automated background tasks on Vercel)
- **Status machines** (predictable state transitions)
- **Audit logging** (complete action history)

---

*Built as Final Year Project (FYP) — AdFlow Pro by Ahmar*
