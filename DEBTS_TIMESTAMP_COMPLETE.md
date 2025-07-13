# Hutang Piutang - Tampilan Waktu Input WIB

## 📅 Update Terbaru: Kolom Waktu Input

Komponen Hutang Piutang telah diperbarui untuk menampilkan waktu input dan update secara lengkap dengan format WIB Indonesia.

## 🔧 Fitur Baru yang Ditambahkan

### 1. **Kolom Waktu Input di Tabel Desktop**
- ✅ Kolom baru "Waktu Input" di tabel desktop
- ✅ Menampilkan waktu created dan updated
- ✅ Format: "15 Jan 2024 17:30 WIB"
- ✅ Menampilkan info update jika berbeda dari created

### 2. **Informasi Waktu di Card Mobile**
- ✅ Section timestamp di bagian bawah card
- ✅ Separator visual dengan border
- ✅ Format waktu yang konsisten
- ✅ Info created dan updated (jika ada)

### 3. **Format Waktu WIB Lengkap**
- ✅ Timezone Asia/Jakarta (UTC+7)
- ✅ Format Indonesia: "15 Jan 2024 17:30 WIB"
- ✅ Shortformat untuk menghemat space
- ✅ Konsisten dengan utility dateWIB

## 📱 Tampilan Sebelum dan Sesudah

### **Sebelum:**
```
Desktop Table:
┌─────────┬──────────┬──────┬───────┬──────┬────────┬──────┐
│ Kontak  │ Deskripsi│ Tipe │ Total │ Sisa │ Status │ Aksi │
├─────────┼──────────┼──────┼───────┼──────┼────────┼──────┤
│ John Doe│ Pembayaran│ Uang │ 5M    │ 5M   │ Pending│ ... │
└─────────┴──────────┴──────┴───────┴──────┴────────┴──────┘

Mobile Card:
┌─────────────────────────────────────┐
│ John Doe [Customer]                 │
│ Pembayaran laptop                   │
│ Total: Rp 5.000.000                │
│ Sisa: Rp 5.000.000                 │
│ Jatuh tempo: 15 Februari 2024      │
└─────────────────────────────────────┘
```

### **Sesudah:**
```
Desktop Table:
┌─────────┬──────────┬──────┬───────┬──────┬────────┬─────────────┬──────┐
│ Kontak  │ Deskripsi│ Tipe │ Total │ Sisa │ Status │ Waktu Input │ Aksi │
├─────────┼──────────┼──────┼───────┼──────┼────────┼─────────────┼──────┤
│ John Doe│ Pembayaran│ Uang │ 5M    │ 5M   │ Pending│15 Jan 2024  │ ... │
│         │          │      │       │      │        │17:30 WIB    │     │
└─────────┴──────────┴──────┴───────┴──────┴────────┴─────────────┴──────┘

Mobile Card:
┌─────────────────────────────────────┐
│ John Doe [Customer]                 │
│ Pembayaran laptop                   │
│ Total: Rp 5.000.000                │
│ Sisa: Rp 5.000.000                 │
│ Jatuh tempo: 15 Februari 2024      │
│ ─────────────────────────────       │
│ Input: 15 Jan 2024 17:30 WIB       │
│ Update: 16 Jan 2024 09:15 WIB       │
└─────────────────────────────────────┘
```

## 🔧 Implementasi Detail

### **Header Tabel Desktop:**
```typescript
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Waktu Input
</th>
```

### **Data Tabel Desktop:**
```typescript
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">
    {formatWIBDate(debt.createdAt, { includeTime: true, shortFormat: true })}
  </div>
  {debt.updatedAt && debt.updatedAt !== debt.createdAt && (
    <div className="text-xs text-gray-500">
      Diupdate: {formatWIBDate(debt.updatedAt, { includeTime: true, shortFormat: true })}
    </div>
  )}
</td>
```

### **Info Waktu Mobile Card:**
```typescript
<div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
  <p>Input: {formatWIBDate(debt.createdAt, { includeTime: true, shortFormat: true })}</p>
  {debt.updatedAt && debt.updatedAt !== debt.createdAt && (
    <p>Update: {formatWIBDate(debt.updatedAt, { includeTime: true, shortFormat: true })}</p>
  )}
</div>
```

## 📊 Data Google Sheets

### **Struktur Database:**
```
Debts Sheet (A:R):
- Column P: CreatedAt (ISO timestamp dengan WIB adjustment)
- Column Q: UpdatedAt (ISO timestamp dengan WIB adjustment)
- Column O: DueDate (format YYYY-MM-DD)
```

### **Format Timestamp:**
- **Database**: `2024-01-15T10:30:00.000Z` (adjusted untuk WIB)
- **Display**: `15 Jan 2024 17:30 WIB` (user-friendly)

## 🎨 Styling dan UX

### **Visual Design:**
- ✅ Waktu input dengan font normal
- ✅ Waktu update dengan font smaller dan warna gray
- ✅ Separator visual di mobile card
- ✅ Consistent spacing dan alignment

### **Responsive Design:**
- ✅ Desktop: Kolom terpisah untuk waktu
- ✅ Mobile: Section timestamp di bawah card
- ✅ Tablet: Mengikuti layout desktop

### **Color Scheme:**
- **Primary Time**: `text-gray-900` (dark)
- **Secondary Update**: `text-gray-500` (medium)
- **Mobile Timestamp**: `text-gray-400` (light)
- **Border**: `border-gray-100` (subtle)

## 📱 Interaksi User

### **Informasi yang Ditampilkan:**
1. **Waktu Input**: Kapan data hutang pertama kali dibuat
2. **Waktu Update**: Kapan data terakhir diubah (jika ada)
3. **Format Readable**: Menggunakan format yang mudah dibaca
4. **Timezone Clear**: Jelas menunjukkan WIB

### **Kondisi Tampilan:**
- **Baru dibuat**: Hanya tampil waktu input
- **Pernah diupdate**: Tampil waktu input + update
- **Sama waktu**: Hanya tampil waktu input
- **Responsive**: Adaptif desktop/mobile

## ✅ Testing Checklist

### **Manual Testing:**
- ✅ Buat hutang baru → cek waktu input
- ✅ Edit hutang → cek waktu update
- ✅ Lihat di desktop → cek kolom waktu
- ✅ Lihat di mobile → cek section timestamp
- ✅ Resize window → cek responsive

### **Format Testing:**
- ✅ Waktu menampilkan WIB
- ✅ Format tanggal Indonesia
- ✅ Shortformat untuk space efficiency
- ✅ Consistency dengan komponen lain

## 📋 Status Complete

- ✅ **Desktop Table**: Kolom waktu input ditambahkan
- ✅ **Mobile Card**: Section timestamp ditambahkan
- ✅ **Format WIB**: Konsisten dengan utility dateWIB
- ✅ **Responsive**: Adaptif untuk semua ukuran layar
- ✅ **Database**: Struktur timestamp sudah benar
- ✅ **Styling**: Visual design yang konsisten

Hutang Piutang sekarang menampilkan informasi waktu input dan update secara lengkap dengan format WIB Indonesia!
