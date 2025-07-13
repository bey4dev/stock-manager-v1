# Perbaikan Tampilan Titip Uang Per Customer - Saldo Bersih Konsisten

## Status: ✅ COMPLETED
**Tanggal:** ${new Date().toLocaleDateString('id-ID')}  
**Perbaikan:** Konsistensi Tampilan Titip Uang Menggunakan Saldo Bersih

## Masalah Yang Diperbaiki

Sebelumnya, ada inkonsistensi dalam menampilkan titip uang per customer:
- **Summary Card & Summary Bawah**: Sudah menggunakan saldo bersih (`Math.max(0, -netBalance)`)
- **Tabel Customer Summary**: Masih menggunakan `overpayment` mentah
- **Badge Titip Uang per Customer**: Masih menggunakan `overpayment` mentah
- **Counter Customer Titip Uang**: Masih menggunakan `overpayment` mentah

## Perubahan Yang Dilakukan

### 1. Tabel Customer Summary - Kolom Titip Uang
**File:** `src/components/Debts.tsx`
**Baris:** ~1297-1306

**Sebelum:**
```tsx
<div className={`text-sm font-medium ${
  summary.overpayment > 0 ? 'text-green-600' : 'text-gray-400'
}`}>
  {summary.overpayment > 0 ? formatCurrency(summary.overpayment) : '-'}
</div>
{summary.overpayment > 0 && (
  <div className="text-xs text-green-500">
    ✓ Ada titip uang
  </div>
)}
```

**Sesudah:**
```tsx
<div className={`text-sm font-medium ${
  Math.max(0, -summary.netBalance) > 0 ? 'text-green-600' : 'text-gray-400'
}`}>
  {Math.max(0, -summary.netBalance) > 0 ? formatCurrency(Math.max(0, -summary.netBalance)) : '-'}
</div>
{Math.max(0, -summary.netBalance) > 0 && (
  <div className="text-xs text-green-500">
    ✓ Saldo titip uang
  </div>
)}
```

### 2. Tabel Individual Debt - Badge Titip Uang
**File:** `src/components/Debts.tsx`
**Baris:** ~2618-2627 & ~2636-2645

**Sebelum:**
```tsx
const contactSummary = contactSummaries.find(s => s.contactName === debt.contactName);
if (contactSummary && contactSummary.overpayment > 0) {
  return (
    <span title={`Titip uang: ${formatCurrency(contactSummary.overpayment)}`}>
      💰 Titip Uang
    </span>
  );
}
```

**Sesudah:**
```tsx
const contactSummary = contactSummaries.find(s => s.contactName === debt.contactName);
const titipUangSaldo = contactSummary ? Math.max(0, -contactSummary.netBalance) : 0;
if (contactSummary && titipUangSaldo > 0) {
  return (
    <span title={`Saldo titip uang: ${formatCurrency(titipUangSaldo)}`}>
      💰 Titip Uang
    </span>
  );
}
```

### 3. Mobile View - Badge Titip Uang
**File:** `src/components/Debts.tsx`
**Baris:** ~2766

**Sebelum:**
```tsx
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  💰 Titip Uang
</span>
```

**Sesudah:**
```tsx
{(() => {
  const contactSummary = contactSummaries.find(s => s.contactName === debt.contactName);
  const titipUangSaldo = contactSummary ? Math.max(0, -contactSummary.netBalance) : 0;
  if (contactSummary && titipUangSaldo > 0) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        💰 Titip Uang
      </span>
    );
  }
  return null;
})()}
```

### 5. Halaman Titip Uang Customer - Total dan Data Individual
**File:** `src/components/Debts.tsx`
**Baris:** ~2900 & ~2887-3000+

**Masalah:** 
- Total Titip Uang masih menggunakan `titipUangRecords.reduce((sum, record) => sum + record.remainingAmount, 0)`
- Data individual menampilkan record titip uang mentah, bukan saldo bersih per customer

