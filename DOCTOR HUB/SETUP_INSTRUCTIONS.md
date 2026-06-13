# Doctor Hub - Setup Instructions (Urdu/English)

## Prerequisites / ضروری چیزیں

### 1. MongoDB Installation / MongoDB انسٹالیشن

**Download aur Install karein:**
1. MongoDB Community Server download karein: https://www.mongodb.com/try/download/community
2. Windows installer (.msi) download karein
3. Install karte waqt "Install MongoDB as a Service" option ko checked rakhein
4. Installation complete hone ke baad MongoDB automatically service ke taur pe run hoga

**Verify MongoDB Installation:**
```bash
# Windows Services mein check karein
services.msc
# "MongoDB" service running honi chahiye
```

### 2. Node.js Installation / Node.js انسٹالیشن

Agar Node.js install nahi hai:
1. Download karein: https://nodejs.org/
2. LTS version install karein
3. Verify karein: `node --version`

## Project Setup / پروجیکٹ سیٹ اپ

### Step 1: Dependencies Install karein

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Variables Check karein

Backend `.env` file already configured hai:
- MongoDB: `mongodb://127.0.0.1:27017/doctor-hub`
- Port: `5000`
- JWT Secrets: Configured

Frontend `.env` file already configured hai:
- API URL: `http://localhost:5000/api`

### Step 3: Project Start karein

**Option A: Automatic (Recommended)**
```bash
# Project root directory mein
start-project.bat
```
Ye script automatically:
- MongoDB service check karega
- Backend server start karega (Port 5000)
- Frontend server start karega (Port 5173)

**Option B: Manual**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Login Credentials / لاگ ان کریڈنشلز

Project pehli baar run hone par demo data automatically create hoga:

### Admin Account
- Email: `admin@doctorhub.com`
- Password: `admin123`

### Doctor Account
- Email: `doctor@doctorhub.com`
- Password: `doctor123`

### Patient Account
- Email: `patient@doctorhub.com`
- Password: `patient123`

## Access URLs / رسائی URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Common Issues / عام مسائل

### Issue 1: MongoDB not running
**Solution:**
```bash
# Windows Services se MongoDB service start karein
services.msc
# Ya command line se:
net start MongoDB
```

### Issue 2: Port already in use
**Solution:**
```bash
# Backend port 5000 busy hai to .env mein change karein
# Frontend port 5173 busy hai to vite config check karein
```

### Issue 3: Connection Refused / CORS Error
**Solution:**
- Check karein ke backend running hai: http://localhost:5000/api/health
- Browser console mein errors check karein
- `.env` files mein URLs verify karein

### Issue 4: Login/Signup not working
**Solution:**
1. MongoDB running hai confirm karein
2. Backend console mein errors check karein
3. Browser Network tab mein API calls dekhe in
4. JWT secrets `.env` mein properly set hain check karein

## Development Tips

### Database Reset
Agar database reset karna ho:
```bash
cd backend
npm run seed
```

### View Logs
Backend logs:
- Console output dekhe in jaha `npm run dev` chala rahe hain
- `backend.log` file check karein

### Browser Developer Tools
Network tab mein API requests monitor karein:
1. F12 press karein
2. Network tab open karein
3. API calls aur responses dekhe in

## Support

Agar koi issue ho to:
1. Backend console errors dekhe in
2. Browser console errors dekhe in
3. MongoDB service running hai check karein
4. All ports (5000, 5173) available hain verify karein

---

**Note:** Pehli baar run karte waqt backend automatically demo data create karega. Is mein kuch seconds lag sakte hain.
