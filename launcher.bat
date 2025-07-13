@echo off
title Stock Manager V1 - Main Launcher
color 0F

:menu
cls
echo.
echo ========================================
echo         Stock Manager V1 Launcher
echo ========================================
echo.
echo Please choose an option:
echo.
echo [1] 🚀 Start Development Server
echo [2] 🔨 Build for Production
echo [3] 🌐 Test Production Build
echo [4] � Backup Application
echo [5] �🔄 Reset Application
echo [6] 📋 Show System Info
echo [7] ❌ Exit
echo.
set /p choice="Enter your choice (1-7): "

echo.

if "%choice%"=="1" (
    echo Starting development server...
    call start-app.bat
    goto menu
) else if "%choice%"=="2" (
    echo Building for production...
    call build-app.bat
    goto menu
) else if "%choice%"=="3" (
    echo Testing production build...
    call test-production.bat
    goto menu
) else if "%choice%"=="4" (
    echo Creating backup...
    call backup-app.bat
    goto menu
) else if "%choice%"=="5" (
    echo Resetting application...
    call reset-app.bat
    goto menu
) else if "%choice%"=="6" (
    echo.
    echo ========================================
    echo           System Information
    echo ========================================
    echo.
    echo 📁 Current Directory: %CD%
    echo 🖥️  OS Version: %OS%
    echo 👤 User: %USERNAME%
    echo 💻 Computer: %COMPUTERNAME%
    echo.
    
    echo 🔍 Checking Node.js...
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
    ) else (
        echo ❌ Node.js: Not installed
    )
    
    echo 🔍 Checking NPM...
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('npm --version') do echo ✅ NPM: v%%i
    ) else (
        echo ❌ NPM: Not installed
    )
    
    echo 🔍 Checking dependencies...
    if exist "node_modules" (
        echo ✅ Dependencies: Installed
    ) else (
        echo ❌ Dependencies: Not installed
    )
    
    echo 🔍 Checking build...
    if exist "dist" (
        echo ✅ Production build: Available
    ) else (
        echo ❌ Production build: Not available
    )
    
    echo.
    pause
    goto menu
) else if "%choice%"=="7" (
    echo.
    echo 👋 Thank you for using Stock Manager V1!
    echo.
    pause
    exit /b 0
) else (
    echo.
    echo ❌ Invalid choice. Please try again.
    echo.
    pause
    goto menu
)

:end
