@echo off
title Stock Manager V1 - Mobile Responsive Test

echo.
echo ========================================
echo    Mobile Responsive Design Test
echo ========================================
echo.

:: Check if server is already running
netstat -an | find ":5173" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Server already running on port 5173
    echo 📱 Testing mobile responsive design...
    echo.
    echo 🔍 Test Instructions:
    echo.
    echo 1. Open browser developer tools (F12)
    echo 2. Toggle device toolbar (Ctrl+Shift+M)
    echo 3. Test different device sizes:
    echo    - iPhone SE (375x667)
    echo    - iPhone 12 Pro (390x844)
    echo    - Samsung Galaxy S20 Ultra (412x915)
    echo    - iPad (768x1024)
    echo    - iPad Pro (1024x1366)
    echo.
    echo 📊 Features to test:
    echo    - Dashboard cards layout
    echo    - Navigation sidebar
    echo    - Forms and buttons
    echo    - Tables responsive behavior
    echo    - Charts scaling
    echo.
    echo 🌐 Opening application...
    start http://localhost:5173
) else (
    echo ❌ Server not running. Starting server...
    echo.
    
    :: Verify we're in the right place
    if not exist "package.json" (
        echo ERROR: package.json not found!
        echo Please run this from the project root folder.
        pause
        exit /b 1
    )
    
    :: Start server
    echo 🚀 Starting development server...
    npm run dev
)

echo.
echo 📱 Mobile responsive design test completed!
pause
