@echo off
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
    echo [ERROR] Node.js not found!
    echo [INFO] Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
)

:: Check if NPM is available
echo [2/5] Checking NPM installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found!
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
    echo [OK] NPM found: v%NPM_VERSION%
)

:: Stop existing Node.js processes
echo [3/5] Stopping existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Existing processes stopped
) else (
    echo [OK] No existing processes found
)

:: Check and install dependencies
echo [4/5] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies already installed
)

:: Start the application
echo [5/5] Starting Stock Manager V1...
echo.
echo [SUCCESS] All checks passed!
echo [INFO] Application will start at: http://localhost:5173 (or next available port)
echo [WARNING] To stop the server, close this window or press Ctrl+C
echo.
echo [INFO] Starting development server...
echo.

:: Start npm dev server
call npm run dev

echo.
echo [INFO] Thanks for using Stock Manager V1!
pause
