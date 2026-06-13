@echo off
title Doctor Hub - Installation and Setup
color 0A

echo.
echo  ===============================================
echo   Doctor Hub - Automated Installation
echo  ===============================================
echo.

REM Check Node.js
echo [Step 1/6] Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found
node --version
echo.

REM Check MongoDB
echo [Step 2/6] Checking MongoDB...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB service not found!
    echo.
    echo Please install MongoDB:
    echo 1. Go to: https://www.mongodb.com/try/download/community
    echo 2. Download Windows MSI installer
    echo 3. Install with "Install MongoDB as a Service" option checked
    echo 4. Run this script again after installation
    echo.
    pause
    exit /b 1
)
echo [OK] MongoDB service found
net start MongoDB >nul 2>&1
echo MongoDB service started
echo.

REM Install Backend Dependencies
echo [Step 3/6] Installing Backend Dependencies...
cd backend
if not exist "node_modules\" (
    echo Installing packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Backend installation failed
        cd ..
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)
cd ..
echo.

REM Install Frontend Dependencies
echo [Step 4/6] Installing Frontend Dependencies...
cd frontend
if not exist "node_modules\" (
    echo Installing packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Frontend installation failed
        cd ..
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)
cd ..
echo.

REM Check Environment Files
echo [Step 5/6] Checking Environment Files...
if exist "backend\.env" (
    echo [OK] Backend .env exists
) else (
    echo [WARNING] Backend .env not found, copying from example
    copy "backend\.env.example" "backend\.env" >nul
)
if exist "frontend\.env" (
    echo [OK] Frontend .env exists
) else (
    echo [WARNING] Frontend .env not found, copying from example
    copy "frontend\.env.example" "frontend\.env" >nul
)
echo.

REM Start Application
echo [Step 6/6] Starting Application...
echo.
echo  ===============================================
echo   Installation Complete!
echo  ===============================================
echo.
echo   Backend will start on: http://localhost:5000
echo   Frontend will start on: http://localhost:5173
echo.
echo   Default Login Credentials:
echo   -------------------------
echo   Patient: patient@doctorhub.com / patient123
echo   Doctor:  doctor@doctorhub.com / doctor123
echo   Admin:   admin@doctorhub.com / admin123
echo.
echo  ===============================================
echo.
echo Starting servers...
echo.

timeout /t 3 >nul

start "Doctor Hub Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 >nul
start "Doctor Hub Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting...
echo Please wait 10-15 seconds for the application to be ready.
echo Then open: http://localhost:5173
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Doctor Hub Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Doctor Hub Frontend*" /F >nul 2>&1
echo Servers stopped.
echo.
pause
