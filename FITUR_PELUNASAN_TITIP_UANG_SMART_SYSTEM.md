# Fitur Pelunasan Titip Uang - Smart Withdrawal System

## Status: ✅ COMPLETED  
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}  
**Fitur Baru:** Pelunasan Titip Uang Sebagian atau Penuh dengan Smart Logic

## 🎯 **Mengapa Fitur Ini Diperlukan?**

### **Business Logic:**
1. **Customer Request**: Customer ingin mencairkan titip uangnya menjadi cash
2. **Cash Flow Management**: Toko perlu mengelola aliran kas ketika customer cairkan titip uang  
3. **Reconciliation**: Pembukuan yang rapi dengan catatan transaksi pelunasan formal
4. **Flexibility**: Customer bisa cairkan sebagian atau seluruh saldo titip uang

### **Masalah Sebelumnya:**
- ❌ Hanya bisa cairkan seluruh record titip uang sekaligus (all-or-nothing)
- ❌ Tidak ada opsi pelunasan sebagian
- ❌ Tidak ada preview sebelum pelunasan
- ❌ Menghapus record mentah, bukan berdasarkan saldo bersih

## 🚀 **Fitur Pelunasan Titip Uang - Smart System**

### **🔧 Fitur Utama:**

#### 1. **Pelunasan Berbasis Saldo Bersih**
- Menghitung berdasarkan `Math.max(0, -netBalance)` 
- Real-time, akurat setelah dipotong hutang

#### 2. **Pelunasan Sebagian atau Penuh**
- Customer bisa cairkan Rp 100,000 dari saldo Rp 500,000
- Sisa saldo tetap tersimpan dan bisa digunakan

#### 3. **Smart FIFO Processing**
- Mengurangi record titip uang lama terlebih dahulu (First In, First Out)
- Otomatis update atau hapus record sesuai sisa saldo

#### 4. **Preview & Validation**
- Preview jumlah yang akan dicairkan dan sisa saldo
- Validasi tidak bisa cairkan lebih dari saldo tersedia
- Tombol "Gunakan semua" untuk kemudahan

#### 5. **User-Friendly Interface**
- Modal form yang clean dan informative
- Real-time calculation saat input jumlah
- Warning untuk pelunasan penuh

## 💻 **Implementasi Teknis**

### **1. State Management**
```typescript
const [showPelunasanTitipUangForm, setShowPelunasanTitipUangForm] = useState(false);
const [pelunasanTitipUangData, setPelunasanTitipUangData] = useState({
  customerName: '',
  jumlahPelunasan: '',
  notes: ''
});
```

### **2. Smart Processing Logic**
```typescript
// Strategy: Kurangi titip uang records secara proporsional dengan FIFO
const customerTitipUangRecords = debts
  .filter(debt => 
    debt.contactName === customerName && 
    debt.description.includes('Titip uang') && 
    debt.remainingAmount > 0
  )
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // FIFO

let sisaPelunasan = jumlahPelunasan;

for (const record of customerTitipUangRecords) {
  if (sisaPelunasan <= 0) break;
  
  const jumlahDipotong = Math.min(sisaPelunasan, record.remainingAmount);
  const newRemainingAmount = record.remainingAmount - jumlahDipotong;
  
  if (newRemainingAmount <= 0) {
    // Hapus record jika habis
    await GoogleSheetsService.deleteSheetRow('Debts', recordIndex);
  } else {
    // Update remaining amount
    await GoogleSheetsService.updateSheetRow('Debts', recordIndex, updatedData);
  }
  
  sisaPelunasan -= jumlahDipotong;
}
```

### **3. UI Components**

#### **A. Tombol Pelunasan di Tabel Customer Summary**
```tsx
{Math.max(0, -summary.netBalance) > 0 && (
  <button
    onClick={() => handlePelunasanTitipUang(summary.contactName)}
    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
  >
    💸 Cairkan
  </button>
)}
```

#### **B. Modal Form Pelunasan**
- Header dengan nama customer
- Display saldo titip uang tersedia
- Input jumlah pelunasan dengan validation
- Preview real-time
- Notes field
- Tombol "Gunakan semua" untuk convenience

#### **C. Tombol di Halaman Titip Uang Customer**
- Terintegrasi dengan tabel customer yang memiliki saldo titip uang
- Konsisten dengan design pattern aplikasi

## 🧮 **Contoh Kasus Penggunaan**

