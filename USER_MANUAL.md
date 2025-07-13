# USER MANUAL - STOCK MANAGER NEW FEATURES

## 📋 OVERVIEW

Stock Manager telah diperbarui dengan fitur-fitur baru yang lebih modern dan konsisten. Semua waktu sekarang menggunakan format WIB (Waktu Indonesia Barat) dan interface telah diperbarui untuk kemudahan penggunaan.

## 🕐 SISTEM WAKTU WIB

### Fitur Baru:
- **Konsistensi Waktu**: Semua tanggal dan waktu ditampilkan dalam format WIB
- **Format Tampilan**: DD/MM/YYYY HH:mm (contoh: 07/01/2025 14:30)
- **Input Waktu**: Menggunakan pemilih tanggal dan waktu yang mudah digunakan

### Cara Penggunaan:
1. Semua input waktu otomatis menggunakan zona waktu WIB
2. Tidak perlu mengonversi waktu manual
3. Semua laporan dan data tersimpan dalam format WIB

## 🛍️ PEMBELIAN STOK (PURCHASES)

### Fitur Baru:
- **Layout Modern**: Tampilan kartu yang rapi dan responsive
- **Statistik Real-time**: Ringkasan total pembelian, pending, dan lunas
- **Filter Canggih**: Pencarian berdasarkan nama, supplier, dan tanggal
- **Input Waktu**: Mencatat tanggal DAN jam pembelian

### Cara Menggunakan:

#### Menambah Pembelian Baru:
1. Klik tombol "Tambah Pembelian"
2. Pilih **Supplier** dari dropdown (bukan ketik manual)
3. Masukkan **Tanggal & Waktu** pembelian
4. Isi detail produk (nama, kuantitas, harga)
5. Pilih status pembayaran
6. Klik "Simpan"

#### Fitur Supplier Otomatis:
- Jika supplier belum ada, ketik nama baru
- Sistem otomatis menyimpan supplier baru ke daftar kontak
- Supplier baru bisa langsung digunakan untuk pembelian selanjutnya

## 👥 KONTAK (CONTACTS)

### Fitur Baru:
- **Ringkasan Hutang/Piutang**: Total otomatis per kontak
- **Statistik Lengkap**: Jumlah transaksi, sisa hutang, sudah dibayar
- **Update Terakhir**: Timestamp transaksi terakhir
- **Tampilan Mobile**: Kartu responsive untuk HP

### Informasi yang Ditampilkan:
- **Total Hutang**: Jumlah keseluruhan hutang
- **Total Piutang**: Jumlah keseluruhan piutang
- **Sisa Hutang**: Hutang yang belum dibayar
- **Sisa Piutang**: Piutang yang belum dibayar
- **Jumlah Transaksi**: Total transaksi dengan kontak
- **Status Pending**: Transaksi yang belum selesai

## 💳 PEMBAYARAN HUTANG

### Fitur Baru:
- **Pembayaran dengan Barang**: Bayar hutang pakai produk
- **Auto-Piutang**: Kelebihan pembayaran otomatis jadi piutang
- **Nilai Otomatis**: Harga barang dihitung otomatis dari inventori

### Cara Menggunakan:

#### Pembayaran Tunai:
1. Pilih hutang yang akan dibayar
2. Klik "Bayar Hutang"
3. Pilih "Pembayaran Tunai"
4. Masukkan jumlah pembayaran
5. Klik "Proses Pembayaran"

#### Pembayaran dengan Barang:
1. Pilih hutang yang akan dibayar
2. Klik "Bayar Hutang"
3. Pilih "Pembayaran Barang"
4. Ketik nama produk (akan muncul suggestion)
5. Masukkan jumlah/kuantitas barang
6. Sistem otomatis hitung nilai berdasarkan harga produk
7. Klik "Proses Pembayaran"

#### Auto-Piutang:
- Jika pembayaran **melebihi hutang**, kelebihan otomatis jadi piutang
- Sistem otomatis buat transaksi piutang baru
- Notifikasi akan muncul menginformasikan kelebihan pembayaran

## 📊 DASHBOARD & LAPORAN

### Fitur yang Diperbarui:
- **Statistik Real-time**: Data selalu update otomatis
- **Format Waktu WIB**: Semua laporan menggunakan zona waktu WIB
- **Konsistensi Data**: Data tersinkronisasi di semua halaman

## 🔧 TIPS PENGGUNAAN

### Untuk Efisiensi:
1. **Tambahkan Supplier Sekali**: Supplier otomatis tersimpan untuk digunakan lagi
2. **Gunakan Filter**: Cari data dengan cepat menggunakan filter pencarian
3. **Pantau Dashboard**: Lihat ringkasan bisnis real-time di dashboard
4. **Bayar Hutang Berkala**: Gunakan fitur pembayaran untuk kelola cash flow

### Untuk Akurasi:
1. **Input Waktu Tepat**: Gunakan datetime picker untuk akurasi waktu
2. **Cek Ringkasan Kontak**: Verifikasi total hutang/piutang secara berkala
3. **Gunakan Pembayaran Barang**: Manfaatkan inventori untuk pembayaran

## 🆘 TROUBLESHOOTING

### Masalah Umum:

#### Supplier Tidak Muncul:
- Pastikan supplier sudah ditambahkan ke kontak
- Refresh halaman jika diperlukan
- Periksa koneksi internet

#### Waktu Tidak Sesuai:
- Sistem otomatis menggunakan WIB
- Pastikan zona waktu device sesuai
- Refresh browser jika diperlukan

#### Data Tidak Tersinkronisasi:
- Refresh halaman
- Periksa koneksi internet
- Pastikan Google Sheets terhubung

## 📞 BANTUAN

Jika mengalami masalah:
1. Refresh halaman terlebih dahulu
2. Periksa koneksi internet
3. Pastikan Google Sheets dapat diakses
4. Hubungi administrator sistem

---

**Versi Manual**: 2.0  
**Terakhir Diperbarui**: 07 Januari 2025  
**Kompatibel dengan**: Chrome, Firefox, Safari, Edge
