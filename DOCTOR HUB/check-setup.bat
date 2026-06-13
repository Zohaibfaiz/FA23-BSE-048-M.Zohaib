@echo off
echo ====================================
echo Doctor Hub - System Check
echo ====================================
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is installed
    node --version
) else (
    echo [ERROR] Node.js not found! Please install from https://nodejs.org/
)
echo.

echo [2/5] Checking NPM...
npm --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] NPM is installed
    npm --version
) else (
    echo [ERROR] NPM not found!
)
echo.

echo [3/5] Checking MongoDB Service...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] MongoDB service is installed
    sc query MongoDB | findstr "STATE"
) else (
    echo [ERROR] MongoDB service not found!
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
)
echo.

echo [4/5] Checking Backend Dependencies...
if exist "backend\node_modules\" (
    echo [OK] Backend dependencies installed
) else (
    echo [WARNING] Backend dependencies not found
    echo Run: cd backend ^&^& npm install
)
echo.

echo [5/5] Checking Frontend Dependencies...
if exist "frontend\node_modules\" (
    echo [OK] Frontend dependencies installed
) else (
    echo [WARNING] Frontend dependencies not found
    echo Run: cd frontend ^&^& npm install
)
echo.

echo [6/6] Checking Environment Files...
if exist "backend\.env" (
    echo [OK] Backend .env exists
) else (
    echo [WARNING] Backend .env not found
)
if exist "frontend\.env" (
    echo [OK] Frontend .env exists
) else (
    echo [WARNING] Frontend .env not found
)
echo.

echo ====================================
echo System Check Complete
echo ====================================
echo.
echo If all checks passed, run: start-project.bat
echo For detailed instructions, see: SETUP_INSTRUCTIONS.md
echo.
pause
