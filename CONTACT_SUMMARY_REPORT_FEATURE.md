# CONTACT SUMMARY REPORT FEATURE

## 📊 Fitur Baru: Contact Summary Report

### 🎯 Tujuan
Fitur ini membuat laporan ringkasan hutang untuk setiap kontak yang disimpan di Google Sheets dalam sheet "ContactSummary". Laporan ini memudahkan tracking dan analisis hutang piutang per customer/supplier.

## 📋 Informasi yang Tercatat

### 1. **Data Kontak**
- **Contact ID**: ID unik kontak
- **Nama Kontak**: Nama customer/supplier  
- **Tipe**: Customer atau Supplier

### 2. **Data Finansial**
- **Total Hutang Awal**: Total nilai hutang yang pernah dibuat
- **Total Terbayar**: Total yang sudah dibayarkan
- **Sisa Hutang**: Hutang yang masih outstanding
- **Titip Uang**: Saldo customer yang dititipkan 
- **Titip Barang**: Nilai barang yang dititipkan customer
- **Cash Out**: Uang yang sudah dicairkan ke customer
- **Saldo Bersih**: Hasil kalkulasi akhir (positif = hutang, negatif = titip)

### 3. **Data Statistik**
- **Jumlah Hutang**: Total record hutang yang pernah dibuat
- **Hutang Lunas**: Jumlah hutang yang sudah completed
- **Tgl Hutang Terakhir**: Tanggal hutang terakhir dibuat
- **Tgl Bayar Terakhir**: Tanggal pembayaran terakhir
- **Status**: HUTANG / TITIP_UANG / LUNAS
- **Tgl Report**: Timestamp when report generated

## 🚀 Cara Menggunakan

### 1. **Manual Generate Report**
- Buka halaman "Manajemen Hutang"
- Klik tombol **"Generate Report"** (ikon ungu dengan grafik)
- System akan membuat/update sheet "ContactSummary" di Google Sheets

### 2. **Auto Generate Report**
Report akan otomatis ter-generate setiap kali:
- ✅ Menambah hutang baru
- ✅ Melakukan pembayaran hutang
- ✅ Cash out saldo customer

### 3. **Melihat Report di Google Sheets**
- Buka Google Sheets yang terhubung
- Pilih sheet tab **"ContactSummary"**
- Lihat data terlengkap per kontak

## 📊 Format Sheet ContactSummary

| Kolom | Field | Deskripsi |
|-------|--------|-----------|
| A | Contact ID | ID unik kontak |
| B | Nama Kontak | Nama customer/supplier |
| C | Tipe | customer/supplier |
| D | Total Hutang Awal | Total nilai hutang original |
| E | Total Terbayar | Total yang sudah dibayar |
| F | Sisa Hutang | Hutang yang belum lunas |
| G | Titip Uang | Saldo titip uang customer |
| H | Titip Barang | Nilai barang titip customer |
| I | Cash Out | Uang yang sudah dicairkan |
| J | Saldo Bersih | Net balance final |
| K | Jumlah Hutang | Count total hutang |
| L | Hutang Lunas | Count hutang completed |
| M | Tgl Hutang Terakhir | Last debt creation date |
| N | Tgl Bayar Terakhir | Last payment date |
| O | Status | HUTANG/TITIP_UANG/LUNAS |
| P | Tgl Report | Report generation timestamp |

## 🔍 Status Explanation

### **HUTANG** (Saldo Bersih > 0)
- Customer/supplier masih memiliki hutang outstanding
- Perlu ditagih atau dibayar

### **TITIP_UANG** (Saldo Bersih < 0)  
- Customer memiliki saldo positive (credit balance)
- Bisa digunakan untuk bayar hutang future atau dicairkan

### **LUNAS** (Saldo Bersih = 0)
- Tidak ada outstanding balance
- Semua hutang sudah lunas dan tidak ada titip uang

## 📱 UI Enhancements

### 1. **Tombol Generate Report**
- Lokasi: Header area, sebelah tombol "Pembayaran Hutang"
- Warna: Purple (ungu) dengan icon chart
- Status: Disabled saat loading

### 2. **Enhanced Contact Table**
- **Kolom baru**: "Tgl Bayar Terakhir"
- **Info tambahan**: Tanggal hutang terakhir di bawah nama kontak
- **Colspan update**: Dari 7 menjadi 8 kolom

### 3. **Auto-refresh Logic**
- Report auto-generate dengan delay 1 detik setelah transaction
- Mencegah spam request ke Google Sheets API

## 🛠️ Technical Implementation

### 1. **Data Processing**
```javascript
// Enhanced contact summary dengan tracking dates
const summaries = {
  contactName: string,
  lastDebtDate: string,     // ← NEW
  lastPaymentDate: string,  // ← NEW
  contactId: string,        // ← NEW
  // ...existing fields
}
```

### 2. **Google Sheets Integration**
```javascript
// New method added to GoogleSheetsService
async clearSheetData(sheetName: string)

// Report generation
async generateContactSummaryReport()
```

### 3. **Auto-trigger Logic**
```javascript
// Auto-generate after debt/payment changes
setTimeout(() => {
  generateContactSummaryReport();
}, 1000);
```

## 📈 Benefits

### 1. **For Business Owner**
- ✅ Clear overview per customer/supplier
- ✅ Easy tracking of payment behavior  
- ✅ Historical payment dates
- ✅ Quick identification of outstanding debts

### 2. **For Accounting**
- ✅ Structured data export to Google Sheets
- ✅ Ready for further analysis or reporting
- ✅ Timestamped reports for audit trail
- ✅ Automatic categorization (HUTANG/TITIP/LUNAS)

### 3. **For Customer Service**
- ✅ Quick lookup of customer status
- ✅ Last payment date information
- ✅ Clear debt vs credit identification
- ✅ Historical debt creation patterns

## 🔄 Next Possible Enhancements

1. **Export to Excel**: Add button to download report as Excel file
2. **Date Range Filter**: Generate report for specific period
3. **Email Reports**: Auto-send report to stakeholders
4. **Chart Integration**: Visual representation of debt distribution
5. **Aging Analysis**: Show how long debts have been outstanding

---

**Status**: ✅ IMPLEMENTED  
**Sheet Created**: ContactSummary  
**Auto-Generation**: Enabled  
**UI Updated**: ✅ Added report button + enhanced table
