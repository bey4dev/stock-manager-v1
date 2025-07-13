# Database Google Sheets - Struktur dan Setup

## 📋 Ringkasan Perubahan

Struktur database Google Sheets telah ditingkatkan untuk mendukung semua fitur aplikasi Stock Manager. Sistem sekarang mendukung:

### ✅ Sheet yang Tersedia:
1. **Products** - Manajemen produk dan stok
2. **Sales** - Pencatatan penjualan
3. **Purchases** - Pencatatan pembelian stok (BARU/DIPERBARUI!)
4. **Contacts** - Data customer dan supplier
5. **Debts** - Hutang piutang uang dan barang
6. **DebtPayments** - Pembayaran dan pengiriman barang
7. **Dashboard** - Metrics dan statistik

### 🔧 Auto-Setup Features:
- ✅ Otomatis membuat sheet yang hilang saat login
- ✅ Otomatis menambah header yang hilang
- ✅ Validasi struktur database real-time
- ✅ Debug tools untuk verifikasi status

---

## 📊 Struktur Detail Setiap Sheet

### 1. Products Sheet
**Range**: `Products!A:H`
**Headers**: ID, Name, Category, Price, Stock, Cost, Description, Status

**Contoh Data**:
```
ID        | Name          | Category    | Price     | Stock | Cost      | Description       | Status
PROD001   | Laptop Dell   | Electronics | 15000000  | 5     | 12000000  | Laptop Dell       | Active
PROD002   | Mouse Wireless| Electronics | 150000    | 20    | 100000    | Mouse wireless    | Active
```

### 2. Sales Sheet  
**Range**: `Sales!A:G`
**Headers**: ID, Date, Product, Quantity, Price, Total, Customer

**Contoh Data**:
```
ID      | Date       | Product      | Quantity | Price     | Total     | Customer
SALE001 | 2024-01-15 | Laptop Dell  | 1        | 15000000  | 15000000  | John Doe
SALE002 | 2024-01-16 | Mouse        | 2        | 150000    | 300000    | Jane Smith
```

### 3. Purchases Sheet (BARU/DIPERBARUI!)
**Range**: `Purchases!A:G`
**Headers**: ID, Date, Product, Quantity, Cost, Total, Supplier

**Contoh Data**:
```
ID      | Date       | Product      | Quantity | Cost      | Total      | Supplier
PUR001  | 2024-01-10 | Laptop Dell  | 10       | 12000000  | 120000000  | PT. Teknologi Maju
PUR002  | 2024-01-12 | Mouse        | 50       | 100000    | 5000000    | CV. Aksesoris
```

### 4. Contacts Sheet
**Range**: `Contacts!A:J`
**Headers**: ID, Name, Type, Email, Phone, Address, Company, Notes, CreatedAt, UpdatedAt

**Contoh Data**:
```
ID      | Name              | Type     | Email            | Phone        | Address      | Company        | Notes          | CreatedAt  | UpdatedAt
CON001  | PT. Teknologi     | Supplier | info@tekno.com   | 021-1234567  | Jakarta      | PT. Teknologi  | Supplier utama | 2024-01-01 | 2024-01-01
CON002  | John Doe          | Customer | john@email.com   | 08123456789  | Jakarta      | PT. ABC        | Customer tetap | 2024-01-01 | 2024-01-01
```

### 5. Debts Sheet
**Range**: `Debts!A:R`
**Headers**: ID, ContactID, ContactName, ContactType, Type, Description, Amount, ProductID, ProductName, Quantity, Status, TotalAmount, PaidAmount, RemainingAmount, DueDate, CreatedAt, UpdatedAt, Notes

**Contoh Data**:
```
ID      | ContactID | ContactName | ContactType | Type    | Description       | Amount   | ProductID | ProductName | Quantity | Status  | TotalAmount | PaidAmount | RemainingAmount | DueDate    | CreatedAt              | UpdatedAt              | Notes
DEBT001 | CON002    | John Doe    | Customer    | Money   | Pembayaran laptop | 5000000  |           |             | 0        | Unpaid  | 5000000     | 0          | 5000000         | 2024-02-15 | 2024-01-15T10:30:00Z  | 2024-01-15T10:30:00Z  | Cicilan laptop
DEBT002 | CON001    | PT. Tekno   | Supplier    | Product | Barang belum      | 0        | PROD001   | Laptop Dell | 5        | Pending | 60000000    | 0          | 60000000        | 2024-01-25 | 2024-01-10T08:15:00Z  | 2024-01-10T08:15:00Z  | Menunggu pengiriman
```

