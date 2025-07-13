# 🔧 Update Google OAuth untuk Production

## 🎯 **Problem:** OAuth redirect_uri_mismatch di Production

Aplikasi berhasil deploy ke: **https://stock-manager-v1.vercel.app/**
Tapi Google OAuth hanya mengizinkan localhost.

---

## 🚀 **SOLUSI CEPAT:**

### **Step 1: Buka Google Cloud Console**
🔗 https://console.cloud.google.com/apis/credentials

### **Step 2: Edit OAuth 2.0 Client ID**
Client ID: `752419828170-o835j9j32gmcmc9sdhcajnqoaikoh8j8.apps.googleusercontent.com`

### **Step 3: Add Production URLs**

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
https://stock-manager-v1.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/
http://localhost:5173/
https://stock-manager-v1.vercel.app/
```

### **Step 4: Save & Wait**
- ✅ Save configuration
- ⏳ Wait 5-10 minutes for propagation
- 🔄 Refresh Stock Manager app
- 🎉 Login should work!

---

## 🔍 **Verification Steps:**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Open:** https://stock-manager-v1.vercel.app/
3. **Try Google Login**
4. **Should work now!** ✅

---

## 📞 **If Still Not Working:**

Possible additional fixes:
1. **Wait longer** (up to 1 hour for global propagation)
2. **Add more URL variants:**
   - `https://stock-manager-v1.vercel.app/oauth/callback`
   - `https://stock-manager-v1.vercel.app/auth`
3. **Check browser developer tools** for specific error messages

---

## 🎯 **Expected Result:**
After fixing OAuth settings:
- ✅ Stock Manager loads at production URL
- ✅ Google Login button works
- ✅ User can authenticate successfully
- ✅ Access to Google Sheets data
- ✅ Full application functionality

**Your Stock Manager V1 will be fully functional online! 🚀**
