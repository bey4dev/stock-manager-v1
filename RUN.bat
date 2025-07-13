@echo off
cls
echo Starting Stock Manager V1...
echo.

cd /d "%~dp0"

if not exist package.json (
    echo ERROR: package.json not found!
    pause
    exit
)

if not exist node_modules (
    echo Installing dependencies...
    npm install
)

taskkill /f /im node.exe 2>nul

echo.
echo Server starting at: http://localhost:5173
echo Press Ctrl+C to stop
echo.

npm run dev

pause
