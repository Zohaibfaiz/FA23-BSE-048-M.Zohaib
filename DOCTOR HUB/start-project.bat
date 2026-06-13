@echo off
echo ====================================
echo Starting Doctor Hub Application
echo ====================================
echo.

echo Checking MongoDB status...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MongoDB service not found!
    echo Please install MongoDB first.
    echo Download from: https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo MongoDB service started successfully
) else (
    echo MongoDB is already running or couldn't start
)

echo.
echo Starting Backend Server...
start "Doctor Hub Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo Starting Frontend Server...
start "Doctor Hub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Both servers are starting...
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo ====================================
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Doctor Hub Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Doctor Hub Frontend*" /F >nul 2>&1
echo Servers stopped.
