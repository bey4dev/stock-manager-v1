# 🔧 TROUBLESHOOTING: Delete Product Issue

## 🎯 Masalah Terbaru: Delete Product Tidak Berfungsi
Product tidak terhapus dari Google Sheets setelah klik delete.

## ✅ Fix yang Telah Diterapkan

### 1. **Fixed deleteProduct Implementation**
- ✅ Mendapatkan sheetId yang benar dari spreadsheet metadata
- ✅ Enhanced debugging untuk trace delete process
- ✅ Proper error handling dan logging

### 2. **Enhanced Context Debugging**
- ✅ Tambah debugging di AppContext.deleteProduct
- ✅ Trace reload products setelah delete
- ✅ Monitor dashboard update

### 3. **Delete Test Script**
- 📁 `test-delete-product.js` - Script untuk test delete langsung

## 🚀 Langkah Testing Delete Product

### **Step 1: Buka Aplikasi dan Console**
1. Buka: http://localhost:5173/
2. Navigate ke halaman "Produk"
3. Tekan F12 → Console tab

### **Step 2: Test Delete via UI**
1. **Klik delete** pada salah satu product
2. **Monitor console** untuk debug messages:
   ```
   🗑️ [CONTEXT] Starting product deletion: PRD_001
   🗑️ [DELETE] Starting product deletion: PRD_001
   🔍 [DELETE] Getting spreadsheet metadata...
   ✅ [DELETE] Found Products sheet ID: 123456
   ✅ [DELETE] Found product at row: 2
   �️ [DELETE] Deleting row from sheet...
   ✅ [DELETE] Delete operation completed
   ```

### **Step 3: Manual Delete Test**
Paste script ini di console:
```javascript
// Test delete langsung
async function testDelete() {
  const response = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
    range: 'Products!A:H',
  });
  
  const rows = response.result.values || [];
  console.log('Available products:');
  rows.slice(1).forEach((row, i) => console.log(`${i+1}. ${row[0]} - ${row[1]}`));
  
  if (rows.length > 1) {
    const productId = rows[1][0]; // Get first product ID
    console.log('Testing delete for:', productId);
    
    // Call the delete function directly
    const result = await window.googleSheetsService?.deleteProduct(productId);
    console.log('Delete result:', result);
  }
}

testDelete();
```

## 🔍 Expected Delete Flow

### **Normal Delete Flow:**
```
🗑️ [CONTEXT] Starting product deletion: PRD_001
🗑️ [DELETE] Starting product deletion: PRD_001
🔍 [DELETE] Getting spreadsheet metadata...
✅ [DELETE] Found Products sheet ID: 123456
🔍 [DELETE] Looking for product in sheet...
✅ [DELETE] Found product at row: 2
🗑️ [DELETE] Deleting row from sheet...
✅ [DELETE] Delete operation completed
🗑️ [CONTEXT] Delete successful, reloading products...
🗑️ [CONTEXT] Products reloaded, updating dashboard...
✅ [CONTEXT] Dashboard updated
```

### **Problem Indicators:**
- `❌ [DELETE] Products sheet not found`
- `❌ [DELETE] Product not found for deletion`
- `❌ [DELETE] Error deleting product`

## 🛠️ Troubleshooting Steps

### **Issue 1: Sheet ID Not Found**
```javascript
// Check sheet metadata
const meta = await window.gapi.client.sheets.spreadsheets.get({
  spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0'
});
console.log('Sheets:', meta.result.sheets.map(s => ({
  title: s.properties.title,
  id: s.properties.sheetId
})));
```

### **Issue 2: Product Not Found**
```javascript
// List all products
const response = await window.gapi.client.sheets.spreadsheets.values.get({
  spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
  range: 'Products!A:H'
});
console.log('Products:', response.result.values);
```

### **Issue 3: Permission Error**
- Pastikan service account memiliki **Editor** access
- Check scope mencakup `https://www.googleapis.com/auth/spreadsheets`

---

**Status**: ✅ Delete fix deployed, perlu testing manual untuk verify
2. Tekan F12 untuk buka Developer Console
3. Pilih tab "Console"

