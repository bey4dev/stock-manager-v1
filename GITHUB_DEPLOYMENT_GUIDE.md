# 🐙 Panduan Deployment Stock Manager V1 via GitHub

## 🎯 Overview: Deployment via GitHub

Deploy aplikasi Stock Manager V1 menggunakan GitHub sebagai repository dan berbagai platform hosting yang terintegrasi dengan GitHub.

---

## 🚀 OPTION 1: GitHub + Vercel (RECOMMENDED)

### **✅ Keunggulan:**
- ✅ Zero configuration
- ✅ Auto-deploy setiap git push
- ✅ Preview deployments
- ✅ Custom domain gratis
- ✅ SSL otomatis
- ✅ Global CDN

### **📋 Step-by-Step:**

#### **Step 1: Setup GitHub Repository**

**🔧 Prerequisites:**
- Git terinstall di komputer
- Akun GitHub (gratis di [github.com](https://github.com))
- Stock Manager V1 project sudah siap

**📂 Detailed Step-by-Step:**

```bash
# 1. Buka terminal/command prompt di folder project
cd "d:\Programing\Web-Aplication\Stock ManagerV1"

# 2. Initialize Git repository (jika belum)
git init

# 3. Check status files
git status
# Akan menampilkan semua files yang belum di-track

# 4. Create .gitignore file (PENTING!)
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "*.log" >> .gitignore

# 5. Add semua files ke staging
git add .

# 6. Verify what will be committed
git status
# Should show files in green (ready to commit)

# 7. Initial commit
git commit -m "Initial commit: Stock Manager V1 ready for deployment"
```

**🌐 Create GitHub Repository:**

1. **Buka [github.com](https://github.com) dan login**
2. **Klik tombol hijau "New" atau "+" → New repository**
3. **Repository settings:**
   ```
   Repository name: stock-manager-v1
   Description: Stock Manager V1 - Aplikasi manajemen stok dengan Google Sheets
   Visibility: Public (untuk hosting gratis) atau Private
   ✅ Add a README file: UNCHECKED (karena sudah ada)
   ✅ Add .gitignore: UNCHECKED (sudah dibuat manual)
   ✅ Choose a license: Optional (MIT recommended)
   ```
4. **Klik "Create repository"**

**🔗 Connect Local ke GitHub:**

```bash
# 8. Add remote origin (ganti 'username' dengan GitHub username Anda)
git remote add origin https://github.com/username/stock-manager-v1.git

# 9. Verify remote connection
git remote -v
# Should show:
# origin  https://github.com/username/stock-manager-v1.git (fetch)
# origin  https://github.com/username/stock-manager-v1.git (push)

# 10. Rename branch ke 'main' (GitHub default)
git branch -M main

# 11. Push ke GitHub (first time)
git push -u origin main
```

**✅ Verification:**
```bash
# Check if everything uploaded successfully
git log --oneline
# Should show your commit

# Check remote status
git status
# Should show "Your branch is up to date with 'origin/main'"
```

**🎯 Repository Structure di GitHub:**
Setelah upload, struktur di GitHub akan terlihat seperti:
```
stock-manager-v1/
├── src/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── .gitignore
└── ... (other project files)
```

**🚨 Common Issues & Solutions:**

**Issue 1: Authentication Error**
```bash
# If using HTTPS and getting auth errors
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Or use SSH instead of HTTPS
git remote set-url origin git@github.com:username/stock-manager-v1.git
```

**Issue 2: Large Files**
```bash
# If files too large (>100MB)
git lfs track "*.zip"
git lfs track "*.7z"
git add .gitattributes
```

**Issue 3: Branch Protection**
```bash
# If push rejected
git pull origin main --rebase
git push origin main
```

**🎉 Success Indicators:**
- ✅ Repository visible di github.com/username/stock-manager-v1
- ✅ All project files uploaded
- ✅ README.md shows project description
- ✅ Green "Code" button available
- ✅ Commit history visible

**📋 Next Steps after Repository Setup:**
1. ✅ Repository ready untuk deployment
2. ⏭️ Proceed to Step 2: Persiapan untuk Deployment
3. 🚀 Choose hosting platform (Vercel recommended)

**💡 Pro Tips:**
- Use descriptive commit messages
- Create .gitignore before first commit
- Keep sensitive data in environment variables
- Use branching strategy untuk development

#### **Step 2: Persiapan untuk Deployment**

**Update `package.json`:**
```json
{
  "name": "stock-manager-v1",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && echo 'Ready for deployment'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

**Update `vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Root deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@heroicons/react']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
```

#### **Step 3: Deploy ke Vercel**

1. **Buka [vercel.com](https://vercel.com)**
2. **Sign up/Login dengan GitHub account**
3. **New Project → Import Git Repository**
4. **Select repository: stock-manager-v1**
5. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. **Environment Variables:**
   ```
   VITE_GOOGLE_CLIENT_ID = your_google_client_id
   VITE_GOOGLE_SHEETS_API_KEY = your_api_key
   ```
7. **Deploy!** 🚀

#### **Step 4: Auto-Deployment Setup**

**Setiap kali push ke GitHub, Vercel otomatis deploy:**
```bash
# Make changes
git add .
git commit -m "Update: new features"
git push origin main
# Vercel automatically deploys! 🎉
```

---

## 🚀 OPTION 2: GitHub + Netlify

### **📋 Step-by-Step:**

#### **Step 1: Repository sudah ready (sama seperti di atas)**

#### **Step 2: Deploy ke Netlify**

1. **Buka [netlify.com](https://netlify.com)**
2. **New site from Git → GitHub**
3. **Authorize Netlify untuk akses GitHub**
4. **Select repository: stock-manager-v1**
5. **Build settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```
6. **Environment variables:**
   ```
   VITE_GOOGLE_CLIENT_ID = your_value
   VITE_GOOGLE_SHEETS_API_KEY = your_value
   ```
7. **Deploy site!**

#### **Step 3: Custom Domain (Optional)**
```
Site settings → Domain management → Add custom domain
```

---

## 🚀 OPTION 3: GitHub Pages

### **📋 Step-by-Step:**

#### **Step 1: Create GitHub Actions Workflow**

**Create file: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
        VITE_GOOGLE_SHEETS_API_KEY: ${{ secrets.VITE_GOOGLE_SHEETS_API_KEY }}
        
    - name: Setup Pages
      uses: actions/configure-pages@v4
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

#### **Step 2: Update vite.config.js untuk GitHub Pages**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/stock-manager-v1/', // Nama repository
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

#### **Step 3: Enable GitHub Pages**

1. **Repository Settings → Pages**
2. **Source: GitHub Actions**
3. **Save**

#### **Step 4: Add Secrets**

1. **Repository Settings → Secrets and variables → Actions**
2. **Add repository secrets:**
   ```
   VITE_GOOGLE_CLIENT_ID
   VITE_GOOGLE_SHEETS_API_KEY
   ```

#### **Step 5: Deploy**
```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
# GitHub Actions will auto-deploy!
```

**Access URL:** `https://username.github.io/stock-manager-v1/`

---

## 🚀 OPTION 4: GitHub + Firebase Hosting

### **📋 Step-by-Step:**

#### **Step 1: Setup Firebase**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Initialize project
firebase init hosting
```

#### **Step 2: Firebase Configuration**

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### **Step 3: GitHub Actions untuk Firebase**

**Create: `.github/workflows/firebase-deploy.yml`**
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_GOOGLE_SHEETS_API_KEY: ${{ secrets.VITE_GOOGLE_SHEETS_API_KEY }}
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-firebase-project-id
```

---

## 🔧 Advanced GitHub Deployment Features

### **🌟 Preview Deployments**

**Vercel & Netlify otomatis create preview untuk setiap PR:**
```bash
# Create feature branch
git checkout -b feature/new-functionality
git add .
git commit -m "Add new functionality"
git push origin feature/new-functionality

# Create PR di GitHub
# Preview deployment otomatis dibuat! 🎉
```

### **🌟 Environment-specific Deployments**

**Setup multiple environments:**
```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [ develop ]
# Deploy ke staging environment

# .github/workflows/deploy-production.yml  
on:
  push:
    branches: [ main ]
# Deploy ke production environment
```

---

## 🔒 Security Best Practices

### **Environment Variables**
```bash
# NEVER commit sensitive data!
# Add ke .gitignore:
.env
.env.local
.env.production
```

### **GitHub Secrets**
```
Repository Settings → Secrets and variables → Actions
Add:
- VITE_GOOGLE_CLIENT_ID
- VITE_GOOGLE_SHEETS_API_KEY
- FIREBASE_SERVICE_ACCOUNT (jika pakai Firebase)
```

---

## 🎯 Quick Comparison

| Platform | Setup Time | Custom Domain | SSL | Auto-Deploy | Best For |
|----------|------------|---------------|-----|-------------|-----------|
| **Vercel** | 5 min | ✅ Free | ✅ Auto | ✅ | React Apps |
| **Netlify** | 5 min | ✅ Free | ✅ Auto | ✅ | Static Sites |
| **GitHub Pages** | 10 min | ✅ | ✅ Auto | ✅ | Open Source |
| **Firebase** | 15 min | ✅ | ✅ Auto | ✅ | Google Ecosystem |

---

## 🚀 RECOMMENDED WORKFLOW

### **🏆 Best Practice untuk Stock Manager V1:**

```bash
# 1. Development
git checkout -b feature/new-feature
# Code changes...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 2. Create PR
# Preview deployment otomatis dibuat

# 3. Merge ke main
# Production deployment otomatis!

# 4. Result:
# ✅ Live di production URL
# ✅ HTTPS enabled
# ✅ Global CDN
# ✅ Auto-optimized
```

---

## 🎉 HASIL AKHIR

Setelah setup via GitHub, Anda akan mendapatkan:

- ✅ **Live URL**: `https://stock-manager-v1.vercel.app`
- ✅ **Auto-deployment**: Push = Live
- ✅ **Preview deployments**: Untuk setiap PR
- ✅ **SSL Certificate**: Otomatis
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Custom domain**: Jika diperlukan
- ✅ **Zero maintenance**: Fully managed

**Stock Manager V1 Anda siap online melalui GitHub! 🚀**
