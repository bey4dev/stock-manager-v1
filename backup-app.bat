@echo off
title Stock Manager V1 - Auto Backup
color 0D

echo.
echo ========================================
echo   Stock Manager V1 - Auto Backup
echo ========================================
echo.

:: Set backup folder with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"

set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"
set "backup_folder=Backup_%timestamp%"

echo 📅 Backup timestamp: %timestamp%
echo 📁 Backup folder: %backup_folder%
echo.

:: Create backup directory
if not exist "Backups" mkdir "Backups"
mkdir "Backups\%backup_folder%"

echo [1/6] Creating backup folder...
echo ✅ Backup folder created: Backups\%backup_folder%

:: Backup source code
echo [2/6] Backing up source code...
xcopy "src" "Backups\%backup_folder%\src" /E /H /C /I /Y >nul
echo ✅ Source code backed up

:: Backup configuration files
echo [3/6] Backing up configuration files...
copy "package.json" "Backups\%backup_folder%\" >nul 2>&1
copy "package-lock.json" "Backups\%backup_folder%\" >nul 2>&1
copy "vite.config.ts" "Backups\%backup_folder%\" >nul 2>&1
copy "tsconfig.json" "Backups\%backup_folder%\" >nul 2>&1
copy "tsconfig.node.json" "Backups\%backup_folder%\" >nul 2>&1
copy "index.html" "Backups\%backup_folder%\" >nul 2>&1
copy "tailwind.config.js" "Backups\%backup_folder%\" >nul 2>&1
copy "postcss.config.js" "Backups\%backup_folder%\" >nul 2>&1
copy "eslint.config.js" "Backups\%backup_folder%\" >nul 2>&1
echo ✅ Configuration files backed up

:: Backup scripts
echo [4/6] Backing up Windows scripts...
copy "*.bat" "Backups\%backup_folder%\" >nul 2>&1
copy "*.ps1" "Backups\%backup_folder%\" >nul 2>&1
copy "*.md" "Backups\%backup_folder%\" >nul 2>&1
echo ✅ Scripts backed up

:: Backup public folder if exists
echo [5/6] Backing up public assets...
if exist "public" (
    xcopy "public" "Backups\%backup_folder%\public" /E /H /C /I /Y >nul
    echo ✅ Public assets backed up
) else (
    echo ✅ No public folder found
)

:: Create backup info file
echo [6/6] Creating backup information...
echo Stock Manager V1 - Backup Information > "Backups\%backup_folder%\BACKUP_INFO.txt"
echo. >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Backup Date: %date% >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Backup Time: %time% >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Backup Folder: %backup_folder% >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Computer: %COMPUTERNAME% >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo User: %USERNAME% >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo. >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Files Included: >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo - Source Code (src folder) >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo - Configuration Files >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo - Windows Scripts >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo - Documentation >> "Backups\%backup_folder%\BACKUP_INFO.txt"
if exist "public" echo - Public Assets >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo. >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo Note: node_modules and dist folders are excluded to save space >> "Backups\%backup_folder%\BACKUP_INFO.txt"
echo You can restore by copying files back to project root >> "Backups\%backup_folder%\BACKUP_INFO.txt"

echo ✅ Backup information created

:: Calculate backup size
echo.
echo 📊 Calculating backup size...
for /f "usebackq" %%A in (`"dir "Backups\%backup_folder%" /s /-c | find "bytes""`) do set size=%%A
echo ✅ Backup completed!

echo.
echo 🎉 Backup Summary:
echo 📁 Location: %CD%\Backups\%backup_folder%
echo 📅 Date: %date%
echo ⏰ Time: %time%
echo 💾 Status: Success
echo.
echo 💡 To restore:
echo    1. Copy files from backup folder
echo    2. Run 'npm install' to restore dependencies
echo    3. Run 'start-app.bat' to start application
echo.

:: Ask if user wants to open backup folder
set /p open="Do you want to open the backup folder? (y/N): "
if /i "%open%"=="y" (
    explorer "Backups\%backup_folder%"
)

echo.
pause
