@echo off
setlocal EnableDelayedExpansion

:: Set window title and clear screen
title Stock Manager V1 - One Click Launcher
cls

:: Display header
echo.
echo =======================================
echo     Stock Manager V1 - Launcher
echo =======================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo [INFO] Please ensure you're running this from the project folder.
    echo.
    goto :error_exit
)

:: Step 1: Check Node.js
echo [1/4] Verifying Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found in PATH!
    echo [INFO] Download from: https://nodejs.org/
    goto :error_exit
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not working properly!
    goto :error_exit
)

for /f "tokens=*" %%v in ('node --version 2^>^&1') do set NODE_VER=%%v
echo [OK] Node.js %NODE_VER% detected

:: Step 2: Check NPM
echo [2/4] Verifying NPM...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM not found in PATH!
    goto :error_exit
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] NPM is not working properly!
    goto :error_exit
)

for /f "tokens=*" %%v in ('npm --version 2^>^&1') do set NPM_VER=%%v
echo [OK] NPM %NPM_VER% detected

:: Step 3: Handle dependencies
echo [3/4] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo [WARNING] This may take a few minutes...
    npm install --no-audit --no-fund
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install dependencies!
        goto :error_exit
    )
    echo [OK] Dependencies installed successfully
) else (
    echo [OK] Dependencies already installed
)

:: Step 4: Clean up and start
echo [4/4] Starting application...

:: Kill any existing Node processes
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Stopped existing Node.js processes
    timeout /t 2 /nobreak >nul
)

echo.
echo [SUCCESS] Starting Stock Manager V1...
echo [INFO] Server will start at: http://localhost:5173
echo [INFO] Press Ctrl+C to stop the server
echo.
echo =======================================
echo.

:: Start the development server
npm run dev

:: If we get here, the server was stopped
echo.
echo [INFO] Development server stopped
goto :normal_exit

:error_exit
echo.
echo [FAILED] Setup failed. Please check the errors above.
echo.
pause
exit /b 1

:normal_exit
echo.
echo [INFO] Thank you for using Stock Manager V1!
pause
exit /b 0
