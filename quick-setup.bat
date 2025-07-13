@echo off
echo.
echo 🚀 Google Sheets Quick Setup for StockManager
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo    Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if googleapis is installed
if not exist "node_modules\googleapis" (
    echo 📦 Installing googleapis...
    npm install googleapis
    if %errorlevel% neq 0 (
        echo ❌ Failed to install googleapis
        pause
        exit /b 1
    )
    echo ✅ googleapis installed
) else (
    echo ✅ googleapis already installed
)

echo.

REM Check service account key
if not exist "service-account-key.json" (
    echo.
    echo ❌ service-account-key.json not found!
    echo.
    echo 📝 Please complete these steps first:
    echo    1. Go to Google Cloud Console ^> IAM ^& Admin ^> Service Accounts
    echo    2. Create new service account or select existing
    echo    3. Create key ^(JSON format^)
    echo    4. Save as 'service-account-key.json' in this folder
    echo    5. Share your spreadsheet with the service account email
    echo.
    echo 🔗 Guide: SETUP_COMMAND_PROMPT.md
    echo.
    pause
    exit /b 1
)

echo ✅ service-account-key.json found
echo.

REM Run setup
echo 🛠️ Starting Google Sheets setup...
echo.
node setup-sheets-auto.js setup

if %errorlevel% neq 0 (
    echo.
    echo ❌ Setup failed! Check error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo    1. Open your spreadsheet and verify the data
echo    2. Run your app: npm run dev
echo    3. Login with Google and check Debug page
echo.
echo 🔗 Your spreadsheet: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit
echo 📱 Your app: http://localhost:5174
echo.
pause