**Format Waktu**:
- **CreatedAt**: Timestamp WIB saat data dibuat (format ISO dengan adjustment WIB)
- **UpdatedAt**: Timestamp WIB saat data terakhir diubah
- **DueDate**: Tanggal jatuh tempo (format YYYY-MM-DD)
- **Display**: Waktu ditampilkan dalam format Indonesia WIB di tabel dan card view

### 6. DebtPayments Sheet
**Range**: `DebtPayments!A:H`
**Headers**: ID, DebtID, Type, Amount, Quantity, PaymentDate, Notes, CreatedAt

### 7. Dashboard Sheet
**Range**: `Dashboard!A:B`
**Headers**: Key, Value

**Contoh Data**:
```
Key               | Value
total_products    | 25
total_sales       | 50
total_purchases   | 30
total_revenue     | 75000000
total_expenses    | 45000000
profit_margin     | 40
```

---

## 🚀 Setup dan Verifikasi

### Automatisasi Setup
1. **Login ke aplikasi** - sistem akan otomatis:
   - Cek sheet yang ada
   - Buat sheet yang hilang
   - Tambah header yang hilang
   - Validasi struktur

### Manual Verification
1. **Melalui Debug Page**:
   - Buka halaman Debug di aplikasi
   - Klik "Check Database Status"
   - Klik "Force Setup Sheets" jika perlu

2. **Melalui Browser Console**:
   ```javascript
   // Setelah login, jalankan di browser console:
   checkDatabaseStatus()
   ```

### Google Sheets Manual Setup
**URL Spreadsheet**: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit

Jika perlu setup manual:
1. Buat sheet dengan nama sesuai konfigurasi
2. Tambah header di row 1 sesuai struktur di atas
3. Data akan otomatis tersinkron dari aplikasi

---

## 🔧 Files yang Dimodifikasi

### 1. GoogleSheetsService.ts
- ✅ Tambah `validateAndSetupSheets()` - otomatis setup structure
- ✅ Tambah `createMissingSheets()` - buat sheet yang hilang
- ✅ Tambah `setupSheetHeaders()` - buat header otomatis
- ✅ Tambah `debugDatabaseStatus()` - debug tools
- ✅ Tambah `forceSetupSheets()` - manual trigger setup

### 2. Debug.tsx
- ✅ Tambah button "Force Setup Sheets"
- ✅ Tambah button "Check Database Status"
- ✅ Integrasi dengan debug tools

### 3. Purchases.tsx
- ✅ Layout grid cards identik dengan Products
- ✅ Struktur data sesuai dengan Purchases sheet
- ✅ Filter dan search functionality
- ✅ Responsive design

### 4. Scripts Tambahan
- ✅ `verify-sheets-structure.js` - dokumentasi struktur
- ✅ `database-status-check.js` - tools verifikasi

---

## 📱 Fitur yang Didukung

### Halaman Purchases (Pembelian Stok)
- ✅ Layout modern dengan grid cards
- ✅ Filter berdasarkan supplier, produk, tanggal
- ✅ Stats cards: Total Pembelian, Item Unik, Total Biaya, Rata-rata Biaya
- ✅ Empty state yang informatif
- ✅ Responsive design identik dengan Products

### Integration dengan Google Sheets
- ✅ Auto-sync data purchases
- ✅ Real-time validation
- ✅ Error handling dan retry mechanism
- ✅ Debug tools untuk troubleshooting

### Database Management
- ✅ Otomatis setup struktur
- ✅ Validasi data consistency
- ✅ Backup dan recovery capability
- ✅ Performance optimization

---

## 🔍 Troubleshooting

### Jika Sheet Tidak Muncul:
1. Buka Debug page
2. Klik "Force Setup Sheets"
3. Refresh aplikasi
4. Cek browser console untuk error details

### Jika Data Tidak Tersimpan:
1. Cek koneksi internet
2. Verifikasi autentikasi Google
3. Cek permission Google Sheets
4. Jalankan database status check

### Jika Layout Purchases Tidak Sesuai:
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Restart development server

---

## ✅ Status Complete

**Database Structure**: ✅ COMPLETE
**Auto-Setup System**: ✅ COMPLETE  
**Purchases Layout**: ✅ COMPLETE
**Debug Tools**: ✅ COMPLETE
**Documentation**: ✅ COMPLETE

Semua struktur database telah ditambahkan dan sistem otomatisasi sudah berjalan. Aplikasi siap digunakan dengan fitur lengkap!