### **Step 2: Clear Auth Data Paksa**
```javascript
// Paste script ini di console:
localStorage.removeItem('stockmanager_auth');
sessionStorage.clear();
if (window.gapi && window.gapi.auth2) {
  const authInstance = window.gapi.auth2.getAuthInstance();
  if (authInstance) {
    authInstance.signOut();
    authInstance.disconnect();
  }
}
location.reload();
```

### **Step 3: Login Ulang dan Monitor Console**
1. Klik "Sign in with Google"
2. Monitor console untuk debugging messages:
   - `🔐 Starting authentication...`
   - `✅ Authentication successful, getting user profile...`
   - `🔍 [DEBUG] Calling getUserProfile...`
   - `👤 [DEBUG] User profile retrieved:` 
   - `🔍 [DEBUG] Profile name:` - **INI YANG PENTING**

### **Step 4: Test Profile Component**
1. Navigasi ke halaman "Debug" di aplikasi
2. Scroll ke bawah sampai "🧪 Google Profile Test"
3. Klik "Test Get Profile"
4. Lihat hasil di component dan console

## 🔍 Kemungkinan Penyebab

### **1. Scope Permission Issue**
- Google belum approve permission untuk profile access
- Perlu re-authorize dengan scope baru

### **2. Cached Auth Data**
- Data lama masih tersimpan di localStorage
- Google Auth instance masih pakai data lama

### **3. API Loading Issue**
- `window.gapi.auth2` belum fully loaded
- Timing issue saat ambil profile

### **4. Google Account Setting**
- Account setting tidak allow profile sharing
- Business account dengan restricted permissions

## 🛠️ Solusi Bertahap

### **Solusi 1: Force Clear & Re-login**
```javascript
// Console command:
localStorage.clear();
sessionStorage.clear();
if (window.gapi?.auth2) {
  window.gapi.auth2.getAuthInstance().signOut();
}
location.reload();
```

### **Solusi 2: Test Profile Direct**
```javascript
// Console command saat sudah login:
const authInstance = window.gapi.auth2.getAuthInstance();
const user = authInstance.currentUser.get();
const profile = user.getBasicProfile();
console.log('Direct name:', profile.getName());
console.log('Direct email:', profile.getEmail());
```

### **Solusi 3: Manual Profile Set**
```javascript
// Jika direct access berhasil tapi service tidak:
const profile = { 
  name: 'NAMA_ANDA_DISINI', 
  email: 'EMAIL_ANDA_DISINI' 
};
localStorage.setItem('stockmanager_auth', JSON.stringify({
  isAuthenticated: true,
  user: profile
}));
location.reload();
```

## 📊 Expected Debug Output

### **Normal Flow:**
```
🔐 Starting authentication...
✅ Authentication successful, getting user profile...
🔍 [DEBUG] Calling getUserProfile...
👤 [DEBUG] Starting getUserProfile...
🔍 [DEBUG] Auth instance available: true
🔍 [DEBUG] User is signed in: true
🔍 [DEBUG] Basic profile available: true
🔍 [DEBUG] Profile name: John Doe
🔍 [DEBUG] Profile email: john@gmail.com
✅ [DEBUG] Final user profile: {name: "John Doe", email: "john@gmail.com"}
💾 [DEBUG] Auth data user name: John Doe
```

### **Problem Flow:**
```
🔐 Starting authentication...
✅ Authentication successful, getting user profile...
🔍 [DEBUG] Calling getUserProfile...
👤 [DEBUG] Starting getUserProfile...
❌ [DEBUG] No auth instance available
✅ [DEBUG] Final user profile: {name: "Google User (No Instance)", email: "user@gmail.com"}
💾 [DEBUG] Auth data user name: Google User (No Instance)
```

## 📋 Checklist Debugging

- [ ] Console menampilkan debug messages
- [ ] `window.gapi` available
- [ ] `window.gapi.auth2` available  
- [ ] Auth instance available
- [ ] User is signed in
- [ ] Basic profile available
- [ ] Profile name not empty
- [ ] Profile saved to localStorage
- [ ] UI updated dengan nama yang benar

## 🎯 Next Steps

1. **Jalankan aplikasi** dan buka console
2. **Login dan monitor** debug messages
3. **Test Profile component** di Debug page
4. **Report hasil** dari console untuk diagnosis lebih lanjut

---

**File ini akan di-update berdasarkan hasil debugging dari console.**
