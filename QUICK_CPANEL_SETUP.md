# 🚀 Quick Setup Guide - Stock Manager V1 untuk cPanel

## ⚡ Langkah Cepat (5 Menit Setup)

### **Step 1: Persiapan Local**
```bash
# Jalankan script deployment
.\DEPLOY-CPANEL.bat
```

### **Step 2: Upload ke cPanel**
1. Login ke **cPanel**
2. Buka **File Manager**
3. Navigate ke `public_html` atau subdirectory
4. **Upload** file `stock-manager-deployment.zip`
5. **Extract All** files

### **Step 3: Setup Node.js Application**
1. Di cPanel, cari **"Node.js App"**
2. Klik **"Create Application"**
3. Settings:
   - **Node.js Version**: 16+ (pilih yang terbaru)
   - **Application mode**: Production
   - **Application root**: `/public_html/stock-manager` (sesuaikan path)
   - **Application URL**: `stock-manager.yourdomain.com`
   - **Application startup file**: `server.js`

### **Step 4: Install Dependencies**
1. Di Node.js App dashboard, klik **"Run NPM Install"**
2. Atau via Terminal:
```bash
npm install
```

### **Step 5: Configure Environment**
1. Edit file `.env.production`:
```env
# Update dengan kredensial Google API Anda
VITE_GOOGLE_CLIENT_ID=your_actual_client_id
VITE_GOOGLE_SHEETS_API_KEY=your_actual_api_key
```

### **Step 6: Start Application**
1. Di Node.js App dashboard, klik **"Start App"**
2. Atau via Terminal:
```bash
npm start
```

## 🌐 Setup Domain/SSL

### **Option A: Subdomain**
1. **Create Subdomain**: `stock-manager.yourdomain.com`
2. **Point to**: Application directory
3. **Enable SSL**: Let's Encrypt (gratis)

### **Option B: Subdirectory**
1. Access via: `yourdomain.com/stock-manager`
2. Update `base` di `vite.config.ts` jika perlu

## 🔑 Google API Setup untuk Production

### **Update OAuth Settings**
1. **Google Cloud Console** → Credentials
2. **Authorized JavaScript origins**:
   - `https://yourdomain.com`
   - `https://stock-manager.yourdomain.com`
3. **Authorized redirect URIs**:
   - `https://yourdomain.com/callback`
   - `https://stock-manager.yourdomain.com/callback`

### **Google Sheets API**
1. **Enable API** untuk domain production
2. **Update restrictions** pada API key

## ✅ Verification Checklist

### **Setelah Deploy, Test:**
- [ ] Application accessible via URL
- [ ] Google authentication working
- [ ] Dashboard loads correctly
- [ ] Mobile responsive working
- [ ] Charts dan data loading
- [ ] Google Sheets integration active
- [ ] SSL certificate active (HTTPS)

## 🛠️ Troubleshooting Cepat

### **App Not Starting**
```bash
# Check logs
tail -f ~/logs/stock-manager_stderr.log

# Restart app
pkill node
npm start
```

### **Google API Issues**
1. Check `.env.production` values
2. Verify OAuth redirect URLs
3. Check API key restrictions

### **Static Files Not Loading**
1. Check `.htaccess` configuration
2. Verify file permissions (644 for files, 755 for directories)
3. Check build output in `dist/` folder

## 📞 Support

### **Common Hosting Providers**
- **Hostinger**: Node.js supported ✅
- **cPanel/WHM**: Node.js app required ✅
- **SiteGround**: Node.js available ✅
- **Namecheap**: Check hosting plan ⚠️

### **Requirements**
- Node.js 16+ support
- SSL certificate capability
- File upload/extract capability
- Custom domain/subdomain setup

---

## 🎯 Hasil Akhir

Setelah mengikuti panduan ini, Anda akan memiliki:

✅ **Stock Manager V1** running di production  
✅ **HTTPS** dengan SSL certificate  
✅ **Mobile responsive** di semua device  
✅ **Google Sheets** integration working  
✅ **Professional domain** setup  

**Total setup time: ~5-10 menit!** 🚀
