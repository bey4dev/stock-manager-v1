@echo off
title Stock Manager V1 - Test Production Build
color 0E

echo.
echo ========================================
echo   Stock Manager V1 - Test Production
echo ========================================
echo.

:: Check if dist folder exists
echo [1/3] Checking production build...
if not exist "dist" (
    echo ❌ Production build not found!
    echo 🔨 Please run 'build-app.bat' first to create a production build
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Production build found
)

:: Check if serve is available, install if needed
echo [2/3] Checking serve package...
npx serve --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing serve package...
    npm install -g serve
    if %errorlevel% neq 0 (
        echo ❌ Failed to install serve package!
        echo 💡 You can try: npm install -g serve
        pause
        exit /b 1
    )
) else (
    echo ✅ Serve package available
)

:: Start production server
echo [3/3] Starting production server...
echo.
echo 🎉 Starting Stock Manager V1 in production mode...
echo 📱 Application will be available at: http://localhost:3000
echo ⚠️  To stop the server, close this window or press Ctrl+C
echo.

:: Stop existing processes
taskkill /f /im node.exe >nul 2>&1

:: Start serve
npx serve dist -s -l 3000

echo.
echo 👋 Production server stopped!
pause
