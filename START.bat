@echo off
title Stock Manager V1

echo.
echo ========================================
echo      Stock Manager V1 - Launcher
echo ========================================
echo.

:: Verify we're in the right place
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this from the project root folder.
    pause
    exit /b 1
)

:: Quick Node.js check
echo Checking Node.js...
node -v >nul 2>&1 || (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js found

:: Quick NPM check  
echo Checking NPM...
npm -v >nul 2>&1 || (
    echo ERROR: NPM not found!
    pause
    exit /b 1
)
echo OK: NPM found

:: Install deps if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install || (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo OK: Dependencies installed
) else (
    echo OK: Dependencies ready
)

:: Clean existing processes
echo Cleaning up processes...
taskkill /f /im node.exe >nul 2>&1

:: Start server
echo.
echo Starting Stock Manager V1...
echo Server: http://localhost:5173
echo Press Ctrl+C to stop
echo.

npm run dev

echo.
echo Server stopped.
pause
