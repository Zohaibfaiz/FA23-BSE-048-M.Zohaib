@echo off
echo ====================================
echo Doctor Hub - Connection Test
echo ====================================
echo.

echo Starting MongoDB...
net start MongoDB >nul 2>&1
timeout /t 2 >nul

echo Testing MongoDB connection...
echo const { MongoClient } = require('mongodb'); const client = new MongoClient('mongodb://127.0.0.1:27017'); client.connect().then(() => { console.log('MongoDB: CONNECTED'); client.close(); process.exit(0); }).catch((e) => { console.log('MongoDB: ERROR -', e.message); process.exit(1); }); > test-mongo.js

node test-mongo.js
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB connection successful
) else (
    echo [ERROR] MongoDB connection failed
    echo Make sure MongoDB service is running
)
del test-mongo.js >nul 2>&1

echo.
echo ====================================
echo Test Complete
echo ====================================
echo.
echo If MongoDB is connected, you can run: start-project.bat
echo.
pause
