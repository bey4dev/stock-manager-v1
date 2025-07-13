# StockManager - Digital Product Management System

Aplikasi web modern untuk manajemen pembelian stok barang dan rekap penjualan produk digital dengan dashboard GUI/UX yang elegan. Menggunakan **Google Sheets** sebagai database untuk kemudahan akses dan kolaborasi.

## 🚀 Fitur Utama

### 📊 Dashboard Interaktif
- Ringkasan metrics real-time (total produk, penjualan, pendapatan, profit)
- Chart visualisasi data penjualan dengan Chart.js
- Cards informatif dengan animasi modern
- Responsive design untuk semua perangkat

### 📦 Manajemen Produk
- CRUD lengkap untuk produk digital
- Kategori produk (Software, Template, Course, Ebook, Plugin, Theme)
- Tracking stok dengan alert minimum
- Kalkulasi profit margin otomatis
- Status aktif/nonaktif produk
- Filter dan pencarian advance

### 💰 Rekap Penjualan
- Pencatatan transaksi penjualan
- Filter berdasarkan tanggal, produk, customer
- Statistics: total revenue, quantity, average order value
- Tabel responsive dengan pagination
- Export data ke CSV/JSON

### 🛒 Pembelian Stok
- Pencatatan pembelian dari supplier
- Tracking total pengeluaran
- Management supplier
- Kalkulasi biaya dan quantity
- History pembelian lengkap

### ⚙️ Pengaturan
- Profil pengguna
- Preferensi notifikasi
- Backup & sync dengan Google Sheets
- Tema dan bahasa
- Keamanan & privasi

### 🔐 Autentikasi
- Google OAuth integration
- Demo mode untuk testing
- Secure session management
- Role-based access (siap untuk multi-user)

## 🛠️ Teknologi

### Frontend Stack
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework

### UI/UX Components
- **Lucide React** - Beautiful icons
- **Chart.js + React-Chartjs-2** - Interactive charts
- **Headless UI** - Unstyled accessible components
- **Custom animations** - Smooth transitions

### Backend Integration
- **Google Sheets API** - Database & storage
- **Google OAuth** - Authentication
- **axios** - HTTP client
- **date-fns** - Date utilities

## 📋 Prerequisites

- **Node.js** 18+ dan npm/yarn
- **Google Account** dengan akses ke Google Sheets
- **Google Cloud Console** project (untuk API keys)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd vite-project

# Install dependencies
npm install
```

### 2. Google Sheets API Setup

Ikuti dokumentasi resmi: [Google Sheets API Quickstart](https://developers.google.com/workspace/sheets/api/quickstart/js)

1. **Buat Google Cloud Project**
   - Ke [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau gunakan yang ada
   - Enable Google Sheets API

2. **Buat Credentials**
   - Ke API & Services > Credentials
   - Buat OAuth 2.0 Client ID untuk Web application
   - Tambahkan `http://localhost:5173` ke authorized origins
   - Buat API Key untuk Google Sheets API

3. **Siapkan Spreadsheet**
   - Buat Google Sheets baru
   - Copy Spreadsheet ID dari URL
   - Buat sheets: `Products`, `Sales`, `Purchases`

### 3. Konfigurasi Environment

Update file `src/config/google-sheets.ts`:

```typescript
export const GOOGLE_CONFIG = {
  CLIENT_ID: 'your-google-oauth-client-id.googleusercontent.com',
  API_KEY: 'your-google-api-key',
  SPREADSHEET_ID: 'your-spreadsheet-id',
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// Set ke false untuk production
export const DEMO_MODE = true;
```

### 4. Jalankan Development Server

```bash
# Start development server
npm run dev

# Aplikasi akan berjalan di http://localhost:5173
```

### 5. Build untuk Production

```bash
# Build aplikasi
npm run build

# Preview build
npm run preview
```

## 📖 Struktur Project

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Dashboard utama dengan charts
│   ├── Products.tsx     # Manajemen produk
│   ├── Sales.tsx        # Rekap penjualan
│   ├── Purchases.tsx    # Pembelian stok
│   ├── Settings.tsx     # Pengaturan aplikasi
│   ├── Layout.tsx       # Layout navigasi
│   └── Authentication.tsx # Login & auth
├── contexts/            # State management
│   └── AppContext.tsx   # Global state dengan hooks
├── services/            # API services
│   └── GoogleSheetsService.ts # Google Sheets integration
├── config/              # Konfigurasi
│   └── google-sheets.ts # Google API config
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## 🔧 Konfigurasi Google Sheets

### Format Data

#### Sheet: Products
| id | name | category | price | cost | stock | description | status |
|----|------|----------|-------|------|-------|-------------|--------|

#### Sheet: Sales
| id | date | product | quantity | price | total | customer |
|----|------|---------|----------|-------|-------|----------|

#### Sheet: Purchases
| id | date | product | quantity | cost | total | supplier |
|----|------|---------|----------|------|-------|----------|

### Permissions
- Share spreadsheet dengan email Google account
- Atau set ke "Anyone with the link can edit"

## 🎯 Demo Mode

Untuk testing tanpa setup Google Sheets:

```typescript
// Dalam src/config/google-sheets.ts
export const DEMO_MODE = true;
```

Demo mode menyediakan:
- Data sample produk, penjualan, pembelian
- Simulasi CRUD operations
- UI/UX lengkap tanpa backend
- Testing semua fitur

## 🔐 Security Notes

### Development
- Gunakan `localhost:5173` untuk OAuth redirect
- API keys bisa di-commit (terbatas per domain)
- Demo mode aman untuk testing

### Production
- Setup environment variables
- Gunakan domain HTTPS untuk OAuth
- Restricted API keys per domain
- Regular backup spreadsheet

## 📱 Responsive Design

- **Mobile First** - Optimized untuk mobile
- **Tablet Support** - Layout adaptif
- **Desktop Enhanced** - Full features
- **Touch Friendly** - UI elements yang mudah disentuh

## 🎨 UI/UX Features

### Modern Design
- **Gradient backgrounds** - Visual menarik
- **Glass morphism** - Efek modern
- **Smooth animations** - Micro-interactions
- **Icon consistency** - Lucide icons

### Accessibility
- **Keyboard navigation** - Full support
- **Screen reader friendly** - Semantic HTML
- **Color contrast** - WCAG compliant
- **Focus indicators** - Clear focus states

## 🚧 Development Roadmap

### Phase 1 (Current) ✅
- [x] Basic CRUD operations
- [x] Dashboard dengan charts
- [x] Responsive UI/UX
- [x] Google Sheets integration
- [x] Demo mode

### Phase 2 (Next)
- [ ] Real-time notifications
- [ ] Advanced filtering & search
- [ ] Batch operations
- [ ] Data export/import
- [ ] Multi-user support

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Integration dengan e-commerce
- [ ] API public

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Sheets API](https://developers.google.com/sheets/api) - Database backend
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

1. Cek [dokumentasi Google Sheets API](https://developers.google.com/workspace/sheets/api/quickstart/js)
2. Review konfigurasi di `src/config/google-sheets.ts`
3. Pastikan Google Cloud project sudah benar
4. Test dengan demo mode terlebih dahulu

---

**Happy Coding! 🚀**

*Built with ❤️ untuk kemudahan manajemen produk digital*
