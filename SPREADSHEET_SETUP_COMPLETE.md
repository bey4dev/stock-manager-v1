# 📊 Checklist & Template Google Spreadsheet untuk StockManager

## 🔍 CEK SPREADSHEET ANDA

Buka spreadsheet Anda: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit

### Sheet yang WAJIB ADA:
1. ✅ **Products** 
2. ✅ **Sales**
3. ✅ **Purchases** 
4. ✅ **Dashboard**

---

## 📋 TEMPLATE LENGKAP SETIAP SHEET

### 1. Sheet "Products" 
**Range:** `Products!A:H` (8 kolom)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| **ID** | **Name** | **Category** | **Price** | **Stock** | **Cost** | **Description** | **Status** |
| PRD_001 | E-Book Premium | Digital Books | 150000 | 50 | 75000 | Buku digital premium | Active |
| PRD_002 | Online Course | Education | 500000 | 30 | 200000 | Kursus online programming | Active |
| PRD_003 | Software License | Software | 1000000 | 10 | 400000 | Lisensi software development | Active |
| PRD_004 | Digital Template | Design | 75000 | 100 | 25000 | Template desain website | Active |
| PRD_005 | Mobile App | Software | 200000 | 25 | 80000 | Aplikasi mobile premium | Active |

**Copy paste ini ke sheet Products:**
```
ID	Name	Category	Price	Stock	Cost	Description	Status
PRD_001	E-Book Premium	Digital Books	150000	50	75000	Buku digital premium	Active
PRD_002	Online Course	Education	500000	30	200000	Kursus online programming	Active
PRD_003	Software License	Software	1000000	10	400000	Lisensi software development	Active
PRD_004	Digital Template	Design	75000	100	25000	Template desain website	Active
PRD_005	Mobile App	Software	200000	25	80000	Aplikasi mobile premium	Active
```

---

### 2. Sheet "Sales"
**Range:** `Sales!A:G` (7 kolom)

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **ID** | **Date** | **Product** | **Quantity** | **Price** | **Total** | **Customer** |
| SAL_001 | 2025-07-01 | E-Book Premium | 5 | 150000 | 750000 | John Doe |
| SAL_002 | 2025-07-02 | Online Course | 2 | 500000 | 1000000 | Jane Smith |
| SAL_003 | 2025-07-03 | Digital Template | 10 | 75000 | 750000 | Bob Wilson |
| SAL_004 | 2025-07-04 | Software License | 1 | 1000000 | 1000000 | Alice Brown |

**Copy paste ini ke sheet Sales:**
```
ID	Date	Product	Quantity	Price	Total	Customer
SAL_001	2025-07-01	E-Book Premium	5	150000	750000	John Doe
SAL_002	2025-07-02	Online Course	2	500000	1000000	Jane Smith
SAL_003	2025-07-03	Digital Template	10	75000	750000	Bob Wilson
SAL_004	2025-07-04	Software License	1	1000000	1000000	Alice Brown
```

---

### 3. Sheet "Purchases"
**Range:** `Purchases!A:G` (7 kolom)

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **ID** | **Date** | **Product** | **Quantity** | **Cost** | **Total** | **Supplier** |
| PUR_001 | 2025-07-01 | E-Book Premium | 20 | 75000 | 1500000 | Content Creator A |
| PUR_002 | 2025-07-02 | Online Course | 10 | 200000 | 2000000 | Education Provider B |
| PUR_003 | 2025-07-03 | Digital Template | 50 | 25000 | 1250000 | Design Studio C |

**Copy paste ini ke sheet Purchases:**
```
ID	Date	Product	Quantity	Cost	Total	Supplier
PUR_001	2025-07-01	E-Book Premium	20	75000	1500000	Content Creator A
PUR_002	2025-07-02	Online Course	10	200000	2000000	Education Provider B
PUR_003	2025-07-03	Digital Template	50	25000	1250000	Design Studio C
```

---

### 4. Sheet "Dashboard"
**Range:** `Dashboard!A:B` (2 kolom)

| A | B |
|---|---|
| **Key** | **Value** |
| totalProducts | 5 |
| totalSales | 4 |
| totalRevenue | 3500000 |
| totalPurchases | 3 |
| totalCost | 4750000 |
| profit | -1250000 |

**Copy paste ini ke sheet Dashboard:**
```
Key	Value
totalProducts	5
totalSales	4
totalRevenue	3500000
totalPurchases	3
totalCost	4750000
profit	-1250000
```

---

## 🛠️ LANGKAH-LANGKAH SETUP

### 1. Buka Spreadsheet Anda
https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit

### 2. Cek Sheet yang Ada
- Lihat tab di bawah spreadsheet
- Pastikan ada 4 sheet: Products, Sales, Purchases, Dashboard
- Jika ada yang kurang, klik **"+"** untuk tambah sheet baru

### 3. Rename Sheet (jika perlu)
- Klik kanan pada tab sheet
- Pilih "Rename"
- Ganti nama sesuai: **Products**, **Sales**, **Purchases**, **Dashboard**

### 4. Copy Data Template
- Untuk setiap sheet, copy paste data template di atas
- Pastikan header di baris 1
- Data mulai dari baris 2

### 5. Format Data (opsional)
- **Header (baris 1):** Bold, background warna
- **Kolom Price/Cost/Total:** Format currency (Rp)
- **Kolom Date:** Format date (DD/MM/YYYY)

---

## 🔧 TROUBLESHOOTING

### Error: "Sheet not found"
- Pastikan nama sheet persis: **Products** (bukan "Product" atau "products")
- Huruf besar/kecil harus sama

### Error: "Range invalid"  
- Pastikan kolom sesuai range yang ditentukan
- Products: A-H (8 kolom)
- Sales: A-G (7 kolom) 
- Purchases: A-G (7 kolom)
- Dashboard: A-B (2 kolom)

### Data tidak muncul di aplikasi
- Cek permission spreadsheet (pastikan bisa diakses email yang login)
- Cek SPREADSHEET_ID di konfigurasi aplikasi
- Clear cache browser dan login ulang

---

## ✅ VERIFIKASI

Setelah setup selesai:

1. **Buka aplikasi:** http://localhost:5174
2. **Login dengan Google** (yang punya akses ke spreadsheet)
3. **Buka halaman Debug:** Menu "🔍 Debug"
4. **Cek status:** Pastikan semua hijau ✅
5. **Test data:** Lihat products, sales, purchases muncul di aplikasi

Jika masih ada masalah, screenshot halaman Debug dan console browser (F12) untuk troubleshooting lebih lanjut.
