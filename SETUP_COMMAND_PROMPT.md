# 🚀 Setup Google Sheets via Command Prompt

Panduan ini akan membantu Anda membuat dan mengisi Google Sheets secara otomatis menggunakan command prompt, tanpa perlu copy-paste manual.

## 📋 Persiapan

### 1. Install Dependencies
```powershell
# Masuk ke folder project
cd "d:\Programing\Web-Aplication\Appku\vite-project"

# Install googleapis jika belum ada
npm install googleapis
```

### 2. Buat Service Account di Google Cloud Console

1. **Buka Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Pilih atau Buat Project:**
   - Gunakan project yang sama dengan aplikasi Anda

3. **Enable Google Sheets API:**
   - Navigation Menu → APIs & Services → Library
   - Search "Google Sheets API"
   - Klik "Enable"

4. **Buat Service Account:**
   - Navigation Menu → IAM & Admin → Service Accounts
   - Klik "Create Service Account"
   - Name: `stockmanager-service`
   - Description: `Service account for StockManager app`
   - Klik "Create and Continue"

5. **Buat Key untuk Service Account:**
   - Klik pada service account yang baru dibuat
   - Tab "Keys" → "Add Key" → "Create New Key"
   - Pilih format "JSON"
   - Download file JSON tersebut

6. **Simpan Key File:**
   - Rename file JSON menjadi `service-account-key.json`
   - Pindahkan ke folder project: `d:\Programing\Web-Aplication\Appku\vite-project\`

### 3. Share Spreadsheet dengan Service Account

1. **Buka spreadsheet Anda:**
   - https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit

2. **Klik tombol "Share" (pojok kanan atas)**

3. **Tambahkan service account email:**
   - Buka file `service-account-key.json` yang sudah didownload
   - Copy email dari field `"client_email"`
   - Contoh: `stockmanager-service@your-project.iam.gserviceaccount.com`

4. **Set permission ke "Editor"**

5. **Klik "Send"**

## 🛠️ Menjalankan Setup

### Command yang Tersedia:

```powershell
# Setup otomatis - buat sheet dan isi data
npm run setup-sheets

# Verifikasi sheet yang ada
npm run verify-sheets

# Info spreadsheet
npm run sheets-info
```

### Setup Lengkap (Langkah demi Langkah):

```powershell
# 1. Masuk ke folder project
cd "d:\Programing\Web-Aplication\Appku\vite-project"

# 2. Verifikasi setup saat ini
npm run verify-sheets

# 3. Jalankan setup otomatis
npm run setup-sheets

# 4. Verifikasi hasil setup
npm run verify-sheets
```

## 📊 Apa yang Dilakukan Script?

### 1. **Cek Sheet yang Ada**
   - Membaca struktur spreadsheet
   - Identifikasi sheet yang hilang

### 2. **Buat Sheet yang Kurang**
   - Products (8 kolom: ID, Name, Category, Price, Stock, Cost, Description, Status)
   - Sales (7 kolom: ID, Date, Product, Quantity, Price, Total, Customer)  
   - Purchases (7 kolom: ID, Date, Product, Quantity, Cost, Total, Supplier)
   - Dashboard (2 kolom: Key, Value)

### 3. **Isi Data Template**
   - Header dengan format bold dan background biru
   - Data sample untuk testing
   - Format sesuai kebutuhan aplikasi

### 4. **Verifikasi Hasil**
   - Konfirmasi semua sheet berhasil dibuat
   - Cek jumlah data di setiap sheet
   - Report hasil ke console

## 🔍 Contoh Output

### Verifikasi Awal:
```
🔍 Verifying sheets...

📋 Getting spreadsheet info...
📊 Spreadsheet: "StockManager Database"
🔗 URL: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit
📝 Existing sheets: Sheet1

📊 Verification Results:
❌ Products
❌ Sales
❌ Purchases
❌ Dashboard

⚠️ Missing sheets: Products, Sales, Purchases, Dashboard
Run "node setup-sheets-auto.js setup" to create them.
```

### Setup Proses:
```
🚀 Starting Google Sheets auto-setup...

🔐 Initializing Google Sheets API...
✅ Google Sheets API initialized

📋 Getting spreadsheet info...
📊 Spreadsheet: "StockManager Database"
📝 Existing sheets: Sheet1

📝 Creating missing sheets: Products, Sales, Purchases, Dashboard
➕ Creating sheet: Products
✅ Created sheet: Products
➕ Creating sheet: Sales
✅ Created sheet: Sales
➕ Creating sheet: Purchases
✅ Created sheet: Purchases
➕ Creating sheet: Dashboard
✅ Created sheet: Dashboard

📝 Populating sheets with template data...
📝 Populating sheet: Products
✅ Populated sheet: Products (6 rows)
📝 Populating sheet: Sales
✅ Populated sheet: Sales (5 rows)
📝 Populating sheet: Purchases
✅ Populated sheet: Purchases (4 rows)
📝 Populating sheet: Dashboard
✅ Populated sheet: Dashboard (7 rows)

🎉 Setup completed successfully!
🔗 Open your spreadsheet: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit
📱 Test in your app: http://localhost:5174
```

### Verifikasi Akhir:
```
📊 Verification Results:
✅ Products
✅ Sales
✅ Purchases
✅ Dashboard

🎉 All sheets are present!

📋 Checking data in sheets...
📄 Products: 6 rows (5 data rows)
📄 Sales: 5 rows (4 data rows)
📄 Purchases: 4 rows (3 data rows)
📄 Dashboard: 7 rows (6 data rows)
```

## 🔧 Troubleshooting

### Error: "service-account-key.json not found"
**Solusi:**
- Download service account key dari Google Cloud Console
- Rename menjadi `service-account-key.json`
- Pasti file ada di folder project

### Error: "403 Forbidden" atau "The caller does not have permission"
**Solusi:**
- Share spreadsheet dengan service account email
- Set permission ke "Editor"
- Email service account ada di file `service-account-key.json` field `client_email`

### Error: "Spreadsheet not found"
**Solusi:**
- Cek SPREADSHEET_ID di file `setup-sheets-auto.js`
- Pastikan spreadsheet bisa diakses
- Cek URL spreadsheet benar

### Script tidak jalan
**Solusi:**
```powershell
# Install googleapis
npm install googleapis

# Jalankan langsung
node setup-sheets-auto.js setup
```

## ✅ Hasil yang Diharapkan

Setelah menjalankan setup:

1. **4 Sheet tercipta dengan struktur yang benar**
2. **Data template terisi untuk testing**
3. **Header formatted (bold, background biru)**
4. **Aplikasi bisa baca data dari Google Sheets**
5. **User profile dari Google (bukan "Demo User")**

## 🚀 Test Aplikasi

Setelah setup selesai:

```powershell
# Jalankan aplikasi
npm run dev

# Buka browser: http://localhost:5174
# Login dengan Google
# Cek halaman Debug untuk verifikasi
# Pastikan data dari Google Sheets muncul
```

---

**💡 Tips:**
- Simpan file `service-account-key.json` dengan aman
- Jangan commit service account key ke Git
- Bisa jalankan setup berulang kali (aman, akan replace data lama)
- Gunakan `verify-sheets` untuk cek status kapan saja
