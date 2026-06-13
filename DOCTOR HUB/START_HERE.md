# 🚀 یہاں سے شروع کریں / START HERE

## سب سے آسان طریقہ / EASIEST WAY

**صرف یہ ایک فائل چلائیں:**
```
install-and-run.bat
```

یہ خود بخود:
1. ✅ تمام چیزیں چیک کرے گا
2. ✅ Dependencies install کرے گا
3. ✅ MongoDB شروع کرے گا
4. ✅ Backend اور Frontend دونوں چلائے گا

---

## اگر MongoDB install نہیں ہے

### Windows پر MongoDB کیسے install کریں:

1. **Download کریں:**
   - یہاں جائیں: https://www.mongodb.com/try/download/community
   - Windows Installer (.msi) download کریں

2. **Install کریں:**
   - Downloaded file پر double-click کریں
   - Installation wizard میں:
     - ✅ "Complete" installation چُنیں
     - ✅ "Install MongoDB as a Service" کو **ضرور** check کریں
     - ✅ "Install MongoDB Compass" optional ہے
   - Install button کلک کریں

3. **Verify کریں:**
   ```bash
   # Windows Services میں check کریں
   services.msc
   # "MongoDB" service وہاں ہونی چاہیے
   ```

4. **پھر دوبارہ چلائیں:**
   ```bash
   install-and-run.bat
   ```

---

## دوسرے طریقے / Alternative Methods

### طریقہ 1: Step-by-Step
```bash
# 1. System check
check-setup.bat

# 2. اگر سب OK ہے تو start کریں
start-project.bat
```

### طریقہ 2: Manual (ہر چیز اپنے ہاتھ سے)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## ✅ کامیابی کیسے چیک کریں

### 1. Backend چیک کریں
Browser میں کھولیں: http://localhost:5000/api/health

**Expected Response:**
```json
{
  "success": true,
  "message": "Doctor Hub API is running"
}
```

### 2. Frontend چیک کریں
Browser میں کھولیں: http://localhost:5173

**آپ کو login page نظر آنا چاہیے**

---

## 🔑 Login کریں

### مریض Account (Patient)
```
Email: patient@doctorhub.com
Password: patient123
```

### ڈاکٹر Account (Doctor)
```
Email: doctor@doctorhub.com
Password: doctor123
```

### Admin Account
```
Email: admin@doctorhub.com
Password: admin123
```

---

## ❌ مسائل؟ / Troubleshooting

### "MongoDB service not found"
👉 MongoDB install کریں (اوپر دیکھیں)

### "Port already in use"
```bash
# کسی اور app نے port use کر لیا ہے
# Task Manager سے node.exe processes بند کریں
# یا computer restart کریں
```

### "Connection Refused" / CORS Error
```bash
# MongoDB چل رہا ہے check کریں:
net start MongoDB

# Backend چل رہا ہے check کریں:
# http://localhost:5000/api/health browser میں کھولیں
```

### Backend Console میں Errors
```bash
# .env file check کریں:
- backend/.env موجود ہے؟
- JWT secrets set ہیں؟
- MongoDB URI صحیح ہے؟
```

### Frontend Console میں Errors (F12)
```bash
# Browser console میں دیکھیں:
- CORS errors?
- Network tab میں failed requests?
- API URL صحیح ہے? (.env file میں)
```

---

## 📚 تفصیلی ہدایات / Detailed Guides

- **اردو میں:** `README_URDU.md`
- **English:** `SETUP_INSTRUCTIONS.md`

---

## 🎯 فوری یاد دہانی / Quick Checklist

شروع کرنے سے پہلے یہ چیزیں ہونی چاہیے:

- [ ] Node.js installed
- [ ] MongoDB installed
- [ ] MongoDB service running
- [ ] Dependencies installed
- [ ] .env files exist

**سب کچھ check کرنے کے لیے:**
```bash
check-setup.bat
```

---

## 🚀 Ready to Start?

```bash
install-and-run.bat
```

**اتنا ہی! / That's it!** 🎉

پھر browser میں جائیں: **http://localhost:5173**

---

**نوٹ:** پہلی بار چلانے پر demo data automatically بنے گا (5-10 seconds)
