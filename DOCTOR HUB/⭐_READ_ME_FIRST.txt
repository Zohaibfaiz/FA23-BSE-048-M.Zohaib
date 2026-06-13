╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║             🏥 DOCTOR HUB - QUICK START GUIDE 🏥              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📌 IMPORTANT: پہلے یہ پڑھیں / READ THIS FIRST!

╔════════════════════════════════════════════════════════════════╗
║  STEP 1: MongoDB Install کریں (اگر نہیں ہے)                   ║
╚════════════════════════════════════════════════════════════════╝

1. Download: https://www.mongodb.com/try/download/community
2. Windows MSI installer چلائیں
3. "Install MongoDB as a Service" ✅ CHECK KAREIN!
4. Install مکمل کریں

╔════════════════════════════════════════════════════════════════╗
║  STEP 2: Project چالو کریں (صرف ایک file!)                    ║
╚════════════════════════════════════════════════════════════════╝

📂 File: install-and-run.bat
👆 اس file پر double-click کریں!

یہ خود بخود:
✅ تمام چیزیں check کرے گا
✅ Dependencies install کرے گا
✅ MongoDB start کرے گا
✅ Backend اور Frontend دونوں چلائے گا
✅ Demo data بنائے گا

╔════════════════════════════════════════════════════════════════╗
║  STEP 3: Browser میں کھولیں                                   ║
╚════════════════════════════════════════════════════════════════╝

🌐 http://localhost:5173

╔════════════════════════════════════════════════════════════════╗
║  🔑 LOGIN CREDENTIALS                                          ║
╚════════════════════════════════════════════════════════════════╝

مریض (Patient):
  Email:    patient@doctorhub.com
  Password: patient123

ڈاکٹر (Doctor):
  Email:    doctor@doctorhub.com
  Password: doctor123

Admin:
  Email:    admin@doctorhub.com
  Password: admin123

╔════════════════════════════════════════════════════════════════╗
║  📚 HELPFUL FILES / مددگار فائلیں                             ║
╚════════════════════════════════════════════════════════════════╝

📄 START_HERE.md
   → تفصیلی شروعات گائیڈ (Urdu/English)

📄 README_URDU.md
   → مکمل گائیڈ اردو میں

📄 SETUP_INSTRUCTIONS.md
   → Complete setup guide in English

📄 TROUBLESHOOTING.md
   → مسائل حل کرنے کی رہنمائی

📄 README.md
   → Full technical documentation

╔════════════════════════════════════════════════════════════════╗
║  🛠️ HELPFUL SCRIPTS / مددگار Scripts                          ║
╚════════════════════════════════════════════════════════════════╝

🔧 install-and-run.bat
   → ⭐ BEST: سب کچھ install اور run کرے گا

🔧 start-project.bat
   → Backend اور Frontend start کرے گا

🔧 check-setup.bat
   → System requirements check کرے گا

╔════════════════════════════════════════════════════════════════╗
║  ❌ اگر مسائل آئیں / IF YOU HAVE PROBLEMS                     ║
╚════════════════════════════════════════════════════════════════╝

1️⃣ check-setup.bat چلائیں
   → یہ بتائے گا کہ کیا missing ہے

2️⃣ TROUBLESHOOTING.md کھولیں
   → تمام common problems کے solutions

3️⃣ MongoDB چیک کریں:
   services.msc → "MongoDB" service چلنی چاہیے

4️⃣ Backend check کریں:
   http://localhost:5000/api/health
   → Should show: {"success": true, "message": ...}

╔════════════════════════════════════════════════════════════════╗
║  ✅ SUCCESS INDICATORS / کامیابی کی علامات                    ║
╚════════════════════════════════════════════════════════════════╝

✅ MongoDB service چل رہی ہے
✅ Backend console میں "Doctor Hub API running on port 5000"
✅ Frontend console میں "Local: http://localhost:5173"
✅ Browser میں login page نظر آ رہا ہے
✅ Login کام کر رہا ہے

╔════════════════════════════════════════════════════════════════╗
║  📞 QUICK REFERENCE / فوری حوالہ                              ║
╚════════════════════════════════════════════════════════════════╝

Frontend URL:     http://localhost:5173
Backend API:      http://localhost:5000/api
Health Check:     http://localhost:5000/api/health

Start MongoDB:    net start MongoDB
Stop All Servers: taskkill /F /IM node.exe

╔════════════════════════════════════════════════════════════════╗
║                      🎯 READY TO START!                        ║
║                                                                ║
║              Double-click: install-and-run.bat                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

💡 TIP: پہلی بار چلانے میں 10-15 سیکنڈز لگ سکتے ہیں
         جب تک demo data create ہو۔

🎉 Happy Coding! / خوش رہیں!
