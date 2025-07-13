# DebtPayments Sheet Setup Guide

## 🎯 **Panduan Setup Sheet DebtPayments**

Sheet DebtPayments digunakan untuk menyimpan riwayat pembayaran hutang, baik pembayaran dengan uang maupun dengan produk.

### 📋 **Struktur Header DebtPayments**

| Kolom | Nama | Deskripsi | Tipe Data |
|-------|------|-----------|-----------|
| A | ID | Unique identifier untuk payment | String |
| B | DebtID | ID hutang yang dibayar | String |
| C | Type | Tipe pembayaran (money/product) | String |
| D | Amount | Jumlah uang (untuk tipe money) | Number |
| E | Quantity | Jumlah barang (untuk tipe product) | Number |
| F | ProductName | Nama produk (untuk tipe product) | String |
| G | PaymentDate | Tanggal pembayaran | Date |
| H | Notes | Catatan tambahan | String |
| I | CreatedAt | Timestamp pembuatan record | DateTime |

### ⚡ **Setup Otomatis**

#### **Option 1: Menggunakan HTML Tool**
1. Buka file `setup-debtpayments-headers.html`
2. Login ke Google account Anda
3. Klik "Check Authentication" untuk verifikasi
4. Klik "Setup Headers Otomatis"
5. Tunggu konfirmasi "Headers berhasil dibuat"

#### **Option 2: Copy-Paste Manual**
1. Buka spreadsheet Google Sheets
2. Pilih tab "DebtPayments"
3. Copy dan paste header berikut ke A1:I1:

```
ID	DebtID	Type	Amount	Quantity	ProductName	PaymentDate	Notes	CreatedAt
```

#### **Option 3: Google Sheets Formula**
1. Buka tab "DebtPayments"
2. Paste formula berikut di cell A1:

```
=ARRAYFORMULA({"ID"; "DebtID"; "Type"; "Amount"; "Quantity"; "ProductName"; "PaymentDate"; "Notes"; "CreatedAt"})
```

### 📊 **Contoh Data**

Setelah header dibuat, berikut contoh data yang bisa dimasukkan:

| ID | DebtID | Type | Amount | Quantity | ProductName | PaymentDate | Notes | CreatedAt |
|----|--------|------|--------|----------|-------------|-------------|-------|-----------|
| payment_001 | debt_001 | money | 500000 | | | 2025-01-08 | Pembayaran tunai | 2025-01-08 10:30:00 |
| payment_002 | debt_002 | product | | 10 | Beras 5kg | 2025-01-08 | Pembayaran dengan barang | 2025-01-08 11:00:00 |
| payment_003 | debt_003 | money | 250000 | | | 2025-01-08 | Pembayaran sebagian | 2025-01-08 11:30:00 |

### 🔍 **Verifikasi Setup**

#### **Automated Verification**
1. Buka `setup-debtpayments-headers.html`
2. Klik "Verify Setup"
3. Periksa hasil verifikasi

#### **Manual Verification**
Pastikan:
- ✅ Header sudah terisi di baris pertama (A1:I1)
- ✅ Ada 9 kolom dari A sampai I
- ✅ Format header bold dan background abu-abu
- ✅ Tidak ada typo di nama kolom
- ✅ Sheet siap menerima data pembayaran hutang

#### **Verification Script**
```bash
node verify-debtpayments-headers.js
```

### 🔧 **Integrasi dengan Aplikasi**

#### **Data Flow Payment**
```typescript
// 1. User melakukan pembayaran di aplikasi
// 2. System creates PaymentRecord object
const payment: PaymentRecord = {
  id: `payment_${Date.now()}`,
  debtId: selectedDebt.id,
  type: 'money', // atau 'product'
  amount: 500000,
  quantity: undefined,
  productName: '',
  paymentDate: '2025-01-08',
  notes: 'Pembayaran tunai',
  createdAt: '2025-01-08 10:30:00'
};

// 3. Data disimpan ke Google Sheets DebtPayments
const paymentRowData = [
  payment.id,
  payment.debtId,
  payment.type,
  payment.amount || '',
  payment.quantity || '',
  payment.productName || '',
  payment.paymentDate,
  payment.notes,
  payment.createdAt
];
```

#### **Payment Types**

**Money Payment:**
- Type: "money"
- Amount: filled (jumlah uang)
- Quantity: empty
- ProductName: empty

**Product Payment:**
- Type: "product"
- Amount: empty
- Quantity: filled (jumlah barang)
- ProductName: filled (nama produk)

### 🚨 **Troubleshooting**

#### **Common Issues:**

**1. Headers tidak muncul**
- **Solusi**: Jalankan setup script ulang atau copy-paste manual

**2. Kolom tidak lengkap**
- **Solusi**: Pastikan range A1:I1 terisi semua (9 kolom)

**3. Sheet DebtPayments tidak ada**
- **Solusi**: Buat tab baru bernama "DebtPayments" di spreadsheet

**4. Permission denied**
- **Solusi**: Pastikan memiliki akses edit ke spreadsheet

**5. Data tidak tersimpan**
- **Solusi**: Periksa range DEBT_PAYMENTS di config/google-sheets.ts

### 📁 **Files Terkait**

- `setup-debtpayments-headers.html` - Interactive setup tool
- `setup-debtpayments-headers.js` - Setup script dan instruksi
- `verify-debtpayments-headers.js` - Verification script
- `src/components/Debts.tsx` - Payment functionality
- `src/config/google-sheets.ts` - Configuration

### 🔗 **Links**

- **Spreadsheet**: [Google Sheets Link](https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit)
- **Setup Tool**: `setup-debtpayments-headers.html`
- **Documentation**: `OVERPAYMENT_DISPLAY_ENHANCEMENT.md`

### ✅ **Success Checklist**

Setelah setup selesai:

- [ ] Headers sudah dibuat di DebtPayments sheet
- [ ] 9 kolom terisi dengan benar (A-I)
- [ ] Format headers sudah rapi (bold, background)
- [ ] Verification script menunjukkan VALID
- [ ] Test payment berfungsi di aplikasi
- [ ] Data payment tersimpan di sheet
- [ ] Overpayment calculation bekerja
- [ ] Payment history tampil dengan benar

---

## 🎉 **Setup Complete!**

DebtPayments sheet siap digunakan untuk:
- ✅ Tracking pembayaran hutang
- ✅ Recording payment history  
- ✅ Supporting overpayment calculations
- ✅ Enabling comprehensive debt management

🚀 **Ready to track payments with professional debt management system!**
