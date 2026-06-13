# Doctor Hub - فوری شروعات گائیڈ

## 🚀 تیز رفتار شروعات

### 1️⃣ سسٹم چیک کریں
```bash
check-setup.bat
```
یہ چیک کرے گا:
- ✅ Node.js انسٹال ہے؟
- ✅ MongoDB انسٹال ہے؟
- ✅ Dependencies انسٹال ہیں؟

### 2️⃣ پروجیکٹ چالو کریں
```bash
start-project.bat
```
یہ خود بخود:
- 🗄️ MongoDB شروع کرے گا
- 🔧 Backend شروع کرے گا (Port 5000)
- 💻 Frontend شروع کرے گا (Port 5173)

### 3️⃣ براؤزر میں کھولیں
```
http://localhost:5173
```

## 🔑 لاگ ان کریڈنشلز

### مریض (Patient)
- **ای میل:** patient@doctorhub.com
- **پاس ورڈ:** patient123

### ڈاکٹر (Doctor)
- **ای میل:** doctor@doctorhub.com
- **پاس ورڈ:** doctor123

### ایڈمن (Admin)
- **ای میل:** admin@doctorhub.com
- **پاس ورڈ:** admin123

## ❌ مسائل حل کریں

### مسئلہ: "MongoDB service not found"
**حل:**
1. MongoDB ڈاؤن لوڈ کریں: https://www.mongodb.com/try/download/community
2. Windows installer (.msi) چلائیں
3. "Install MongoDB as a Service" کو چیک رکھیں
4. انسٹال مکمل ہونے تک انتظار کریں

### مسئلہ: "Connection Refused" یا API کام نہیں کر رہا
**حل:**
```bash
# 1. MongoDB چیک کریں
services.msc
# "MongoDB" service چل رہی ہونی چاہیے

# 2. Backend صحیح چل رہا ہے؟
# Browser میں کھولیں: http://localhost:5000/api/health
# Response: {"success": true, "message": "Doctor Hub API is running"}

# 3. Frontend صحیح چل رہا ہے؟
# Browser میں کھولیں: http://localhost:5173
```

### مسئلہ: Port already in use
**حل:**
```bash
# Backend port بدلیں
# backend/.env میں:
PORT=5001

# Frontend .env میں:
VITE_API_URL=http://localhost:5001/api
```

### مسئلہ: Login/Signup کام نہیں کر رہا
**حل:**
1. ✅ MongoDB چل رہا ہے چیک کریں
2. ✅ Backend console میں کوئی error تو نہیں
3. ✅ Browser console (F12) میں errors دیکھیں
4. ✅ Network tab میں API requests دیکھیں

## 📁 پروجیکٹ سٹرکچر

```
doctor-hub/
├── backend/              # Node.js + Express API
│   ├── .env             # Backend environment variables
│   ├── server.js        # Main server file
│   └── ...
├── frontend/            # React + Vite
│   ├── .env             # Frontend environment variables
│   └── ...
├── start-project.bat    # ✨ سب کچھ شروع کرنے کے لیے
├── check-setup.bat      # ✨ سسٹم چیک کرنے کے لیے
└── SETUP_INSTRUCTIONS.md # تفصیلی ہدایات
```

## 🛠️ ڈیولپمنٹ ٹولز

### Database Reset
```bash
cd backend
npm run seed
```

### Backend Console Logs دیکھیں
Backend terminal window میں دیکھیں یا `backend.log` file

### Browser Developer Tools
```
F12 دبائیں
→ Network tab
→ API requests دیکھیں
```

## 📞 مدد چاہیے؟

اگر پھر بھی مسئلہ ہو:

1. **MongoDB چیک کریں:**
   - Windows Services میں "MongoDB" service running ہونی چاہیے
   - Command: `net start MongoDB`

2. **Backend چیک کریں:**
   - Terminal میں کوئی error message؟
   - URL test کریں: http://localhost:5000/api/health

3. **Frontend چیک کریں:**
   - Browser console (F12) میں errors؟
   - Network tab میں failed requests؟

4. **Environment Variables:**
   - `backend/.env` موجود ہے؟
   - `frontend/.env` موجود ہے؟

## ✅ سب صحیح چل رہا ہے؟

اگر:
- ✅ MongoDB service چل رہی ہے
- ✅ Backend: http://localhost:5000/api/health کام کر رہا ہے
- ✅ Frontend: http://localhost:5173 کھل رہا ہے
- ✅ Login کام کر رہا ہے

**تو آپ تیار ہیں! 🎉**

---

**نوٹ:** پہلی بار چلانے پر demo data automatically create ہوگا (5-10 سیکنڈز)
