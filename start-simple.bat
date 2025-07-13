@echo off
title Stock Manager V1
cls

echo.
echo Starting Stock Manager V1...
echo.

:: Check if in correct directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

:: Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check NPM
echo Checking NPM...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: NPM is not available!
    echo.
    pause
    exit /b 1
)

:: Install dependencies if needed
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)

:: Kill existing Node processes
echo Stopping any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start the development server
echo.
echo Starting development server...
echo.
echo The application will open at: http://localhost:5173
echo To stop the server, close this window or press Ctrl+C
echo.

:: Start server
npm run dev

echo.
echo Server stopped.
pause
