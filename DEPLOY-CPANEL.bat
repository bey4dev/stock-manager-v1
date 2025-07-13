@echo off
title Stock Manager V1 - cPanel Deployment

echo.
echo ========================================
echo    Stock Manager V1 - cPanel Deploy
echo ========================================
echo.

:: Check if Node.js is available
node -v >nul 2>&1 || (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this from the project root folder.
    pause
    exit /b 1
)

echo 🔨 Building application for production...
npm run build || (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo.

echo 📦 Installing production dependencies...
npm install express compression helmet cors dotenv --save || (
    echo ERROR: Failed to install production dependencies!
    pause
    exit /b 1
)

echo ✅ Production dependencies installed!
echo.

echo 📋 Preparing deployment package...
node deploy-prepare.js || (
    echo ERROR: Failed to prepare deployment package!
    pause
    exit /b 1
)

echo.
echo ✅ Deployment package ready!
echo.
echo 📁 Files created:
echo    - deployment-package/ (folder with all files)
echo    - stock-manager-deployment.zip (ready to upload)
echo.
echo 🚀 Next Steps for cPanel Deployment:
echo.
echo 1. 📤 Upload stock-manager-deployment.zip to cPanel File Manager
echo 2. 📂 Extract to your desired directory (e.g., public_html/stock-manager)
echo 3. ⚙️  Enable Node.js in cPanel and create new application
echo 4. 🔑 Update .env.production with your Google API credentials
echo 5. 🌐 Configure domain/subdomain pointing to the app
echo 6. 🔒 Setup SSL certificate (recommended)
echo 7. ▶️  Start the Node.js application
echo.
echo 📋 Detailed instructions: CPANEL_DEPLOYMENT_GUIDE.md
echo.

set /p OPEN_GUIDE="Open deployment guide? (y/n): "
if /i "%OPEN_GUIDE%"=="y" (
    start notepad CPANEL_DEPLOYMENT_GUIDE.md
)

set /p OPEN_FOLDER="Open deployment folder? (y/n): "
if /i "%OPEN_FOLDER%"=="y" (
    start explorer deployment-package
)

echo.
echo 🎉 Deployment preparation completed!
echo 📦 Upload stock-manager-deployment.zip to your cPanel hosting
echo.
pause
