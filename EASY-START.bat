@echo off
title Stock Manager V1
cls

echo.
echo Stock Manager V1 - Starting...
echo.

:: Change to script directory
cd /d "%~dp0"

:: Verify package.json exists
if not exist "package.json" (
    echo ERROR: Not in correct directory!
    echo Please run from project folder.
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if not
if not exist "node_modules" (
    echo Installing dependencies, please wait...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

:: Clean up any existing node processes
taskkill /f /im node.exe >nul 2>&1

:: Give it a moment to clean up
ping localhost -n 2 >nul

:: Start the development server
echo Starting development server...
echo.
echo Available at: http://localhost:5173
echo To stop: Press Ctrl+C or close this window
echo.

call npm run dev

echo.
echo Development server stopped.
echo.
pause