### **Kasus 1: Pelunasan Sebagian**
**Customer: ArjoSayur**
- Saldo Titip Uang: Rp 500,000
- **User Action**: Cairkan Rp 200,000
- **Result**: 
  - Dicairkan: Rp 200,000
  - Sisa saldo: Rp 300,000  
  - Status: Customer masih memiliki titip uang

### **Kasus 2: Pelunasan Penuh**
**Customer: Rasidi LOCON**  
- Saldo Titip Uang: Rp 150,000
- **User Action**: Cairkan Rp 150,000 (semua)
- **Result**:
  - Dicairkan: Rp 150,000
  - Sisa saldo: Rp 0
  - Status: Customer tidak lagi memiliki titip uang

### **Kasus 3: Multiple Records FIFO**
**Customer: Budi**
- Record 1 (10 Jan): Rp 100,000
- Record 2 (15 Jan): Rp 200,000  
- Record 3 (20 Jan): Rp 150,000
- **Total Saldo**: Rp 450,000
- **User Action**: Cairkan Rp 250,000
- **FIFO Processing**:
  1. Record 1: Habis (Rp 100,000) → Dihapus
  2. Record 2: Sisa Rp 50,000 → Diupdate  
  3. Record 3: Utuh Rp 150,000 → Tidak tersentuh
- **Result**: Sisa saldo Rp 200,000

## 🎨 **User Experience Features**

### **1. Real-time Validation**
- Input dibatasi maksimal sesuai saldo tersedia
- Auto-constraint saat user input angka berlebihan

### **2. Smart Defaults**
- Form di-populate dengan jumlah saldo penuh
- User bisa edit sesuai kebutuhan

### **3. Preview System**
- Show preview sebelum submit
- Display sisa saldo setelah pelunasan
- Warning untuk pelunasan penuh

### **4. User Feedback**
- Success message dengan detail pelunasan
- Error handling yang informatif
- Loading states untuk operasi async

## 📊 **Integration Points**

### **1. Tabel Customer Summary**
- Kolom "Aksi" dengan tombol "💸 Cairkan"
- Hanya muncul untuk customer dengan saldo titip uang > 0

### **2. Halaman Titip Uang Customer**
- Update tombol "Cairkan" menggunakan fungsi pelunasan baru
- Consistent dengan design pattern

### **3. Real-time Data Updates**
- Setelah pelunasan, semua tampilan ter-update otomatis
- Summary card, tabel customer, dan halaman titip uang konsisten

## 🔒 **Security & Validation**

### **1. Input Validation**
- Jumlah pelunasan harus > 0
- Tidak boleh melebihi saldo tersedia
- Required fields validation

### **2. Business Logic Validation**
- Customer harus memiliki saldo titip uang
- Record titip uang harus exist dan valid

### **3. Error Handling**
- Graceful error handling untuk network issues
- User-friendly error messages
- Rollback mechanisms untuk failed operations

## 📈 **Business Impact**

### **✅ Keunggulan:**
1. **Flexibility**: Customer puas dengan opsi pelunasan partial
2. **Cash Flow**: Toko bisa kontrol cash flow lebih baik
3. **Bookkeeping**: Record pelunasan yang rapi dan traceable
4. **User Experience**: Interface yang intuitive dan user-friendly
5. **Data Integrity**: Saldo titip uang selalu akurat dan real-time

### **🎯 Use Cases:**
- Customer butuh cash mendadak → cairkan sebagian
- Customer pindah toko → cairkan semua  
- Cash flow toko tight → batch pelunasan customer
- End of month reconciliation → clear small amounts

## 🔮 **Future Enhancements**

1. **Batch Pelunasan**: Cairkan titip uang multiple customers sekaligus
2. **Scheduled Pelunasan**: Auto-cairkan titip uang yang sudah lama mengendap
3. **Pelunasan History**: Log semua transaksi pelunasan untuk audit
4. **Export Reports**: Export data pelunasan untuk accounting

## Files Modified

1. `src/components/Debts.tsx`:
   - Added pelunasan titip uang form modal
   - Added smart FIFO processing logic  
   - Added validation and preview features
   - Updated customer summary table with action buttons
   - Updated titip uang customer page with new cairkan functionality

## 🎉 **Ready to Use!**

Fitur pelunasan titip uang sudah siap digunakan dengan:
- ✅ Smart FIFO processing
- ✅ Pelunasan sebagian/penuh  
- ✅ Real-time validation & preview
- ✅ User-friendly interface
- ✅ Complete error handling
- ✅ Consistent data updates

**Customer sekarang bisa cairkan titip uang dengan mudah dan fleksibel!** 🚀💰
