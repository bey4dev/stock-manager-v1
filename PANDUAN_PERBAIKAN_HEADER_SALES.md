# Panduan Perbaikan Header Sales Sheet

## 🎯 Masalah yang Diperbaiki

Header Sales sheet di Google Spreadsheet perlu disesuaikan dengan struktur aplikasi yang baru. Struktur lama hanya memiliki 7 kolom (A-G), sedangkan struktur baru membutuhkan 15 kolom (A-O) untuk mendukung sistem pricing fleksibel.

## 📋 Struktur Header yang Benar

### Header Baru (15 Kolom):
```
ID | Date | Product | Quantity | Price | FinalPrice | Total | Customer | CustomerType | DiscountType | DiscountValue | PromoCode | OriginalTotal | Savings | Notes
```

### Mapping Kolom:
- **A: ID** - Unique identifier
- **B: Date** - Tanggal penjualan (WIB)
- **C: Product** - Nama produk
- **D: Quantity** - Jumlah item
- **E: Price** - Harga satuan original
- **F: FinalPrice** - Harga satuan setelah diskon ⭐ BARU
- **G: Total** - Total harga final
- **H: Customer** - Nama customer
- **I: CustomerType** - regular/reseller/wholesale ⭐ BARU
- **J: DiscountType** - none/percentage/fixed/promo ⭐ BARU
- **K: DiscountValue** - Nilai diskon ⭐ BARU
- **L: PromoCode** - Kode promo ⭐ BARU
- **M: OriginalTotal** - Total sebelum diskon ⭐ BARU
- **N: Savings** - Jumlah yang dihemat ⭐ BARU
- **O: Notes** - Catatan tambahan ⭐ BARU

## 🔧 Cara Perbaikan

### Opsi 1: Menggunakan Tool HTML
1. Buka file `fix-sales-headers.html` di browser
2. Klik tombol "📋 Copy Header (Tab-separated)"
3. Buka Google Sheets Sales
4. Backup data existing (duplikat sheet)
5. Pilih A1:O1 dan paste header

### Opsi 2: Manual Setup
1. Buka Google Sheets: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit
2. Pilih sheet "Sales"
3. Backup data (duplikat sheet menjadi "Sales_backup")
4. Copy header berikut ke A1:
   ```
   ID	Date	Product	Quantity	Price	FinalPrice	Total	Customer	CustomerType	DiscountType	DiscountValue	PromoCode	OriginalTotal	Savings	Notes
   ```
5. Format header (bold, background)
6. Sesuaikan lebar kolom
7. Freeze header row

## 🔍 Verifikasi

### Menggunakan Script Verifikasi
1. Buka aplikasi Stock Manager
2. Login ke Google Sheets
3. Buka browser console (F12)
4. Load script: copy-paste isi file `verify-headers-setup.js`
5. Jalankan: `verifyHeadersSetup()`

### Ciri-ciri Header Sudah Benar:
- ✅ Ada 15 kolom (A sampai O)
- ✅ Nama header sesuai dengan yang dibutuhkan aplikasi
- ✅ Tidak ada error di console saat menjalankan aplikasi
- ✅ Data sales baru tersimpan dengan lengkap

## 📊 Contoh Data dengan Header Baru

| ID | Date | Product | Qty | Price | FinalPrice | Total | Customer | CustomerType | DiscountType | DiscountValue | PromoCode | OriginalTotal | Savings | Notes |
|----|------|---------|-----|-------|------------|-------|----------|--------------|--------------|---------------|-----------|---------------|---------|-------|
| SAL_123 | 2025-07-08 10:00 | Produk A | 2 | 10000 | 9700 | 19400 | Toko ABC | reseller | none | | | 20000 | 600 | Auto reseller 3% |
| SAL_124 | 2025-07-08 10:05 | Produk B | 1 | 25000 | 20000 | 20000 | Customer XYZ | regular | percentage | 20 | | 25000 | 5000 | Loyal customer |

## ⚠️ Peringatan

1. **Backup Data**: Selalu backup data sales existing sebelum mengubah header
2. **Jangan Hapus Data**: Hanya ubah header di baris 1, jangan hapus data di baris 2 dst
3. **Urutan Kolom**: Pastikan urutan kolom sesuai dengan yang diminta (A-O)
4. **Konsistensi**: Gunakan nama header yang exact seperti yang tertera

## 🎉 Setelah Perbaikan

Setelah header diperbaiki, aplikasi akan:
- ✅ Menyimpan data sales dengan struktur lengkap
- ✅ Menampilkan informasi diskon dan penghematan
- ✅ Mendukung sistem pricing fleksibel
- ✅ Memberikan laporan yang lebih detail

## 📞 Troubleshooting

**Masalah**: Error "Range not found" atau data tidak tersimpan
**Solusi**: Pastikan range di config aplikasi sudah diupdate ke `Sales!A:O`

**Masalah**: Kolom kosong atau data tidak lengkap
**Solusi**: Pastikan urutan dan nama header sesuai dengan yang diminta

**Masalah**: Data lama tidak terbaca
**Solusi**: Data lama tetap akan terbaca, field baru akan diisi dengan nilai default

---

**File yang membantu:**
- `fix-sales-headers.html` - Tool setup interaktif
- `verify-headers-setup.js` - Script verifikasi
- `SALES_PRICING_DOCUMENTATION.md` - Dokumentasi lengkap

**Link Google Sheets:**
https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit
