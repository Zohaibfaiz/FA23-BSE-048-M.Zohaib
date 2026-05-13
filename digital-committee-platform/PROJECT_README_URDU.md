# Digital Committee Platform

## Overview
Digital Committee Platform ek web application hai jo universities, colleges, ya kisi bhi organization ke liye committees ko manage karne ke liye banayi gayi hai. Is platform ki madad se admin, committee members, aur users apne roles ke hisaab se committees, users, payments, notifications, aur analytics ko efficiently manage kar sakte hain.

## Features
- **Authentication & Authorization:** Login, Register, Forgot/Reset Password, Email Verification
- **Admin Panel:** Committees, Users, Logs management
- **Committee Management:** Committees create, browse, detail view, list
- **Payments:** Payment detail, payment history
- **Notifications:** Real-time notifications for users
- **Profile & Settings:** User profile update, settings
- **Analytics Dashboard:** Committees aur platform ki usage analytics
- **Responsive UI:** Modern design with Tailwind CSS

## Folder Structure
- `src/app/admin/` — Admin panel features (committees, users, logs)
- `src/app/analytics/` — Analytics dashboard
- `src/app/auth/` — Authentication (login, register, etc.)
- `src/app/committees/` — Committee management (browse, create, detail, list)
- `src/app/core/` — Core services, guards, models
- `src/app/dashboard/` — Main dashboard
- `src/app/landing/` — Landing page
- `src/app/notifications/` — Notifications
- `src/app/payments/` — Payments
- `src/app/profile/` — User profile
- `src/app/settings/` — User settings
- `src/app/shared/` — Shared UI components

## Technologies Used
- **Angular** (v21+)
- **Tailwind CSS** (for styling)
- **Supabase** (as backend/database)
- **Vercel** (for deployment)

## How to Run Locally
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:4200](http://localhost:4200) in your browser.

## Scripts
- `npm start` — Start development server
- `npm test` — Run unit tests
- `ng build` — Build for production

## Database
- Database schema aur functions `supabase/` folder mein hain.
- `seed.sql` — Initial data
- `migrations/` — Schema migrations

## Deployment
- Platform ko Vercel par deploy kiya ja sakta hai. `vercel.json` config file included hai.

## Contributing
1. Fork repo aur apni branch par kaam karein.
2. Changes commit karen aur PR bhejein.

## License
MIT

---

**Project Maintainer:** M. Zohaib

Agar aapko koi issue ho ya feature request ho, toh issue section mein report karein.
