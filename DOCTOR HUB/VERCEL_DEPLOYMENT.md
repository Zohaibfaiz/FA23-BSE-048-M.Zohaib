# 🚀 Vercel Deployment Guide / Vercel پر Deploy کرنے کی رہنمائی

## 📋 Prerequisites / ضروری چیزیں

1. **Vercel Account** - [Sign up](https://vercel.com/signup)
2. **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
3. **GitHub Account** (Optional but recommended)
4. **Project pushed to GitHub** (Optional)

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Database

1. **Go to:** https://cloud.mongodb.com/
2. **Sign up/Login**
3. **Create a New Project:**
   - Click "New Project"
   - Name: "Doctor Hub"
   - Click "Create Project"

4. **Create a Cluster:**
   - Click "Build a Database"
   - Select **FREE** tier (M0 Sandbox)
   - Choose your preferred region
   - Cluster Name: "DoctorHubCluster"
   - Click "Create"

5. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `doctorhub_user`
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

6. **Setup Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
   - Click "Confirm"

7. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: **Node.js**
   - Copy the connection string:
   ```
   mongodb+srv://doctorhub_user:<password>@doctorhubcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name at the end: `/doctor-hub`
   
   **Final connection string:**
   ```
   mongodb+srv://doctorhub_user:YOUR_PASSWORD@doctorhubcluster.xxxxx.mongodb.net/doctor-hub?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Deploy Backend to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "Add New..." → "Project"
3. **Import Repository:**
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

4. **Configure Backend Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://doctorhub_user:YOUR_PASSWORD@doctorhubcluster.xxxxx.mongodb.net/doctor-hub?retryWrites=true&w=majority
   CLIENT_URL=https://your-frontend-app.vercel.app
   JWT_ACCESS_SECRET=doctor_hub_access_secret_key_2024_secure_token_min_32_chars
   JWT_REFRESH_SECRET=doctor_hub_refresh_secret_key_2024_secure_token_min_32_chars
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=Doctor Hub <noreply@doctorhub.com>
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL: `https://your-backend-app.vercel.app`

7. **Test Backend:**
   Open in browser:
   ```
   https://your-backend-app.vercel.app/api/health
   ```
   Should return: `{"success": true, "message": "Doctor Hub API is running"}`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? doctor-hub-backend
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variables
vercel env add MONGODB_URI
vercel env add CLIENT_URL
vercel env add JWT_ACCESS_SECRET
vercel env add JWT_REFRESH_SECRET
# ... add all other variables

# Deploy to production
vercel --prod
```

---

## 🎨 Step 3: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "Add New..." → "Project"
3. **Import Repository:**
   - Select same repository
   - Click "Import"

4. **Configure Frontend Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-app.vercel.app/api
   ```
   ⚠️ Replace `your-backend-app` with your actual backend URL

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL: `https://your-frontend-app.vercel.app`

7. **Update Backend Environment:**
   - Go to backend project settings
   - Update `CLIENT_URL` to your frontend URL
   - Redeploy backend

### Option B: Deploy via Vercel CLI

```bash
# Deploy frontend
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? doctor-hub-frontend
# - In which directory is your code located? ./
# - Want to override settings? Yes
# - Build Command? npm run build
# - Output Directory? dist
# - Development Command? npm run dev

# Add environment variable
vercel env add VITE_API_URL

# Deploy to production
vercel --prod
```

---

## 🔄 Step 4: Update CORS Settings

After both deployments, update backend CORS:

1. **Go to backend project settings on Vercel**
2. **Update `CLIENT_URL` environment variable:**
   ```
   CLIENT_URL=https://your-actual-frontend-url.vercel.app
   ```
3. **Redeploy backend**

---

## 🧪 Step 5: Test Deployment

### Backend Testing:
```bash
# Health check
curl https://your-backend-app.vercel.app/api/health

# Should return:
# {"success": true, "message": "Doctor Hub API is running"}
```

### Frontend Testing:
1. Open: `https://your-frontend-app.vercel.app`
2. Should see login page
3. Try logging in with demo credentials:
   ```
   Email: patient@doctorhub.com
   Password: patient123
   ```

### Database Testing:
1. Login to MongoDB Atlas
2. Go to "Collections"
3. Check if `doctor-hub` database exists
4. Verify collections are created

---

## 🎯 Step 6: Seed Demo Data (Optional)

You need to run seed script locally pointing to Atlas database:

1. **Update local backend/.env temporarily:**
   ```env
   MONGODB_URI=mongodb+srv://doctorhub_user:YOUR_PASSWORD@doctorhubcluster.xxxxx.mongodb.net/doctor-hub?retryWrites=true&w=majority
   ```

2. **Run seed script:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Verify on Atlas:**
   - Check MongoDB Atlas Collections
   - Should see users, doctors, patients, etc.

---

## ⚙️ Configuration Files Created

### Root Level:
- `vercel.json` - Main Vercel configuration

### Backend:
- `backend/vercel.json` - Backend-specific config
- `backend/.env.production` - Production env template
- Updated `backend/server.js` - Added Vercel export

### Frontend:
- `frontend/vercel.json` - Frontend routing config
- `frontend/.env.production` - Production env template

---

## 📝 Environment Variables Summary

### Backend (.env):
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://your-frontend.vercel.app
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=...
```

### Frontend (.env):
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## 🔒 Security Checklist

- [ ] Strong MongoDB password
- [ ] JWT secrets are 32+ characters
- [ ] MongoDB Network Access configured
- [ ] CORS properly set with actual frontend URL
- [ ] Environment variables set correctly
- [ ] `.env` files NOT committed to git
- [ ] Production environment variables different from development

---

## ❌ Common Issues & Solutions

### Issue 1: "Cannot connect to MongoDB"
**Solution:**
- Check MongoDB Atlas cluster is running
- Verify connection string is correct
- Check Network Access allows 0.0.0.0/0
- Verify database user credentials

### Issue 2: "CORS Error"
**Solution:**
- Update `CLIENT_URL` in backend env variables
- Should match exact frontend URL
- Redeploy backend after changing

### Issue 3: "502 Bad Gateway"
**Solution:**
- Check Vercel function logs
- Backend might be timing out
- Verify MongoDB connection
- Check environment variables are set

### Issue 4: "Module not found"
**Solution:**
- Ensure all dependencies in package.json
- Check `type: "module"` in package.json
- Verify import statements use `.js` extensions

### Issue 5: "API calls failing"
**Solution:**
- Check `VITE_API_URL` in frontend
- Verify backend is deployed and running
- Check Network tab in browser DevTools
- Verify backend URL is correct

---

## 📊 Deployment Checklist

### Pre-Deployment:
- [ ] MongoDB Atlas database created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string obtained
- [ ] Code pushed to GitHub (optional)

### Backend Deployment:
- [ ] Backend deployed to Vercel
- [ ] All environment variables set
- [ ] Health endpoint working
- [ ] MongoDB connection successful

### Frontend Deployment:
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL set correctly
- [ ] Build successful
- [ ] Static files serving

### Post-Deployment:
- [ ] Backend CLIENT_URL updated with frontend URL
- [ ] Frontend can reach backend API
- [ ] Login working
- [ ] Demo data seeded (optional)
- [ ] All features tested

---

## 🔄 Continuous Deployment

### Automatic Deployments:
Vercel automatically deploys when you push to GitHub:

1. **Push to `main` branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Preview deployment with unique URL

### Manual Deployments:
```bash
# Deploy latest code
vercel --prod

# Or specific directory
cd backend && vercel --prod
cd frontend && vercel --prod
```

---

## 📱 Custom Domain (Optional)

1. **Go to:** Project Settings → Domains
2. **Add your domain**
3. **Configure DNS:**
   - Type: CNAME
   - Name: @ (or subdomain)
   - Value: cname.vercel-dns.com
4. **Wait for DNS propagation** (can take 24-48 hours)

---

## 🛠️ Vercel CLI Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List projects
vercel list

# View logs
vercel logs <deployment-url>

# Remove project
vercel remove <project-name>

# Environment variables
vercel env ls                    # List all
vercel env add <NAME>            # Add new
vercel env rm <NAME>             # Remove
vercel env pull                  # Pull to local .env
```

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Test changes in preview before production
2. **Monitor Function Logs:** Check Vercel dashboard for errors
3. **Set up Alerts:** Configure Vercel to notify on deployment failures
4. **Use Edge Functions:** For better global performance
5. **Optimize Build:** Keep dependencies minimal
6. **Cache MongoDB Connection:** Reuse connection across requests
7. **Use Environment Variables:** Never hardcode secrets

---

## 📚 Useful Links

- **Vercel Documentation:** https://vercel.com/docs
- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Vercel CLI:** https://vercel.com/docs/cli
- **Node.js on Vercel:** https://vercel.com/docs/runtimes#official-runtimes/node-js

---

## 🎉 Success!

Agar sab kuch sahi se configure ho gaya hai, to:

✅ Backend URL: `https://your-backend.vercel.app/api/health`
✅ Frontend URL: `https://your-frontend.vercel.app`
✅ Login working
✅ API calls successful
✅ Database connected

**Congratulations! Your Doctor Hub is now live! 🚀**

---

## 📞 Need Help?

- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas Support:** https://support.mongodb.com/
- **Check Vercel Logs:** Project → Deployments → Click deployment → Logs

---

**Note:** Vercel free tier has limitations:
- Function execution: 10 seconds max
- Bandwidth: 100GB/month
- Builds: 6000 minutes/month

For production use, consider upgrading to Pro plan.
