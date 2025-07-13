# 📊 Google Sheets Setup Guide

## 🔧 Langkah-langkah Setup Google Sheets Integration

### 1. **Buat Google Cloud Project**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Enable Google Sheets API dan Google+ API di Library

### 2. **Setup Credentials**
1. Buka **APIs & Services > Credentials**
2. Klik **Create Credentials > OAuth client ID**
3. Pilih **Web application**
4. Tambahkan **Authorized JavaScript origins**: `http://localhost:5173`
5. Tambahkan **Authorized redirect URIs**: `http://localhost:5173`
6. Copy **Client ID** dan paste ke `CLIENT_ID` di `google-sheets.ts`
7. Buat **API Key** di **Create Credentials > API key**
8. Copy **API Key** dan paste ke `API_KEY` di `google-sheets.ts`

### 3. **Buat Google Spreadsheet**

Buat spreadsheet baru di [Google Sheets](https://sheets.google.com) dengan struktur berikut:

#### 📋 **Sheet 1: Products**
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| ID | Name | Category | Price | Stock | Cost | Description | Status |
| PRD_001 | E-Book Premium | Digital Books | 150000 | 50 | 75000 | Buku digital premium tentang teknologi | Active |
| PRD_002 | Online Course | Education | 500000 | 30 | 200000 | Kursus online programming | Active |

#### 📈 **Sheet 2: Sales**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Date | Product | Quantity | Price | Total | Customer |
| SAL_001 | 2025-01-01 | E-Book Premium | 5 | 150000 | 750000 | John Doe |
| SAL_002 | 2025-01-02 | Online Course | 2 | 500000 | 1000000 | Jane Smith |

#### 🛒 **Sheet 3: Purchases**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Date | Product | Quantity | Cost | Total | Supplier |
| PUR_001 | 2025-01-01 | E-Book Premium | 20 | 75000 | 1500000 | Content Creator A |
| PUR_002 | 2025-01-02 | Online Course | 10 | 200000 | 2000000 | Education Provider B |

#### 📊 **Sheet 4: Dashboard**
| A | B |
|---|---|
| Key | Value |
| totalProducts | 5 |
| totalSales | 10 |
| totalRevenue | 5000000 |

### 4. **Copy Spreadsheet ID**
1. Buka spreadsheet yang sudah dibuat
2. Copy ID dari URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Paste ke `SPREADSHEET_ID` di `google-sheets.ts`

### 5. **Update Konfigurasi**
Di file `src/config/google-sheets.ts`:
```typescript
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
  API_KEY: 'YOUR_API_KEY_HERE',
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  // ... rest of config
};

export const DEMO_MODE = false; // Set to false untuk menggunakan Google Sheets
```

### 6. **Test Connection**
1. Jalankan aplikasi: `npm run dev`
2. Klik tombol login
3. Authorize aplikasi dengan Google account Anda
4. Data dari Google Sheets akan dimuat ke aplikasi

## 🔧 Troubleshooting

### Error: "Google Sheets API not initialized"
- Pastikan CLIENT_ID dan API_KEY sudah benar
- Pastikan Google Sheets API sudah enabled di Google Cloud Console

### Error: "Access denied"
- Pastikan authorized origins sudah ditambahkan: `http://localhost:5173`
- Pastikan spreadsheet bisa diakses oleh email yang login

### User masih "Demo User"
- Pastikan DEMO_MODE = false
- Clear localStorage di browser
- Login ulang dengan Google

## 📋 Template Spreadsheet
Gunakan template ini: [Copy Google Sheets Template](https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/copy)
