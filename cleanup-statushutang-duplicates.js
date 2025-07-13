// Utility script untuk membersihkan data duplikat di StatusHutang sheet
// Script ini akan menghapus baris duplikat berdasarkan nama kontak

class StatusHutangCleaner {
  constructor() {
    this.SPREADSHEET_ID = '1hKKpN8Rlbh-VzI1Qiw2m-FWQpyFrczFE5uLvMUGzF8c';
    this.SHEET_NAME = 'StatusHutang';
  }

  // Fungsi untuk membersihkan duplikat
  async cleanDuplicates() {
    console.log('🧹 Starting StatusHutang duplicate cleanup...');
    
    try {
      // Note: Script ini adalah template untuk manual cleanup
      // Karena kita tidak bisa akses langsung ke Google Sheets API dari script terpisah
      // User perlu menjalankan cleanup manual di Google Sheets
      
      console.log(`
📋 MANUAL CLEANUP STEPS untuk menghapus duplikat di StatusHutang:

1. Buka Google Sheets: ${this.SPREADSHEET_ID}
2. Pilih sheet "StatusHutang"
3. Pilih semua data (Ctrl+A atau Cmd+A)
4. Klik menu "Data" → "Data cleanup" → "Remove duplicates"
5. Pilih kolom "ContactName" (kolom B) sebagai basis duplikasi
6. Centang "Data has header row"
7. Klik "Remove duplicates"

ATAU gunakan formula untuk mengidentifikasi duplikat:

1. Tambahkan kolom helper di kolom terakhir
2. Masukkan formula: =COUNTIF(B:B,B2)>1
3. Filter untuk nilai TRUE untuk melihat duplikat
4. Hapus baris duplikat secara manual (sisakan yang terbaru)

⚠️ BACKUP DATA SEBELUM MENGHAPUS!
      `);
      
    } catch (error) {
      console.error('❌ Error in cleanup process:', error);
    }
  }

  // Fungsi untuk menganalisis duplikat
  analyzeData() {
    console.log(`
🔍 ANALISIS DUPLIKAT MANUAL:

1. Buka StatusHutang sheet
2. Gunakan formula untuk menghitung duplikat per nama:
   =COUNTIF(B:B,B2)
3. Sort data berdasarkan ContactName untuk melihat duplikat berdampingan
4. Identifikasi baris mana yang perlu dihapus (biasanya yang lama)

💡 TIPS MENCEGAH DUPLIKAT:
- Pastikan fungsi updateStatusHutang menggunakan pencarian nama yang akurat
- Gunakan normalisasi nama (trim + lowercase)
- Implementasi double-check sebelum append
    `);
  }
}

// Jalankan script
const cleaner = new StatusHutangCleaner();
cleaner.cleanDuplicates();
cleaner.analyzeData();

console.log('✅ StatusHutang cleanup script completed!');
