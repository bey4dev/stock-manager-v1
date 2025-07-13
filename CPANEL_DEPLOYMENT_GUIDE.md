# 🚀 Panduan Deployment Stock Manager V1 ke cPanel Hosting

## 📋 Prerequisites

### **Yang Dibutuhkan:**
1. **cPanel Hosting** dengan support:
   - Node.js (versi 16+ recommended)
   - npm/yarn package manager
   - SSL Certificate (recommended)
   - Domain/subdomain

2. **Local Requirements:**
   - Git (untuk version control)
   - FTP Client atau File Manager
   - Build tools sudah terinstall

## 🔧 Step-by-Step Deployment Guide

### **Step 1: Persiapan Build Production**

#### 1.1 Build Aplikasi untuk Production
```bash
# Di local development
npm run build
```

#### 1.2 Verify Build Output
```bash
# Check folder dist/ terbentuk
ls dist/
```

### **Step 2: Setup cPanel Environment**

#### 2.1 Aktifkan Node.js di cPanel
1. Login ke cPanel
2. Cari **"Node.js App"** di section Software
3. Klik **"Create Application"**
4. Pilih Node.js version (16+ recommended)
5. Set Application root: `/public_html/stock-manager` (atau sesuai keinginan)
6. Set Application URL: `stock-manager.yourdomain.com` atau subdirectory
7. Set Application startup file: `server.js`

#### 2.2 Configure Domain/Subdomain
1. Jika menggunakan subdomain, buat subdomain baru
2. Point ke folder aplikasi Node.js
3. Setup SSL certificate (Let's Encrypt gratis)

### **Step 3: Upload Files**

#### 3.1 Structure Folder di cPanel
```
/public_html/stock-manager/
├── dist/                 # Build output dari Vite
├── server.js            # Express server file
├── package.json         # Dependencies
├── .htaccess           # Apache configuration
└── static/             # Static assets
```

#### 3.2 Upload Via File Manager atau FTP
1. Compress build files menjadi ZIP
2. Upload via cPanel File Manager
3. Extract di folder aplikasi

### **Step 4: Server Configuration**

#### 4.1 Create Express Server (server.js)
```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Stock Manager running on port ${port}`);
});
```

#### 4.2 Update package.json for Production
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "vite build"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

### **Step 5: Environment Configuration**

#### 5.1 Create .env file untuk Production
```env
NODE_ENV=production
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SHEETS_API_KEY=your_sheets_api_key
```

#### 5.2 Update Vite Config untuk Production
```javascript
// vite.config.js
export default {
  base: '/stock-manager/', // Jika di subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}
```

## 🌐 Automated Deployment Options

### **Option 1: GitHub Integration**
1. Push code ke GitHub repository
2. Use cPanel Git integration
3. Auto-deploy on push

### **Option 2: FTP Deployment Script**
```bash
# Upload script via FTP
npm run build
zip -r stock-manager-build.zip dist/ server.js package.json
# Upload via FTP client
```

## 🔒 Security & Performance

### **Security Configuration**
1. **HTTPS**: Always use SSL certificate
2. **Environment Variables**: Store sensitive data di .env
3. **Access Control**: Proper file permissions

### **Performance Optimization**
1. **Gzip Compression**: Enable di cPanel
2. **Caching**: Setup browser caching
3. **CDN**: Use CloudFlare atau similar

## 🛠️ Troubleshooting Common Issues

### **Issue 1: Node.js App Not Starting**
```bash
# Check Node.js version
node --version
# Verify package.json
npm install
```

### **Issue 2: Static Files Not Loading**
- Check build path configuration
- Verify .htaccess rules
- Ensure proper file permissions

### **Issue 3: Google Sheets API Issues**
- Update CORS settings
- Verify API keys untuk production domain
- Check OAuth redirect URLs

## 📊 Monitoring & Maintenance

### **Performance Monitoring**
1. **cPanel Metrics**: Monitor resource usage
2. **Error Logs**: Check Node.js error logs
3. **Uptime Monitoring**: Setup monitoring service

### **Regular Maintenance**
1. **Updates**: Keep dependencies updated
2. **Backups**: Regular database/file backups
3. **Security**: Monitor untuk security issues

## 🎯 Production Checklist

### **Pre-Deployment**
- [ ] Build berhasil tanpa error
- [ ] Environment variables configured
- [ ] Google API keys updated untuk production
- [ ] SSL certificate ready

### **Post-Deployment**
- [ ] Application accessible via domain
- [ ] All features working correctly
- [ ] Mobile responsive verified
- [ ] Google authentication working
- [ ] Performance optimization applied

## 🚀 Go-Live Steps

### **Final Deployment**
1. Build production version
2. Upload ke cPanel
3. Configure Node.js application
4. Test all functionalities
5. Setup monitoring
6. Update DNS (jika perlu)

---

## 📞 Support Resources

- **cPanel Documentation**: Node.js setup guides
- **Hosting Provider**: Technical support
- **Domain Configuration**: DNS management
- **SSL Setup**: Certificate installation

**Aplikasi Stock Manager V1 siap untuk production deployment di cPanel hosting!** 🎊
