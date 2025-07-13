@echo off
chcp 65001 >nul
title Stock Manager V1 - Windows Startup
color 0A

echo.
echo ========================================
echo   Stock Manager V1 - Startup Script
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js not found!
    echo ^ Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo + Node.js found: %NODE_VERSION%
)

:: Check if NPM is available
echo [2/5] Checking NPM installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X NPM not found!
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
    echo + NPM found: v%NPM_VERSION%
)

:: Stop existing Node.js processes
echo [3/5] Stopping existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Existing processes stopped
) else (
    echo ✅ No existing processes found
)

:: Check and install dependencies
echo [4/5] Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully!
) else (
    echo ✅ Dependencies already installed
)

:: Start the application
echo [5/5] Starting Stock Manager V1...
echo.
echo 🎉 All checks passed!
echo 📱 Application will start at: http://localhost:5173 (or next available port)
echo ⚠️  To stop the server, close this window or press Ctrl+C
echo.
echo 🌐 Starting development server...
echo.

:: Start npm dev server
npm run dev

echo.
echo 👋 Thanks for using Stock Manager V1!
pause
