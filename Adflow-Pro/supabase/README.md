# 🗄️ Supabase Database Setup

Complete guide for setting up your AdFlow Pro database.

---

## 📁 Files in This Folder

### Required Files (Use These)

1. **`migrations/001_initial_schema.sql`** ⭐ MAIN FILE
   - Complete database schema
   - All 13 tables
   - RLS policies
   - Triggers and functions
   - Sample data (packages, categories, cities)
   - **Run this FIRST**

2. **`FIX_USER_SIGNUP.sql`** 🔧 FIX FILE
   - Fixes user registration error
   - Adds missing INSERT policy
   - **Run this if signup fails**

3. **`seed.sql`** 🌱 OPTIONAL
   - Sample data for testing
   - 25+ test ads
   - Test users
   - **Run after main schema**

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - Name: `adflow-pro`
   - Database Password: (save this!)
   - Region: (closest to you)
4. Wait ~2 minutes for setup

### Step 2: Run Main Schema
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open file: `migrations/001_initial_schema.sql`
4. **Copy ALL content** (Ctrl+A, Ctrl+C)
5. **Paste** in SQL Editor
6. Click **"Run"** (bottom right)
7. Wait ~30 seconds
8. Should see: "Success. No rows returned"

✅ **Done!** Database is ready with:
- 13 tables created
- RLS policies enabled
- Triggers configured
- Sample packages, categories, cities

### Step 3: Fix User Signup (IMPORTANT!)
1. In SQL Editor, click **"New Query"** again
2. Open file: `FIX_USER_SIGNUP.sql`
3. **Copy ALL content**
4. **Paste** in SQL Editor
5. Click **"Run"**
6. Should see: "Success"

✅ **Done!** User registration will now work!

### Step 4: Get Credentials
1. Go to **Settings** → **API** (left sidebar)
2. Copy these 3 values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long key)
   - **service_role**: `eyJhbGc...` (different long key)
3. Add to your `.env.local` file

### Step 5: (Optional) Add Sample Data
1. In SQL Editor, click **"New Query"**
2. Open file: `seed.sql`
3. **Copy ALL content**
4. **Paste** in SQL Editor
5. Click **"Run"**
6. Should create 25+ sample ads

---

## 🔍 Verify Setup

### Check Tables Created
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected output (13 tables):**
- ad_media
- ad_status_history
- ads
- audit_logs
- categories
- cities
- learning_questions
- notifications
- packages
- payments
- seller_profiles
- system_health_logs
- users

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**All tables should show:** `rowsecurity = true`

### Check Trigger Exists
```sql
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

**Should return:** 1 row

### Check Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;
```

**Should include:**
- users_insert_on_signup
- users_select_own
- users_update_own
- etc.

---

## 🐛 Troubleshooting

### Issue: "Database error" on signup

**Solution:** Run `FIX_USER_SIGNUP.sql`

This adds the missing INSERT policy that allows the trigger to create users.

### Issue: Tables already exist

**Solution:** Drop and recreate
```sql
-- WARNING: This deletes all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run 001_initial_schema.sql again
```

### Issue: Trigger not firing

**Solution:** Recreate trigger
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Issue: RLS blocking queries

**Solution:** Check policies
```sql
-- See all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporarily disable RLS (NOT for production!)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Database Schema Overview

### Core Tables (13)

1. **users** - User accounts with roles
2. **seller_profiles** - Business information
3. **packages** - 3 ad packages (Basic, Standard, Premium)
4. **categories** - 10 pre-seeded categories
5. **cities** - 10 pre-seeded US cities
6. **ads** - Sponsored listings (main table)
7. **ad_media** - External media URLs
8. **payments** - Payment records
9. **notifications** - User notifications
10. **audit_logs** - System audit trail
11. **ad_status_history** - Ad status tracking
12. **learning_questions** - Quiz questions
13. **system_health_logs** - Health monitoring

### Key Features

- **RLS Policies**: All tables secured
- **Triggers**: Auto-update timestamps, log changes
- **Functions**: Rank calculation, user creation
- **Indexes**: Optimized for performance
- **Views**: `v_public_ads` for easy querying

---

## 🎯 What Each File Does

### `migrations/001_initial_schema.sql`
- Creates all database structure
- Sets up security policies
- Adds initial data
- **This is the main file - run this first!**

### `FIX_USER_SIGNUP.sql`
- Fixes user registration error
- Adds missing INSERT policy
- Recreates trigger with error handling
- **Run this if signup doesn't work**

### `seed.sql`
- Adds sample data for testing
- Creates test ads
- Optional - only for development
- **Run after main schema**

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] `001_initial_schema.sql` executed
- [ ] 13 tables created
- [ ] RLS enabled on all tables
- [ ] `FIX_USER_SIGNUP.sql` executed
- [ ] Trigger exists
- [ ] INSERT policy exists
- [ ] Credentials copied to `.env.local`
- [ ] (Optional) `seed.sql` executed
- [ ] Registration tested and working

---

## 🚀 Next Steps

After database setup:

1. **Update `.env.local`** with Supabase credentials
2. **Restart dev server**: `npm run dev`
3. **Test registration**: http://localhost:3001/auth/register
4. **Create first ad**: http://localhost:3001/dashboard/ads/create
5. **Browse ads**: http://localhost:3001/explore

---

## 📞 Need Help?

### Common Issues

**Q: Signup shows "Database error"**
A: Run `FIX_USER_SIGNUP.sql`

**Q: Tables not created**
A: Check SQL Editor for errors, ensure script ran completely

**Q: Can't see data**
A: Check RLS policies, ensure user is authenticated

**Q: Trigger not working**
A: Verify trigger exists with: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`

---

**Status**: Clean and organized
**Files**: 3 essential files only
**Ready**: Yes, follow steps above!
