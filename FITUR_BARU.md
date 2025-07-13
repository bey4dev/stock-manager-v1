# 🚀 Fitur Baru - Stock Manager System

## 📋 Fitur yang Ditambahkan

### 1. 👥 Manajemen Kontak
- **Penyimpanan data Customer dan Supplier**
- **Informasi lengkap**: Nama, Email, Telepon, Alamat, Perusahaan
- **Kategorisasi otomatis** antara Customer dan Supplier
- **Pencarian dan filter** berdasarkan tipe dan nama
- **CRUD operations** lengkap (Create, Read, Update, Delete)

### 2. 💰 Sistem Hutang Piutang
- **Tracking hutang uang** - catat hutang dalam bentuk uang
- **Tracking hutang barang** - catat hutang dalam bentuk produk/barang
- **Status pelunasan** - Pending, Sebagian, Lunas
- **Integrasi dengan kontak** - otomatis terhubung dengan data customer/supplier
- **Riwayat pembayaran** - catat setiap pembayaran atau penerimaan barang

### 3. 📊 Pencatatan Pembayaran
- **Pembayaran uang** - catat penerimaan uang untuk melunasi hutang
- **Penerimaan barang** - catat penerimaan barang untuk melunasi hutang produk
- **Riwayat transaksi** - semua pembayaran tercatat dengan timestamp
- **Update otomatis** - status hutang terupdate otomatis setelah pembayaran

### 4. 🔗 Integrasi Enhanced
- **Purchases Enhanced** - form pembelian sekarang terintegrasi dengan data supplier
- **Sales Enhanced** - form penjualan bisa terintegrasi dengan data customer
- **Data terstruktur** - semua data tersimpan rapi di Google Sheets

## 🗄️ Struktur Database Baru

### Sheet: Contacts
| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Name | Nama kontak |
| Type | customer / supplier |
| Email | Email address |
| Phone | Nomor telepon |
| Address | Alamat lengkap |
| Company | Nama perusahaan |
| Notes | Catatan tambahan |
| CreatedAt | Tanggal dibuat |
| UpdatedAt | Tanggal diupdate |

### Sheet: Debts
| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| ContactID | ID kontak terkait |
| ContactName | Nama kontak |
| ContactType | customer / supplier |
| Type | money / product |
| Description | Deskripsi hutang |
| Amount | Jumlah uang (jika type=money) |
| ProductID | ID produk (jika type=product) |
| ProductName | Nama produk |
| Quantity | Jumlah barang |
| Status | pending / partial / completed |
| TotalAmount | Total nilai hutang |
| PaidAmount | Jumlah yang sudah dibayar |
| RemainingAmount | Sisa hutang |
| DueDate | Tanggal jatuh tempo |
| CreatedAt | Tanggal dibuat |
| UpdatedAt | Tanggal diupdate |
| Notes | Catatan |

### Sheet: DebtPayments
| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| DebtID | ID hutang terkait |
| Type | money / product |
| Amount | Jumlah pembayaran uang |
| Quantity | Jumlah barang diterima |
| PaymentDate | Tanggal pembayaran |
| Notes | Catatan pembayaran |
| CreatedAt | Tanggal record dibuat |

## 🚀 Cara Setup

### 1. Jalankan Setup Sheets
1. Buka file `setup-new-sheets.html` di browser
2. Klik tombol "Authenticate & Setup Sheets"
3. Login dengan akun Google yang memiliki akses ke spreadsheet
4. Tunggu proses setup selesai

### 2. Mulai Menggunakan
1. Buka aplikasi Stock Manager
2. Login seperti biasa
3. Akan terlihat menu baru:
   - **Kontak** - untuk mengelola customer dan supplier
   - **Hutang Piutang** - untuk mengelola hutang dan pembayaran

## 📱 Cara Penggunaan

### Mengelola Kontak
1. Klik menu "Kontak"
2. Klik "Tambah Kontak" untuk menambah customer/supplier baru
3. Isi data lengkap kontak
4. Pilih tipe: Customer atau Supplier
5. Simpan data

### Mengelola Hutang
1. Klik menu "Hutang Piutang"
2. Klik "Tambah Hutang" untuk mencatat hutang baru
3. Pilih kontak dari dropdown (otomatis dari data Kontak)
4. Pilih tipe hutang:
   - **Hutang Uang**: Masukkan jumlah uang
   - **Hutang Barang**: Pilih produk dan jumlah
5. Set tanggal jatuh tempo (optional)
6. Simpan data

### Mencatat Pembayaran
1. Di halaman "Hutang Piutang", klik icon ✅ pada hutang yang ingin dibayar
2. Pilih tipe pembayaran:
   - **Pembayaran Uang**: Masukkan jumlah uang yang diterima
   - **Penerimaan Barang**: Masukkan jumlah barang yang diterima
3. Tambahkan catatan jika perlu
4. Klik "Konfirmasi Pembayaran"
5. Status hutang akan terupdate otomatis

### Enhanced Purchases
1. Form pembelian sekarang menampilkan dropdown supplier dari data Kontak
2. Bisa pilih supplier yang sudah ada atau masukkan supplier baru
3. Data supplier baru bisa ditambahkan ke Kontak nanti

## 🎯 Fitur Unggulan

### 1. Smart Integration
- Semua komponen terhubung dan sinkron
- Data kontak otomatis tersedia di form pembelian/penjualan
- Hutang terintegrasi dengan produk dan kontak

### 2. Real-time Updates
- Status hutang terupdate otomatis saat ada pembayaran
- Riwayat pembayaran tersimpan lengkap
- Dashboard metrics terupdate real-time

### 3. Flexible Debt Types
- **Hutang Uang**: Untuk mencatat hutang dalam bentuk uang
- **Hutang Barang**: Untuk mencatat hutang dalam bentuk produk
- **Mixed Payments**: Bisa bayar hutang barang dengan uang atau sebaliknya

### 4. Comprehensive Reporting
- Summary cards dengan statistik hutang
- Filter berdasarkan customer/supplier, status, dll
- Export data ke format yang diinginkan

## 🔧 Technical Features

### Modern UI/UX
- Responsive design untuk mobile dan desktop
- Clean, modern interface dengan Tailwind CSS
- Intuitive navigation dan user flow

### Data Validation
- Form validation lengkap
- Error handling yang robust
- Data consistency checks

### Performance
- Lazy loading untuk data besar
- Optimized API calls
- Efficient state management

## 📞 Support

Jika ada pertanyaan atau butuh bantuan dengan fitur baru ini, silakan:
1. Cek dokumentasi di file README ini
2. Gunakan fitur Debug di aplikasi untuk troubleshooting
3. Hubungi developer untuk support teknis

---

## 🎉 Selamat Menggunakan Fitur Baru!

Fitur-fitur baru ini akan membantu Anda mengelola bisnis dengan lebih baik:
- Kontak customer dan supplier terorganisir
- Hutang piutang terkontrol dengan baik
- Pembayaran tercatat rapi
- Laporan yang lebih komprehensif

**Happy Managing!** 🚀📊💼
