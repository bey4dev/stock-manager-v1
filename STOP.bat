@echo off
title Stop Stock Manager V1
cls

echo.
echo ========================================
echo    Stop Stock Manager V1 Server
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Stock Manager V1 server stopped!
) else (
    echo [INFO] No Stock Manager V1 server was running.
)

echo.
echo Checking if server is really stopped...
timeout /t 2 /nobreak >nul

tasklist | findstr node >nul 2>&1
if %errorlevel% neq 0 (
    echo [CONFIRMED] All Node.js processes stopped.
) else (
    echo [WARNING] Some Node.js processes might still be running.
)

echo.
echo Server at http://localhost:5173 should now be stopped.
echo You can now run EASY-START.bat again if needed.
echo.
pause
