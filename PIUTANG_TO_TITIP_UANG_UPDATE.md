# Stock Manager - Update Piutang ke Titip Uang

## 🎯 **Perubahan: Piutang → Titip Uang**

### 📋 **Deskripsi Perubahan**
Berdasarkan feedback user, terminologi "Piutang" dirubah menjadi "Titip Uang" untuk lebih mencerminkan kondisi sebenarnya dimana customer menitipkan uang lebih ketika membayar hutang.

### ✨ **Perubahan yang Dilakukan**

#### **1. Logika Overpayment Detection**
```typescript
// OLD: Piutang detection
else if (debt.description.includes('Kelebihan pembayaran') || debt.description.includes('piutang')) {
  summary.overpayment += debt.remainingAmount;
}

// NEW: Titip Uang detection  
else if (debt.description.includes('Kelebihan pembayaran') || debt.description.includes('Titip uang') || debt.description.includes('piutang')) {
  summary.overpayment += debt.remainingAmount;
}
```

#### **2. Record Description**
```typescript
// OLD: Kelebihan pembayaran record
const reverseDescription = `Kelebihan pembayaran dari hutang: ${selectedDebt.description}`;

// NEW: Titip uang record
const reverseDescription = `Titip uang dari hutang: ${selectedDebt.description}`;
```

#### **3. User Messages**
```typescript
// OLD: Piutang message
alert(`✅ Pembayaran berhasil!\n...\n💡 Kelebihan telah dicatat sebagai piutang baru ke member.`);

// NEW: Titip uang message
alert(`✅ Pembayaran berhasil!\n...\n💡 Kelebihan telah dicatat sebagai titip uang baru ke member.`);
```

### 🎨 **UI Changes**

#### **Summary Cards**
| OLD | NEW |
|-----|-----|
| Total Piutang | Total Titip Uang |
| Customer Overpay | Customer Titip Uang |

#### **Table Headers**
| OLD | NEW |
|-----|-----|
| Kelebihan Bayar | Titip Uang |
| Total Kelebihan Pembayaran | Total Titip Uang |

#### **Badges & Indicators**
| OLD | NEW |
|-----|-----|
| 💰 Overpay | 💰 Titip Uang |
| ✓ Piutang: Rp XXX | ✓ Titip Uang: Rp XXX |
| ✓ Ada piutang | ✓ Ada titip uang |
| 💰 Piutang | 💰 Titip Uang |

#### **Status Messages**
| OLD | NEW |
|-----|-----|
| Kelebihan bayar | Titip uang |
| Customer ini memiliki piutang | Customer ini menitip uang |
| kelebihan akan dicatat sebagai piutang | kelebihan akan dicatat sebagai titip uang |

### 📊 **Business Logic**

#### **Konsep "Titip Uang"**
- Customer membayar hutang lebih dari yang seharusnya
- Kelebihan uang disimpan sebagai "titip uang" di sistem
- Titip uang bisa digunakan untuk transaksi berikutnya
- Titip uang bisa di-refund ke customer

#### **Net Balance Calculation**
```typescript
// Formula tetap sama, hanya terminologi yang berubah
summary.netBalance = summary.totalDebt - summary.overpayment;

// Interpretasi:
// Positive net balance = Customer masih ada hutang
// Negative net balance = Customer menitip uang (overpaid)
// Zero net balance = Saldo customer lunas
```

### 🔍 **Display Logic**

#### **Contact Summary Table**
```typescript
// Status determination based on net balance
{summary.netBalance === 0 ? (
  <span>✓ Selesai</span>
) : summary.netBalance > 0 ? (
  <span>⚠ Hutang</span>  
) : (
  <span>💰 Titip Uang</span>  // Previously "💰 Piutang"
)}
```

#### **Saldo Bersih Column**
```typescript
// Balance description
{summary.netBalance > 0 
  ? 'Masih hutang' 
  : summary.netBalance < 0 
    ? 'Titip uang'      // Previously "Kelebihan bayar"
    : 'Saldo nol'
}
```

### 🎯 **User Experience Improvements**

#### **Clarity Benefits:**
1. **Better Understanding**: "Titip uang" lebih mudah dipahami customer
2. **Accurate Terminology**: Mencerminkan kondisi sebenarnya
3. **Professional Language**: Sesuai dengan istilah bisnis lokal
4. **Customer Friendly**: Tidak terkesan "customer berhutang ke toko"

#### **Business Benefits:**
1. **Clear Communication**: Customer paham uang mereka "dititipkan"
2. **Trust Building**: Terminologi yang lebih transparan
3. **Operational Clarity**: Staff lebih mudah menjelaskan ke customer
4. **Record Keeping**: Pencatatan yang lebih akurat

### 📁 **Files Modified**

#### **Main Changes:**
- `src/components/Debts.tsx`: 
  - Updated all "piutang" references to "titip uang"
  - Modified UI text and tooltips
  - Updated status badges and messages
  - Changed alert notifications

#### **Specific Updates:**
1. **Summary Cards**: "Total Piutang" → "Total Titip Uang"
2. **Table Headers**: "Kelebihan Bayar" → "Titip Uang"  
3. **Badges**: "💰 Overpay" → "💰 Titip Uang"
4. **Info Text**: "✓ Piutang" → "✓ Titip Uang"
5. **Status**: "💰 Piutang" → "💰 Titip Uang"
6. **Messages**: All payment notifications updated

### ✅ **Testing Scenarios**

#### **Test Case 1: Customer Overpayment**
1. Customer memiliki hutang Rp 500,000
2. Customer membayar Rp 600,000
3. ✅ System creates "Titip uang dari hutang: ..."
4. ✅ Badge shows "💰 Titip Uang"
5. ✅ Summary shows "Total Titip Uang"
6. ✅ Alert message mentions "titip uang"

#### **Test Case 2: Display Verification**
1. Buka halaman Debt Management
2. ✅ Check summary cards show "Total Titip Uang"
3. ✅ Check table header shows "Titip Uang"
4. ✅ Check customer badges show "💰 Titip Uang"
5. ✅ Check status shows "💰 Titip Uang"

#### **Test Case 3: Mobile View**
1. Switch to mobile/responsive mode
2. ✅ Mobile cards show "💰 Titip Uang"
3. ✅ Info text shows "Customer ini menitip uang"
4. ✅ All terminology consistent

### 🚀 **Implementation Complete**

✅ **All "Piutang" references updated to "Titip Uang"**
✅ **Consistent terminology across all UI elements**
✅ **Business logic maintains same functionality**
✅ **User experience improved with clearer language**
✅ **Professional and customer-friendly terminology**

### 📝 **Summary**

Perubahan ini meningkatkan:
- **User Understanding**: Terminologi yang lebih jelas
- **Customer Relations**: Bahasa yang lebih ramah customer
- **Business Communication**: Istilah yang sesuai praktik bisnis
- **Operational Efficiency**: Staff lebih mudah menjelaskan

---

## ✨ **Result: Professional "Titip Uang" System**

Stock Manager kini menggunakan terminologi "Titip Uang" yang lebih tepat dan customer-friendly untuk mengelola kelebihan pembayaran customer! 🎉