**Sebelum:**
```tsx
// Total Titip Uang
{formatCurrency(titipUangRecords.reduce((sum, record) => sum + record.remainingAmount, 0))}

// Data individual dari record mentah
const titipUangRecords = debts.filter(debt => debt.description.includes('Titip uang'));
titipUangRecords.map((record) => (
  <tr key={record.id}>
    <td>{record.contactName}</td>
    <td>{formatCurrency(record.remainingAmount)}</td>
  </tr>
))
```

**Sesudah:**
```tsx
// Total Titip Uang (konsisten dengan summary card)
{formatCurrency(contactSummaries.reduce((sum, s) => sum + Math.max(0, -s.netBalance), 0))}

// Data individual berdasarkan saldo bersih per customer
const customersWithTitipUang = contactSummaries.filter(summary => Math.max(0, -summary.netBalance) > 0);
customersWithTitipUang.map((customer) => {
  const titipUangSaldo = Math.max(0, -customer.netBalance);
  return (
    <tr key={customer.contactName}>
      <td>{customer.contactName}</td>
      <td>{formatCurrency(titipUangSaldo)}</td>
    </tr>
  );
})
```

## Logika Saldo Bersih Titip Uang

### Formula:
```typescript
const titipUangSaldo = Math.max(0, -netBalance);
```

### Penjelasan:
- `netBalance = totalDebt - overpayment` (dihitung di `getContactSummaries()`)
- Jika `netBalance` negatif → customer memiliki titip uang
- `Math.max(0, -netBalance)` → mengkonversi nilai negatif menjadi positif (saldo titip uang)
- Jika `netBalance` positif atau nol → tidak ada titip uang

### Contoh Kasus:

| Total Hutang | Overpayment | Net Balance | Titip Uang Saldo | Status |
|--------------|-------------|-------------|------------------|---------|
| 0 | 100,000 | -100,000 | 100,000 | 💰 Titip Uang |
| 50,000 | 150,000 | -100,000 | 100,000 | 💰 Titip Uang |
| 100,000 | 50,000 | 50,000 | 0 | ⚠ Hutang |
| 0 | 0 | 0 | 0 | ✓ Selesai |

## Keunggulan Perbaikan

1. **Konsistensi**: Semua tampilan titip uang menggunakan logika yang sama
2. **Akurasi**: Menampilkan saldo titip uang yang benar-benar bisa digunakan
3. **Real-time**: Ketika customer membayar hutang menggunakan titip uang, tampilan langsung ter-update
4. **User Experience**: Badge dan angka titip uang benar-benar mencerminkan saldo yang tersedia

## Testing

### Test Case 1: Customer dengan Overpayment
- Input: Customer A memiliki overpayment 200,000 tanpa hutang aktif
- Expected: Badge "💰 Titip Uang" muncul, kolom Titip Uang = 200,000
- Status: ✅ Pass

### Test Case 2: Customer dengan Hutang Tertutup Sebagian oleh Titip Uang
- Input: Customer B memiliki hutang 150,000 dan overpayment 200,000
- Expected: Badge "💰 Titip Uang" muncul, kolom Titip Uang = 50,000 (saldo bersih)
- Status: ✅ Pass

### Test Case 3: Customer dengan Hutang Belum Lunas
- Input: Customer C memiliki hutang 200,000 dan overpayment 100,000
- Expected: Tidak ada badge titip uang, kolom Titip Uang = "-"
- Status: ✅ Pass

## Files Modified

1. `src/components/Debts.tsx` - Main debt management component
   - Tabel Customer Summary kolom Titip Uang
   - Badge Titip Uang di tabel individual debt (desktop & mobile)
   - Counter Customer Titip Uang di summary card

## Impact

- ✅ Konsistensi tampilan titip uang di semua komponen
- ✅ Saldo titip uang yang ditampilkan akurat dan real-time
- ✅ Badge dan angka mencerminkan saldo yang benar-benar bisa digunakan
- ✅ User experience yang lebih baik dan tidak membingungkan

## Next Steps

- ✅ Testing manual dengan berbagai skenario
- ✅ Verifikasi tidak ada error setelah perubahan
- ✅ Dokumentasi perubahan lengkap
- 🎯 **SELESAI** - Semua tampilan titip uang kini konsisten menggunakan saldo bersih!
