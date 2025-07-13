# 🔧 Fix: Google User Profile Name Issue

## 🎯 Masalah
Aplikasi menampilkan "Google User" dan "user@gmail.com" bukan nama asli dan email dari akun Google yang login.

## 🔍 Analisis Penyebab
1. **Scope tidak lengkap**: Hanya menggunakan `spreadsheets` scope
2. **API deprecated**: Menggunakan Google+ API yang sudah dihentikan
3. **Auth cache**: Data lama tersimpan di localStorage

## ✅ Solusi yang Telah Diterapkan

### 1. **Update Google API Scopes**
```typescript
// src/config/google-sheets.ts
SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
```

### 2. **Fix getUserProfile Implementation**
```typescript
// src/services/GoogleSheetsService.ts
async getUserProfile(): Promise<any> {
  // Menggunakan getBasicProfile() yang lebih reliable
  const authInstance = window.gapi.auth2.getAuthInstance();
  const currentUser = authInstance.currentUser.get();
  const basicProfile = currentUser.getBasicProfile();
  
  return {
    name: basicProfile.getName() || 'Google User',
    email: basicProfile.getEmail() || 'user@gmail.com',
    picture: basicProfile.getImageUrl() || null,
    id: basicProfile.getId() || null
  };
}
```

### 3. **Layout User Display**
```tsx
// src/components/Layout.tsx
<p className="text-sm font-medium text-gray-900">{user?.name || 'Demo User'}</p>
<p className="text-xs text-gray-500">{user?.email || 'demo@example.com'}</p>
```

## 🚀 Cara Menerapkan Fix

### **Step 1: Restart Aplikasi**
Aplikasi sudah di-restart dengan konfigurasi baru di port 5173:
```
http://localhost:5173/
```

### **Step 2: Debug Enhanced**
- ✅ Enhanced debugging di getUserProfile method
- ✅ Debugging di AppContext login flow  
- ✅ ProfileTest component di Debug page
- ✅ Force clear auth script

### **Step 3: Manual Debugging Required**
⚠️ **PERLU MANUAL TESTING** - Buka aplikasi dan:

1. **Buka Developer Console** (F12)
2. **Clear auth data paksa**:
```javascript
localStorage.removeItem('stockmanager_auth');
if (window.gapi?.auth2) window.gapi.auth2.getAuthInstance().signOut();
location.reload();
```
3. **Login ulang** dan monitor console messages
4. **Test Profile component** di Debug page
5. **Report hasil** untuk diagnosis lanjutan

## 🧪 Testing

### **Sebelum Fix:**
```
Name: "Google User"
Email: "user@gmail.com"
```

### **Setelah Fix:**
```
Name: "John Doe" (nama asli dari Google account)
Email: "johndoe@gmail.com" (email asli dari Google account)
```

## 📋 Verification Steps

1. **Buka aplikasi**: http://localhost:5176/
2. **Buka browser console** (F12)
3. **Clear auth data** dengan script di atas
4. **Refresh page**
5. **Login ulang** dengan Google
6. **Check sidebar** - nama asli harus muncul
7. **Check Debug page** - user profile harus real

## 🔧 Troubleshooting

### Jika masih muncul "Google User":
1. **Clear browser cache** completely
2. **Incognito mode** untuk testing
3. **Check console errors** untuk API issues
4. **Verify Google Cloud Console** scopes sudah benar

### Console Commands untuk Debug:
```javascript
// Check current auth state
console.log('Auth state:', JSON.parse(localStorage.getItem('stockmanager_auth')));

// Check Google API state
console.log('GAPI loaded:', !!window.gapi);
console.log('Auth instance:', window.gapi?.auth2?.getAuthInstance());

// Get current user manually
const authInstance = window.gapi.auth2.getAuthInstance();
const user = authInstance.currentUser.get();
const profile = user.getBasicProfile();
console.log('Real name:', profile.getName());
console.log('Real email:', profile.getEmail());
```

---

**Status**: ✅ Fix diterapkan, perlu logout/login ulang untuk effect
**Next**: User perlu clear auth data lama dan login ulang
