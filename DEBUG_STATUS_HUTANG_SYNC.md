# 🔧 DEBUG: StatusHutang Sinkronisasi Issue

## 📋 **Analisis Masalah**

Berdasarkan code yang telah kita implementasi, kemungkinan penyebab data tidak tersinkron:

### **1. Timing Issues**
- Google Sheets API membutuhkan waktu untuk memproses data
- Race condition antara multiple API calls
- Data belum tersimpan saat autoUpdateStatusHutang dipanggil

### **2. Data Validation Issues**
- Contact ID tidak valid atau kosong
- Format data yang dikirim tidak sesuai
- Conflict dalam matching existing records

### **3. API Call Issues**
- Network latency
- Google Sheets API rate limiting
- Authentication token expiry

## 🔍 **Step-by-Step Debugging**

### **Step 1: Buka Browser Console**
1. Buka aplikasi di `http://localhost:5178/`
2. Tekan `F12` atau `Ctrl+Shift+I`
3. Buka tab **Console**

### **Step 2: Monitor Real-time Logs**
1. Input hutang baru
2. Perhatikan log berikut di console:
```
[DEBUG SUBMIT] Starting auto-update StatusHutang after debt creation...
[DEBUG StatusHutang] Force refresh requested, waiting and reloading data...
[DEBUG StatusHutang] Processing 1 contact summaries
[DEBUG StatusHutang] Contact ID validation for CustomerName:
[DEBUG StatusHutang] Sending data for CustomerName:
[DEBUG updateStatusHutang] Input data:
[DEBUG updateStatusHutang] Row data to send:
```

### **Step 3: Manual Testing**
1. Copy dan paste script dari `debug-status-hutang.js` ke console
2. Jalankan `checkStatusHutangSheet()` untuk cek sheet
3. Jalankan `testStatusHutangUpdate()` untuk test manual

### **Step 4: Google Sheets Validation**
1. Buka Google Sheets langsung
2. Cek apakah sheet **StatusHutang** ada
3. Periksa data yang masuk

## 🛠️ **Perbaikan yang Telah Diterapkan**

### **1. Enhanced Timing Control**
```typescript
// Increased delay untuk memastikan data tersimpan
await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds

// Double refresh untuk fresh data
if (forceRefresh) {
  await new Promise(resolve => setTimeout(resolve, 3000));
  await Promise.all([loadDebts(), loadContacts(), loadProducts(), loadPayments()]);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Additional wait
}
```

### **2. Retry Mechanism**
```typescript
// Retry hingga 3x jika gagal
let retryCount = 0;
const maxRetries = 3;
while (retryCount < maxRetries && !updateSuccess) {
  // Attempt update with error handling
}
```

### **3. Enhanced Validation**
```typescript
// Validasi contact ID
const existingRowIndex = dataRows.findIndex((row: any[]) => {
  const existingContactId = row[0]?.toString().trim();
  const searchContactId = contactData.contactId?.toString().trim();
  return existingContactId === searchContactId;
});

// Validasi data required
if (!contactData.contactId || !contactData.contactName) {
  console.error('Invalid contact data - missing required fields');
  return false;
}
```

### **4. Comprehensive Logging**
```typescript
console.log('[DEBUG StatusHutang] Contact ID validation:', {
  contactId: summary.contactId,
  contactIdType: typeof summary.contactId,
  contactIdLength: summary.contactId?.length
});
```

## 🧪 **Testing Protocol**

### **Test Case 1: New Contact Debt**
1. Tambah hutang untuk contact baru
2. Tunggu 3-5 detik
3. Cek StatusHutang sheet
4. Verify data muncul dengan status correct

### **Test Case 2: Existing Contact Payment**
1. Bayar hutang existing contact
2. Tunggu 3-5 detik  
3. Cek StatusHutang sheet
4. Verify status dan saldo terupdate

### **Test Case 3: Multiple Operations**
1. Tambah hutang + bayar dalam sequence cepat
2. Monitor console logs
3. Verify no race conditions
4. Check final data consistency

## 🔧 **Quick Fixes to Try**

### **Fix 1: Increase Delay**
Jika masih gagal, increase delay di autoUpdateStatusHutang:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
```

### **Fix 2: Force Single-threaded**
Tambah semaphore untuk prevent concurrent updates:
```typescript
let statusHutangUpdating = false;
if (statusHutangUpdating) {
  console.log('StatusHutang update already in progress, skipping...');
  return;
}
statusHutangUpdating = true;
// ... update logic
statusHutangUpdating = false;
```

### **Fix 3: Manual Trigger**
Tambah button manual refresh StatusHutang untuk testing:
```typescript
<button onClick={() => autoUpdateStatusHutang(true)}>
  🔄 Refresh StatusHutang
</button>
```

## 📞 **Next Steps**

1. **Test dengan debugging enabled**
2. **Monitor console logs selama test**
3. **Check Google Sheets directly untuk verify**
4. **Report hasil testing dengan screenshots log**

Sistem sekarang memiliki comprehensive error handling dan logging untuk identify root cause masalah sinkronisasi! 🚀
