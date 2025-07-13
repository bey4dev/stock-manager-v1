@echo off
title Stock Manager V1 - Build Production
color 0B

echo.
echo ========================================
echo   Stock Manager V1 - Production Build
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: %NODE_VERSION%
)

:: Install dependencies if needed
echo [2/4] Checking dependencies...
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

:: Clean previous build
echo [3/4] Cleaning previous build...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ Previous build cleaned
) else (
    echo ✅ No previous build found
)

:: Build the application
echo [4/4] Building application for production...
echo.
npm run build

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Build completed successfully!
    echo 📁 Built files are in the 'dist' folder
    echo 📱 You can deploy the 'dist' folder to any web server
    echo.
    echo 💡 To test the build locally, you can use:
    echo    npx serve dist
    echo.
) else (
    echo.
    echo ❌ Build failed!
    echo 🔍 Please check the error messages above
    echo.
)

pause
