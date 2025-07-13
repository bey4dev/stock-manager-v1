# PRODUCT PAYMENT DEBUGGING GUIDE

## 🔍 Status Terkini
- ✅ Perhitungan matematika sudah benar (verified dengan test)
- ✅ Struktur data payment record sudah benar
- ✅ Validasi tipe data sudah ditambahkan
- ✅ Debug logging sudah ditingkatkan
- ✅ Mode selection (Terima/Berikan) sudah ditambahkan ke UI

## 🧪 Cara Testing

### 1. Akses Aplikasi
- Buka browser: http://localhost:5175/
- Login dengan akun Google Sheets
- Masuk ke halaman "Manajemen Hutang"

### 2. Test Product Payment
1. **Buat Hutang Barang dulu** (jika belum ada):
   - Klik "Tambah Hutang"
   - Pilih customer
   - Pilih "Hutang Barang"
   - Pilih produk dan quantity
   - Simpan

2. **Test Pembayaran dengan Barang**:
   - Klik "Pembayaran Hutang" 
   - Pilih mode "Terima" (📥)
   - Pilih "Barang" sebagai tipe pembayaran
   - Pilih customer yang sama
   - Pilih produk yang sama
   - Masukkan quantity (lebih kecil dari hutang)
   - Submit

### 3. Monitoring Console
- Buka Developer Tools (F12)
- Lihat tab Console
- Cari log dengan prefix `[DEBUG PRODUCT PAYMENT]`
- Perhatikan:
  - Customer debts yang ditemukan
  - Calculation results
  - Payment record structure  
  - Google Sheets response

## 🔧 Debugging Points

### A. Cek Data Hutang
Pastikan ada hutang barang dengan:
- ✅ `type: 'product'`
- ✅ `status: 'pending'` atau `'partial'`
- ✅ `productId` yang sesuai
- ✅ `totalAmount > 0`
- ✅ `quantity > 0`

### B. Cek Perhitungan
Console akan menampilkan:
```
[DEBUG PRODUCT PAYMENT] Calculation: {
  qtyApply: 5,
  pricePerUnit: 10000,
  amountToApply: 50000,
  calculation: "10000 × 5 = 50000",
  amountType: "number",
  isValidNumber: true
}
```

### C. Cek Payment Record
Console akan menampilkan:
```
[DEBUG PRODUCT PAYMENT] Payment record created: {
  ID: "payment_...",
  DebtID: "DEBT_...",
  Type: "product",
  Amount: 50000,  ← HARUS BERUPA NUMBER!
  Quantity: 5,
  ...
}
```

### D. Cek Google Sheets Response
Console akan menampilkan:
```
[DEBUG APPEND] Rows to append: [[...]]
✅ Successfully appended to DebtPayments: {...}
```

## 🚨 Kemungkinan Masalah

### 1. Data Hutang Tidak Ditemukan
- Periksa filter di `customerDebts`
- Pastikan `productId` cocok
- Pastikan status bukan `'completed'`

### 2. Amount = 0 di Google Sheets
- Periksa format kolom D di Google Sheets (harus Number)
- Periksa apakah ada formula yang override
- Periksa permission write ke sheet

### 3. Error pada Google Sheets API
- Periksa authentication
- Periksa spreadsheet ID
- Periksa sheet name ("DebtPayments")

## 🛠️ Next Steps Jika Masih Error

1. **Capture Console Logs**:
   - Screenshot semua debug logs
   - Kirim hasil ke developer

2. **Manual Check Google Sheets**:
   - Buka Google Sheets DebtPayments
   - Cek apakah row baru ditambahkan
   - Cek nilai di kolom D (Amount)

3. **Verify Sheet Structure**:
   ```
   A: ID | B: DebtID | C: Type | D: Amount | E: Quantity | F: ProductName | ...
   ```

## ✅ Expected Success Flow

1. User submit payment form
2. Console: `[DEBUG CUSTOMER DEBTS] Found customer debts`
3. Console: `[DEBUG PRODUCT PAYMENT] Starting product payment`
4. Console: `[DEBUG PRODUCT PAYMENT] Processing debt`
5. Console: `[DEBUG PRODUCT PAYMENT] Calculation` (amount > 0)
6. Console: `[DEBUG PRODUCT PAYMENT] Payment record created` (Amount is number)
7. Console: `[DEBUG APPEND] Rows to append`
8. Console: `✅ Successfully appended to DebtPayments`
9. UI: Success modal appears
10. Google Sheets: New row with correct Amount value

Jika step manapun gagal, periksa log detail pada step tersebut.
