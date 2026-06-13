@echo off
echo ====================================
echo Quick Connection Test
echo ====================================
echo.

echo [1] Starting MongoDB...
net start MongoDB >nul 2>&1
timeout /t 2 >nul

echo [2] Checking Backend Health...
cd backend
start /B "BackendTest" cmd /c "npm run dev > test.log 2>&1"
cd ..
echo Waiting for backend to start...
timeout /t 8 >nul

echo [3] Testing API Connection...
curl -s http://localhost:5000/api/health > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backend is responding!
    curl http://localhost:5000/api/health
) else (
    echo [ERROR] Backend not responding
    echo Check backend/test.log for errors
)

echo.
echo [4] Stopping test backend...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo ====================================
echo Test Complete
echo ====================================
echo.
echo If backend responded successfully, run: start-project.bat
echo.
pause
