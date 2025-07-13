@echo off
title Stock Manager V1 - Reset Application
color 0C

echo.
echo ========================================
echo   Stock Manager V1 - Reset Application
echo ========================================
echo.
echo ⚠️  WARNING: This will delete all node_modules and build files!
echo.
set /p confirm="Are you sure you want to continue? (y/N): "

if /i not "%confirm%"=="y" (
    echo.
    echo ❌ Operation cancelled by user
    pause
    exit /b 0
)

echo.
echo 🔄 Starting reset process...

:: Stop all Node.js processes
echo [1/4] Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Processes stopped

:: Remove node_modules
echo [2/4] Removing node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo ✅ node_modules removed
) else (
    echo ✅ node_modules not found
)

:: Remove dist folder
echo [3/4] Removing build files...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ dist folder removed
) else (
    echo ✅ dist folder not found
)

:: Remove package-lock.json
echo [4/4] Removing package-lock.json...
if exist "package-lock.json" (
    del "package-lock.json"
    echo ✅ package-lock.json removed
) else (
    echo ✅ package-lock.json not found
)

echo.
echo 🎉 Reset completed successfully!
echo 📝 Next steps:
echo    1. Run 'start-app.bat' to reinstall dependencies and start the app
echo    2. Or run 'npm install' manually first
echo.

pause
