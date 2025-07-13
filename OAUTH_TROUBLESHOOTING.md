# 🔧 Google OAuth Configuration Fix

## Masalah Umum Login Google Gagal

### 1. **Domain Tidak Diizinkan (redirect_uri_mismatch)**

**Solusi:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **APIs & Services** > **Credentials**
4. Klik pada OAuth 2.0 Client ID Anda
5. Di bagian **Authorized JavaScript origins**, tambahkan:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
6. Klik **Save**

### 2. **Client ID Tidak Valid**

**Pastikan:**
- Client ID di `src/config/google-sheets.ts` sesuai dengan Google Cloud Console
- Project di Google Cloud Console aktif dan billing enabled (jika diperlukan)

### 3. **API Tidak Diaktifkan**

**Aktifkan APIs:**
1. Buka **APIs & Services** > **Library**
2. Cari dan aktifkan:
   - Google Sheets API
   - Google Drive API (opsional)

### 4. **Browser / CORS Issues**

**Coba:**
- Gunakan mode incognito
- Clear browser cache dan cookies
- Disable browser extensions yang memblokir popup

### 5. **Test OAuth Config**

Gunakan tombol **🧪 Test OAuth Config** di halaman login untuk memverifikasi konfigurasi.

## Current Configuration

- **Client ID**: 752419828170-o835j9j32gmcmc9sdhcajnqoaikoh8j8.apps.googleusercontent.com
- **Expected Origins**: 
  - http://localhost:5173
  - http://127.0.0.1:5173
- **Scopes**: 
  - https://www.googleapis.com/auth/spreadsheets
  - https://www.googleapis.com/auth/userinfo.profile
  - https://www.googleapis.com/auth/userinfo.email

## Debug Steps

1. Klik **🔍 Debug Google API** untuk info detail
2. Klik **🧪 Test OAuth Config** untuk test konfigurasi
3. Buka Developer Tools (F12) untuk melihat console errors
4. Cek Network tab untuk failed requests

## Error Messages & Solutions

- **"redirect_uri_mismatch"** → Tambahkan localhost:5173 ke Authorized origins
- **"invalid_client"** → Periksa Client ID di config
- **"popup_blocked"** → Allow popups untuk localhost:5173
- **"origin_mismatch"** → Pastikan origin di console sama dengan yang dikonfigurasi
