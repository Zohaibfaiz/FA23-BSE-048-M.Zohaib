# 🔧 Troubleshooting Guide / مسائل حل کرنے کی رہنمائی

## مسائل کی تشخیص / Diagnosis

### مرحلہ 1: System Check چلائیں
```bash
check-setup.bat
```
یہ آپ کو بتائے گا کہ کیا missing ہے۔

---

## عام مسائل اور حل / Common Issues and Solutions

### ❌ Issue 1: "MongoDB service not found"

**علامات / Symptoms:**
- Script error دیتا ہے
- Backend start نہیں ہوتا
- Database connection fail ہوتا ہے

**حل / Solution:**

**A. MongoDB Install کریں:**
1. Download: https://www.mongodb.com/try/download/community
2. Windows MSI installer download کریں
3. Install کرتے وقت:
   - ✅ "Complete" installation
   - ✅ "Install MongoDB as a Service" (بہت ضروری!)
   - ✅ Default port 27017 رکھیں

**B. Service شروع کریں:**
```bash
# Method 1: Command Line
net start MongoDB

# Method 2: Services Manager
services.msc
# "MongoDB" service تلاش کریں
# Right-click → Start
```

**C. Verify کریں:**
```bash
# Service status check کریں
sc query MongoDB

# Expected output:
# STATE: 4 RUNNING
```

---

### ❌ Issue 2: "Port already in use" / Port 5000 or 5173 busy

**علامات / Symptoms:**
- "EADDRINUSE" error
- "Port 5000 is already in use"
- Server start نہیں ہوتا

**حل / Solution:**

**A. Port استعمال کرنے والے process کو بند کریں:**
```bash
# Port 5000 استعمال کرنے والے process تلاش کریں
netstat -ano | findstr :5000

# Process ID (PID) نوٹ کریں، پھر بند کریں:
taskkill /PID <PID> /F

# یا تمام node processes بند کریں:
taskkill /F /IM node.exe
```

**B. Port بدل دیں:**

Backend port بدلنے کے لیے (`backend/.env`):
```env
PORT=5001
```

