# 📞 Format Nomor WhatsApp di Sheet Contacts - Panduan Debug

## 🚨 **Masalah yang Terjadi**
Error: "Nomor WhatsApp tidak tersedia untuk Alif Ridwan - Koteng"

---

## 🔍 **Debugging Steps yang Ditambahkan**

### **1. Console.log di loadContacts()**
```typescript
console.log('[DEBUG CONTACTS] Raw data from Contacts sheet:', response.data);
console.log('[DEBUG CONTACTS] Processed contacts data:', contactsData);
```

### **2. Console.log di tombol WhatsApp**
```typescript
console.log('[DEBUG WHATSAPP] Looking for contact:', summary.contactName);
console.log('[DEBUG WHATSAPP] Available contacts:', contacts);
console.log('[DEBUG WHATSAPP] Found contact:', contact);
console.log('[DEBUG WHATSAPP] Phone number found:', contact.phone);
```

---

## 📋 **Format Sheet Contacts yang Benar**

### **Struktur Kolom di Google Sheets "Contacts":**
| Kolom A (ID) | Kolom B (Name) | Kolom C (Type) | Kolom D (Phone) |
|--------------|----------------|----------------|-----------------|
| CUST_001     | Alif Ridwan - Koteng | customer | 081234567890 |
| CUST_002     | John Doe       | customer       | +6285123456789  |
| SUPP_001     | Supplier ABC   | supplier       | 08123456789     |

### **Format Nomor Phone yang Diterima:**
✅ **Format Valid:**
- `081234567890` (tanpa prefix)
- `+6281234567890` (dengan country code)
- `6281234567890` (tanpa plus)
- `0812-3456-7890` (dengan strip, akan dibersihkan)
- `0812 3456 7890` (dengan spasi, akan dibersihkan)

❌ **Format Tidak Valid:**
- Kosong/null
- Berisi huruf: `08123abc456`
- Terlalu pendek: `081234`

---

## 🔧 **Cara Debug di Browser**

### **1. Buka Developer Console**
- Tekan `F12` atau `Ctrl+Shift+I`
- Pilih tab **Console**

### **2. Refresh Halaman**
- Data contacts akan di-log saat loadContacts() dipanggil

### **3. Klik Tombol WhatsApp**
- Debug info akan tampil di console

### **4. Periksa Output Console**
```
[DEBUG CONTACTS] Raw data from Contacts sheet: [...]
[DEBUG CONTACTS] Processed contacts data: [...]
[DEBUG WHATSAPP] Looking for contact: Alif Ridwan - Koteng
[DEBUG WHATSAPP] Available contacts: [...]
[DEBUG WHATSAPP] Found contact: {...}
[DEBUG WHATSAPP] Phone number found: 081234567890
```

---

## 🎯 **Kemungkinan Penyebab Error**

### **1. Nama Kontak Tidak Match**
- Nama di debt: `"Alif Ridwan - Koteng"`
- Nama di Contacts: `"Alif Ridwan-Koteng"` (tanpa spasi)
- **Solusi**: Pastikan nama persis sama

### **2. Kolom Phone Kosong**
- Data phone di kolom D kosong atau null
- **Solusi**: Isi nomor phone di sheet Contacts

### **3. Index Kolom Salah**
- Phone diambil dari `row[3]` (kolom ke-4)
- **Solusi**: Pastikan phone ada di kolom D

### **4. Data Belum Ter-load**
- Contacts belum selesai dimuat saat tombol diklik
- **Solusi**: Tunggu loading selesai

---

## 🛠️ **Solusi Cepat**

### **1. Periksa Sheet Contacts**
1. Buka Google Sheets "Contacts"
2. Cari baris dengan nama "Alif Ridwan - Koteng"
3. Pastikan kolom D (Phone) terisi nomor

### **2. Format Nomor yang Benar**
```
Kolom D: 081234567890
atau
Kolom D: +6281234567890
```

### **3. Jika Nama Tidak Match**
- Ubah nama di sheet agar persis sama
- Atau ubah nama contact di sheet Debts

### **4. Refresh Aplikasi**
- Setelah edit sheet, refresh halaman
- Tunggu data ter-load ulang

---

## 📱 **Testing dengan Debug**

### **1. Buka Console Browser**
### **2. Refresh Halaman**
### **3. Lihat Log Contacts:**
```javascript
// Cari apakah contact ada:
contacts.find(c => c.name === "Alif Ridwan - Koteng")

// Cek semua contacts:
console.table(contacts)
```

### **4. Klik Tombol WhatsApp**
### **5. Analisis Output Debug**

---

## 🎉 **Expected Result Setelah Fix**

### **Console Output yang Benar:**
```
[DEBUG WHATSAPP] Looking for contact: Alif Ridwan - Koteng
[DEBUG WHATSAPP] Found contact: {
  id: "CUST_001", 
  name: "Alif Ridwan - Koteng", 
  type: "customer", 
  phone: "081234567890"
}
[DEBUG WHATSAPP] Phone number found: 081234567890
```

### **WhatsApp Web Terbuka dengan Pesan:**
```
Halo Alif Ridwan - Koteng,

Kami mengingatkan bahwa Anda memiliki hutang bersih sebesar Rp 120.000.

Rincian:
- Total hutang: Rp 200.000
- Saldo titip uang: Rp 80.000
- Hutang bersih: Rp 120.000

Mohon untuk melakukan pembayaran secepatnya...
```

---

**Debug mode telah ditambahkan - silakan test dan lihat console output! 🔍📱**
