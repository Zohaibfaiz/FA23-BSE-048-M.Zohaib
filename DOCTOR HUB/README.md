# 🏥 Doctor Hub - Healthcare Management System

A complete healthcare management system for booking appointments, managing patients, doctors, and clinics.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)

### One-Click Installation & Run
```bash
install-and-run.bat
```

This will:
- ✅ Check all system requirements
- ✅ Install all dependencies
- ✅ Start MongoDB service
- ✅ Launch backend and frontend servers
- ✅ Seed demo data

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🔑 Demo Accounts

### Patient Account
- Email: `patient@doctorhub.com`
- Password: `patient123`

### Doctor Account
- Email: `doctor@doctorhub.com`
- Password: `doctor123`

### Admin Account
- Email: `admin@doctorhub.com`
- Password: `admin123`

## 📁 Project Structure

```
doctor-hub/
├── backend/                 # Node.js + Express + MongoDB
│   ├── config/             # Database & config files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, rate limiting, etc.
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main app component
│   └── .env                # Frontend environment variables
│
├── install-and-run.bat     # ⭐ One-click installer & starter
├── start-project.bat       # Start both servers
├── check-setup.bat         # Verify system requirements
└── START_HERE.md           # Getting started guide
```

## 🛠️ Manual Setup

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Configure Environment

Backend `.env` (already configured):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doctor-hub
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=doctor_hub_access_secret_key_2024_secure_token_min_32_chars
JWT_REFRESH_SECRET=doctor_hub_refresh_secret_key_2024_secure_token_min_32_chars
```

Frontend `.env` (already configured):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB

```bash
# Windows
net start MongoDB

# Or via Services (services.msc)
```

### Step 4: Run the Application

**Option A: Using batch script**
```bash
start-project.bat
```

**Option B: Manual (separate terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🧪 Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- Admin user
- Sample doctors
- Sample patients
- Sample appointments
- Sample clinics

## 📱 Features

### For Patients
- ✅ Browse and search doctors
- ✅ Book appointments
- ✅ View medical history
- ✅ Upload payment proofs
- ✅ View prescriptions
- ✅ Manage profile

### For Doctors
- ✅ Manage appointments
- ✅ View patient history
- ✅ Write prescriptions
- ✅ Manage clinic schedules
- ✅ Profile management
- ✅ Patient records

### For Admins
- ✅ User management
- ✅ Doctor approval
- ✅ System reports
- ✅ Payment verification
- ✅ System settings
- ✅ Audit logs

### For Assistants
- ✅ Appointment queue management
- ✅ Payment verification
- ✅ Patient check-in

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Development with auto-reload
npm start        # Production mode
npm run seed     # Seed demo data
```

#### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### API Documentation

#### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token

#### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/profile` - Update doctor profile

#### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

#### And more...

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input sanitization
- Role-based access control (RBAC)
- Cookie-based token storage

## 🎨 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Email:** Nodemailer
- **File Upload:** Multer
- **Security:** Helmet, CORS, Express Rate Limit

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v7
- **State Management:** React Context
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📊 Database Schema

### Models
- User (patients, doctors, admins, assistants)
- Doctor (doctor profiles & schedules)
- Appointment (bookings)
- Clinic (clinic information)
- Payment (payment records)
- Prescription (medical prescriptions)
- MedicalHistory (patient medical records)
- Notification (in-app notifications)
- AuditLog (system audit trail)
- SystemConfig (system configuration)

## 🐛 Troubleshooting

### Issue: MongoDB not starting
```bash
# Check service status
sc query MongoDB

# Start manually
net start MongoDB
```

### Issue: Port already in use
```bash
# Kill existing Node processes
taskkill /F /IM node.exe

# Or change port in .env files
```

### Issue: CORS errors
- Verify backend is running: http://localhost:5000/api/health
- Check `.env` files for correct URLs
- Ensure `CLIENT_URL` in backend matches frontend URL

### Issue: Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

**For detailed troubleshooting, see:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 📚 Additional Documentation

- **[START_HERE.md](START_HERE.md)** - Quick start guide (English/Urdu)
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup instructions
- **[README_URDU.md](README_URDU.md)** - Complete guide in Urdu
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problem solving guide

## 🧪 Testing

### Check System Requirements
```bash
check-setup.bat
```

### Test Backend Connection
```bash
# Browser or curl
http://localhost:5000/api/health
```

### Test Frontend
```bash
# Should show login page
http://localhost:5173
```

## 📝 Environment Variables

### Backend Required Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/doctor-hub
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
```

### Frontend Required Variables
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Deploy to Vercel

This project is ready for deployment on Vercel with serverless functions.

**Quick Start:**
1. Read the deployment guide: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
2. Setup MongoDB Atlas database
3. Deploy backend and frontend separately
4. Configure environment variables

**Deployment Guides:**
- **English:** [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Urdu:** [VERCEL_DEPLOYMENT_URDU.md](VERCEL_DEPLOYMENT_URDU.md)

**Check Deployment Readiness:**
```bash
deploy-check.bat
```

### Environment Variables for Production

**Backend (Vercel):**
- `MONGODB_URI` - MongoDB Atlas connection string
- `CLIENT_URL` - Your frontend Vercel URL
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- All other variables from `.env.production`

**Frontend (Vercel):**
- `VITE_API_URL` - Your backend Vercel URL + `/api`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review error messages in browser console (F12)
3. Check backend logs in terminal
4. Verify all services are running

## 🎯 Quick Commands Reference

```bash
# Full setup & run
install-and-run.bat

# Quick start (after initial setup)
start-project.bat

# System check
check-setup.bat

# Seed data
cd backend && npm run seed

# Start MongoDB
net start MongoDB

# Stop all Node processes
taskkill /F /IM node.exe
```

---

**Made with ❤️ by Doctor Hub Team**