Frontend configuration بھی update کریں (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5001/api
```

---

### ❌ Issue 3: "Connection Refused" / CORS Error

**علامات / Symptoms:**
- Browser console: "Failed to fetch"
- "CORS policy blocked"
- "ERR_CONNECTION_REFUSED"
- Login/Signup کام نہیں کرتا

**حل / Solution:**

**A. Backend running ہے check کریں:**
```bash
# Browser میں کھولیں:
http://localhost:5000/api/health

# Expected Response:
{
  "success": true,
  "message": "Doctor Hub API is running"
}
```

**B. Environment variables verify کریں:**

`backend/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/doctor-hub
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**C. MongoDB connection check کریں:**
```bash
# Backend console میں یہ message ہونا چاہیے:
# "MongoDB connected: 127.0.0.1"
```

**D. Firewall check کریں:**
```bash
# Windows Firewall disable کر کے test کریں
# Control Panel → Windows Defender Firewall → Turn off
# (صرف testing کے لیے، بعد میں واپس on کریں)
```

---

### ❌ Issue 4: Login/Signup Not Working

**علامات / Symptoms:**
- Form submit ہوتا ہے لیکن کچھ نہیں ہوتا
- "Invalid credentials" error
- Page reload ہو جاتا ہے

**حل / Solution:**

**A. Browser Developer Tools دیکھیں (F12):**

1. **Console Tab:**
```
- Koi JavaScript errors?
- CORS errors?
- API errors?
```

2. **Network Tab:**
```
- Login/register API call جا رہا ہے?
- Status code کیا ہے?
  - 200: Success
  - 400: Bad request (invalid data)
  - 401: Unauthorized
  - 500: Server error
- Response دیکھیں
```

**B. Backend logs check کریں:**
```bash
# Backend terminal میں دیکھیں
# یا backend.log file پڑھیں

# Common errors:
# - JWT secret missing
# - MongoDB connection failed
# - Validation errors
```

**C. JWT Secrets verify کریں:**

`backend/.env` میں یہ ہونے چاہیے:
```env
JWT_ACCESS_SECRET=doctor_hub_access_secret_key_2024_secure_token_min_32_chars
JWT_REFRESH_SECRET=doctor_hub_refresh_secret_key_2024_secure_token_min_32_chars
```

**D. Database check کریں:**
```bash
# Seed data create کریں
cd backend
npm run seed
```

---

### ❌ Issue 5: Dependencies Not Installing

**علامات / Symptoms:**
- `npm install` fail ہوتا ہے
- "Permission denied" errors
- "EACCES" errors

**حل / Solution:**

**A. Administrator mode میں چلائیں:**
```bash
# CMD/PowerShell کو "Run as Administrator" کریں
```

**B. npm cache صاف کریں:**
```bash
npm cache clean --force
```

**C. node_modules delete کر کے دوبارہ install کریں:**
```bash
# Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

**D. Node.js update کریں:**
```bash
# https://nodejs.org/ سے latest LTS version install کریں
```

---

### ❌ Issue 6: Frontend Shows Blank Page

**علامات / Symptoms:**
- White/blank screen
- No errors in terminal
- Port 5173 accessible ہے

**حل / Solution:**

**A. Browser Console چیک کریں (F12):**
```
- JavaScript errors دیکھیں
- Failed imports?
- Module errors?
```

**B. Browser cache clear کریں:**
```
Ctrl + Shift + Delete
→ Cached images and files
→ Clear data
```

**C. Hard reload کریں:**
```
Ctrl + Shift + R
یا
Ctrl + F5
```

**D. Development server restart کریں:**
```bash
# Frontend terminal میں:
Ctrl + C (stop)
npm run dev (restart)
```

---

### ❌ Issue 7: MongoDB Connection Timeout

**علامات / Symptoms:**
- "MongoServerError: connect ETIMEDOUT"
- "Failed to connect to MongoDB"
- Backend hangs کرتا ہے

**حل / Solution:**

**A. MongoDB service status check کریں:**
```bash
sc query MongoDB
```

**B. MongoDB manually start کریں:**
```bash
net start MongoDB
```

**C. MongoDB connection string verify کریں:**

`backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/doctor-hub
```

**D. MongoDB port check کریں:**
```bash
# Port 27017 available ہے?
netstat -ano | findstr :27017
```

**E. MongoDB reinstall کریں (last resort):**
1. Services سے MongoDB stop کریں
2. MongoDB uninstall کریں
3. `C:\Program Files\MongoDB` folder delete کریں
4. Fresh install کریں

---

## 🔍 Diagnostic Commands / تشخیصی کمانڈز

### System Information
```bash
# Node.js version
node --version

# npm version
npm --version

# Check running ports
netstat -ano | findstr "5000 5173 27017"

# MongoDB service status
sc query MongoDB
```

### Logs دیکھنا
```bash
# Backend logs
type backend\backend.log

# Backend error logs
type backend\backend.err.log
```

### Process Management
```bash
# تمام Node processes دیکھیں
tasklist | findstr node.exe

# تمام Node processes بند کریں
taskkill /F /IM node.exe

# MongoDB service restart کریں
net stop MongoDB
net start MongoDB
```

---

## 📞 مدد حاصل کریں / Get Help

اگر پھر بھی مسئلہ حل نہ ہو:

### Step 1: Complete System Check
```bash
check-setup.bat
```

### Step 2: Information جمع کریں
```
1. Windows version?
2. Node.js version? (node --version)
3. MongoDB installed? (sc query MongoDB)
4. Error messages (screenshot)
5. Browser console errors (F12)
6. Backend terminal output
```

### Step 3: Clean Restart
```bash
# 1. سب کچھ بند کریں
taskkill /F /IM node.exe

# 2. MongoDB restart کریں
net stop MongoDB
net start MongoDB

# 3. Fresh start
install-and-run.bat
```

---

## ✅ Success Checklist / کامیابی کی فہرست

یہ سب کچھ working ہونا چاہیے:

- [ ] Node.js installed اور working
- [ ] MongoDB service running
- [ ] Backend health check working: http://localhost:5000/api/health
- [ ] Frontend loading: http://localhost:5173
- [ ] Login page visible
- [ ] Can login with demo credentials
- [ ] No console errors (F12)
- [ ] No CORS errors
- [ ] API requests successful (Network tab)

---

**نوٹ:** اگر کوئی specific error message ہے جو یہاں listed نہیں، اسے backend console یا browser console سے copy کر کے search کریں۔
