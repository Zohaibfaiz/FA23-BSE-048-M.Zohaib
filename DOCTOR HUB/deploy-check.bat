@echo off
title Vercel Deployment Readiness Check
color 0E

echo.
echo ═══════════════════════════════════════════════════
echo   Vercel Deployment Readiness Check
echo ═══════════════════════════════════════════════════
echo.

echo [CHECK 1] Vercel Configuration Files...
echo.

if exist "vercel.json" (
    echo ✅ vercel.json exists
) else (
    echo ❌ vercel.json missing
)

if exist "backend\vercel.json" (
    echo ✅ backend/vercel.json exists
) else (
    echo ❌ backend/vercel.json missing
)

if exist "frontend\vercel.json" (
    echo ✅ frontend/vercel.json exists
) else (
    echo ❌ frontend/vercel.json missing
)

echo.
echo [CHECK 2] Production Environment Templates...
echo.

if exist "backend\.env.production" (
    echo ✅ backend/.env.production exists
) else (
    echo ❌ backend/.env.production missing
)

if exist "frontend\.env.production" (
    echo ✅ frontend/.env.production exists
) else (
    echo ❌ frontend/.env.production missing
)

echo.
echo [CHECK 3] Backend Configuration...
echo.

findstr /C:"export default app" backend\server.js >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend exports app for Vercel
) else (
    echo ❌ Backend missing 'export default app'
)

echo.
echo [CHECK 4] Frontend Build Script...
echo.

findstr /C:"vercel-build" frontend\package.json >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend has vercel-build script
) else (
    echo ⚠️  Frontend may need vercel-build script
)

echo.
echo [CHECK 5] Git Repository...
echo.

if exist ".git" (
    echo ✅ Git repository initialized
    git remote -v >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Git remote configured
    ) else (
        echo ⚠️  No git remote - may need GitHub setup
    )
) else (
    echo ⚠️  Not a git repository
    echo    Run: git init
)

echo.
echo [CHECK 6] Dependencies...
echo.

if exist "backend\node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ⚠️  Backend dependencies not installed
    echo    Run: cd backend ^&^& npm install
)

if exist "frontend\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  Frontend dependencies not installed
    echo    Run: cd frontend ^&^& npm install
)

echo.
echo ═══════════════════════════════════════════════════
echo   Next Steps for Vercel Deployment
echo ═══════════════════════════════════════════════════
echo.
echo 1. Setup MongoDB Atlas (if not done)
echo    → https://cloud.mongodb.com/
echo.
echo 2. Push code to GitHub (if not done)
echo    → git add .
echo    → git commit -m "Ready for deployment"
echo    → git push
echo.
echo 3. Read deployment guide:
echo    → VERCEL_DEPLOYMENT_URDU.md (Urdu)
echo    → VERCEL_DEPLOYMENT.md (English)
echo.
echo 4. Deploy on Vercel:
echo    → https://vercel.com/dashboard
echo    → Import your GitHub repository
echo    → Configure as per guide
echo.
echo ═══════════════════════════════════════════════════
echo.
pause
