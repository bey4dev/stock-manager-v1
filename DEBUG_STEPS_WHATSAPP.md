# 🚨 DEBUG MODE AKTIF - Langkah Testing WhatsApp

## 🔍 **Debug Tools yang Telah Ditambahkan**

### **1. Tombol Debug Contacts** 
- **Lokasi**: Tab bar di atas (tombol merah "🔍 Debug Contacts")
- **Fungsi**: Menampilkan jumlah contacts yang ter-load
- **Cara**: Klik tombol → akan muncul alert dan log di console

### **2. Enhanced Debug di Tombol WhatsApp**
- **Alert visual** sebelum mencari contact
- **Console log lengkap** untuk semua step
- **List semua nama contact** jika tidak ketemu

### **3. Detailed Contacts Loading Log**
- Log setiap baris data dari Google Sheets
- Log proses mapping data
- Log pencarian contact spesifik

---

## 📋 **Langkah Testing Step-by-Step**

### **Step 1: Test Contacts Loading**
1. **Refresh halaman** (Ctrl+F5)
2. **Buka Developer Console** (F12 → Console)
3. **Cari log**: `[DEBUG CONTACTS] Starting to load contacts...`
4. **Klik tombol "🔍 Debug Contacts"** di tab bar
5. **Lihat alert**: "Debug: Found X contacts"

### **Step 2: Test WhatsApp Button**
1. **Buka tab "📊 Ringkasan Hutang & Piutang per Kontak"**
2. **Cari baris "Alif Ridwan - Koteng"**
3. **Klik tombol "📱 WhatsApp"**
4. **Lihat alert pertama**: "DEBUG: Looking for ... in X contacts"
5. **Lihat alert kedua**: 
   - Jika berhasil: "DEBUG: Found phone ... for ..."
   - Jika gagal: "DEBUG: Contact not found. Available names: ..."

---

## 🎯 **Expected Debug Output**

### **Jika Contacts Ter-load dengan Benar:**
```
[DEBUG CONTACTS] Starting to load contacts...
[DEBUG CONTACTS] Response from GoogleSheets: {success: true, data: [...]}
[DEBUG CONTACTS] Raw data from Contacts sheet: [...]
[DEBUG CONTACTS] Number of rows: 5
[DEBUG CONTACTS] Row 0: ["CUST_001", "Alif Ridwan - Koteng", "customer", "081234567890"]
[DEBUG CONTACTS] Row 1: [...]
[DEBUG CONTACTS] Processed contacts data: [{id: "CUST_001", name: "Alif Ridwan - Koteng", ...}]
[DEBUG CONTACTS] Target contact (Alif): {id: "CUST_001", name: "Alif Ridwan - Koteng", phone: "081234567890"}
```

### **Jika WhatsApp Button Berhasil:**
```
[DEBUG WHATSAPP] ===== START DEBUG =====
[DEBUG WHATSAPP] Looking for contact: Alif Ridwan - Koteng
[DEBUG WHATSAPP] Available contacts length: 5
[DEBUG WHATSAPP] Found contact: {id: "CUST_001", name: "Alif Ridwan - Koteng", phone: "081234567890"}
[DEBUG WHATSAPP] Phone number found: 081234567890
```

---

## 🚨 **Kemungkinan Masalah & Solusi**

### **Masalah 1: Contacts Tidak Ter-load**
**Indikasi**: Alert shows "Found 0 contacts"
**Log**: `[DEBUG CONTACTS] Failed to load contacts`
**Solusi**: 
- Cek koneksi internet
- Cek akses Google Sheets API
- Cek nama sheet "Contacts"

### **Masalah 2: Data Contacts Kosong/Salah Format**
**Indikasi**: Alert shows "Found X contacts" tapi WhatsApp gagal
**Log**: `[DEBUG CONTACTS] Row 0: ["", "", "", ""]`
**Solusi**:
- Cek isi sheet Contacts di Google Sheets
- Pastikan ada header di baris 1
- Pastikan data mulai dari baris 2

### **Masalah 3: Nama Contact Tidak Match**
**Indikasi**: Alert "Contact not found. Available names: ..."
**Solusi**:
- Bandingkan nama di alert dengan nama yang dicari
- Cek perbedaan spasi, tanda hubung, atau karakter
- Edit nama di Google Sheets agar match persis

### **Masalah 4: Phone Number Kosong**
**Indikasi**: Contact ditemukan tapi phone kosong
**Log**: `phone: ""`
**Solusi**:
- Isi kolom D (Phone) di sheet Contacts
- Format: 081234567890 atau +6281234567890

---

## 🔧 **Quick Fix Commands**

### **Check di Console Browser:**
```javascript
// Cek semua contacts
console.table(contacts)

// Cari contact spesifik
contacts.find(c => c.name.includes("Alif"))

// Cek semua nama
contacts.map(c => c.name)
```

### **Format Sheet Contacts yang Benar:**
```
Baris 1 (Header): ID | Name | Type | Phone
Baris 2: CUST_001 | Alif Ridwan - Koteng | customer | 081234567890
Baris 3: CUST_002 | John Doe | customer | 082345678901
```

---

## 📱 **Test Sekarang!**

1. ✅ **Klik tombol "🔍 Debug Contacts"**
2. ✅ **Lihat berapa contact ter-load**
3. ✅ **Klik tombol "📱 WhatsApp"**
4. ✅ **Lihat pesan debug di alert**
5. ✅ **Cek console untuk log lengkap**

**Laporkan hasil debug untuk analisis lebih lanjut! 🔍📱**
