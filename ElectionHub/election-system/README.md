# SecureVote Pro

Transparent • Secure • Anonymous • Real-Time Elections

## 🚀 Features

### For Voters
* Secure anonymous registration
* Secret Voter IDs sent via email
* End-to-end encrypted voting process
* Real-time election results

### For Election Creators
* Multi-step election creation process
* Candidate management with photo uploads
* Real-time tracking and analytics
* Secure publishing workflow

### For Admins
* Comprehensive enterprise dashboard
* Real-time activity monitoring
* Audit logs for all critical actions
* User and election management

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite
* **Styling:** Tailwind CSS, Framer Motion, lucide-react
* **Backend:** Supabase (Auth, Postgres, Realtime, Storage, Edge Functions)
* **State Management:** React Context + Custom Hooks
* **Routing:** React Router DOM v6
* **Security:** CryptoJS, DOMPurify, Zod Validation

## 📦 Installation

1. Clone the repository
2. Run `npm install`
3. Set up environment variables in `.env`
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run `npm run dev` to start the development server.

## 🔐 Security Notes

* All sensitive operations are logged in `audit_logs`
* Passwords and Secret IDs are hashed securely
* Supabase Row Level Security (RLS) is strictly enforced
* Uploads are sanitized and restricted to images

## 👥 Contributors

* FA23-BSE-048
* FA23-BSE-068
* COMSATS University Islamabad Vehari Campus
