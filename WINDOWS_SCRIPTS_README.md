# 🚀 Stock Manager V1 - Windows Setup Scripts

Kumpulan script untuk memudahkan menjalankan aplikasi Stock Manager V1 di Windows.

## ⚡ Quick Start (RECOMMENDED)

### **Cara Tercepat - Pilih Salah Satu:**

#### **Option 1: EASY-START.bat** ⭐ (MOST RELIABLE)
```
Double-click "EASY-START.bat"
```

#### **Option 2: RUN.bat** ⭐ (SUPER SIMPLE)  
```
Double-click "RUN.bat"
```

#### **Option 3: Manual Command**
```
1. Open Command Prompt in project folder
2. Type: npm run dev
3. Press Enter
```

## 📁 File Scripts yang Tersedia

### 🎯 **EASY-START.bat** ⭐ (RECOMMENDED)
**Script paling reliable dengan error handling**
- Automatic directory detection
- Install dependencies jika belum ada
- Clean existing processes
- Comprehensive error handling
- **PALING AMAN DIGUNAKAN**

### 🎯 **RUN.bat** ⭐ (SUPER SIMPLE)
**Script super sederhana tanpa kompleksitas**
- Minimal commands
- Install deps jika perlu
- Langsung start server
- **PALING CEPAT**

### 🚀 **start-simple.bat** 
**Alternative launcher dengan error handling**
- Auto-check Node.js dan NPM
- Install dependencies otomatis jika belum ada
- Stop proses Node.js yang sedang berjalan
- Start development server

**Cara Pakai:**
```
Double-click start-simple.bat
```

### 🚀 **start-app-fixed.ps1**
**Versi PowerShell dengan fitur lengkap**
- Semua fitur start-app.bat
- Deteksi port yang tersedia
- Error handling yang lebih baik
- Colored output

**Cara Pakai:**
```
Right-click → Run with PowerShell
atau
PowerShell: .\start-app-fixed.ps1
```

### 🔨 **build-app.bat**
**Build aplikasi untuk production**
- Clean build sebelumnya
- Compile untuk production
- Optimasi file size

**Cara Pakai:**
```
Double-click build-app.bat
```

### 🌐 **test-production.bat**
**Test production build di local server**
- Install serve package otomatis
- Run production build di localhost:3000
- Test performa production

**Cara Pakai:**
```
Double-click test-production.bat
```

### 🔄 **reset-app.bat**
**Reset dan bersihkan semua file**
- Hapus node_modules
- Hapus dist folder
- Hapus package-lock.json
- Fresh start

**Cara Pakai:**
```
Double-click reset-app.bat
```

## 🛠️ System Requirements

### **Minimum Requirements:**
- Windows 7/8/10/11
- Node.js v16+ ([Download](https://nodejs.org/))
- NPM (included with Node.js)
- 2GB RAM
- 1GB free disk space

### **Recommended:**
- Windows 10/11
- Node.js v18+
- 4GB RAM
- SSD storage

## 🚀 Quick Start Guide

### **1. First Time Setup**
```
1. Double-click "START.bat"
2. Wait for automatic dependency installation
3. Server will start automatically
4. Open browser to: http://localhost:5173
```

### **2. Daily Usage**
```
1. Double-click "START.bat" 
2. Wait for server to start
3. Browser will show: http://localhost:5173
```

### **3. Production Deployment**
```
1. Double-click "build-app.bat"
2. Upload "dist" folder to web server
3. Or test locally with "test-production.bat"
```

## 🔧 Troubleshooting

### **❌ "Script hangs or stops working"**
**Solution:**
```
1. Use "START.bat" instead (most reliable)
2. Close all command prompt windows
3. Run "reset-app.bat" to clean up
4. Try "START.bat" again
```

### **❌ "Node.js not found"**
**Solution:**
1. Download Node.js dari https://nodejs.org/
2. Install dengan default settings
3. Restart command prompt
4. Run script lagi

### **❌ "Permission denied" (PowerShell)**
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **❌ "Port already in use"**
**Solution:**
1. Run "reset-app.bat" untuk stop semua proses
2. Atau restart computer
3. Run "start-app.bat" lagi

### **❌ "Dependencies installation failed"**
**Solution:**
```
1. Check internet connection
2. Run "reset-app.bat"
3. Try "start-app.bat" again
4. Or manually: npm install
```

### **❌ "Build failed"**
**Solution:**
```
1. Run "reset-app.bat"
2. Run "start-app.bat" first
3. Then run "build-app.bat"
```

## 📱 Access Points

### **Development Server:**
- **URL:** http://localhost:5173 (or next available port)
- **Features:** Hot reload, debugging, development tools

### **Production Server:**
- **URL:** http://localhost:3000
- **Features:** Optimized, production-ready

## 🔒 Security Notes

### **Google Sheets API:**
- Pastikan file konfigurasi Google Sheets sudah benar
- Token otentikasi akan diminta saat pertama kali
- Data disimpan di Google Sheets Anda

### **Local Server:**
- Server hanya berjalan di localhost
- Tidak bisa diakses dari komputer lain secara default
- Aman untuk development

## 📞 Support

### **Common Commands:**
```bash
# Manual start (if scripts fail)
npm install
npm run dev

# Manual build
npm run build

# Manual test production
npx serve dist
```

### **File Locations:**
```
📁 Source Code: src/
📁 Built Files: dist/
📁 Dependencies: node_modules/
📁 Scripts: *.bat, *.ps1
```

### **Log Files:**
- Check console output untuk error messages
- Browser developer tools untuk debugging
- Network tab untuk API issues

## 🎯 Tips & Best Practices

### **Performance:**
1. Gunakan SSD untuk performa terbaik
2. Close aplikasi lain saat development
3. Restart computer secara berkala

### **Development:**
1. Gunakan "start-app.bat" untuk daily development
2. Test dengan "build-app.bat" sebelum deploy
3. Backup data secara berkala

### **Production:**
1. Always test production build locally first
2. Upload hanya folder "dist" ke web server
3. Configure web server untuk serve SPA

---

## 🏆 Made with ❤️ for Stock Manager V1

**Happy Coding! 🚀**
