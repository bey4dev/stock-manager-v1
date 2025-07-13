/**
 * Setup DebtPayments Sheet Headers Automatically
 * Script untuk otomatis setup header di sheet DebtPayments
 */

// Configuration
const CONFIG = {
    SPREADSHEET_ID: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
    SHEET_NAME: 'DebtPayments',
    API_URL: 'https://sheets.googleapis.com/v4/spreadsheets'
};

// Headers yang akan dibuat
const DEBTPAYMENTS_HEADERS = [
    'ID',           // A - Unique identifier untuk payment
    'DebtID',       // B - ID hutang yang dibayar
    'Type',         // C - Tipe pembayaran (money/product)
    'Amount',       // D - Jumlah uang (untuk tipe money)
    'Quantity',     // E - Jumlah barang (untuk tipe product)
    'ProductName',  // F - Nama produk (untuk tipe product)
    'PaymentDate',  // G - Tanggal pembayaran
    'Notes',        // H - Catatan tambahan
    'CreatedAt'     // I - Timestamp pembuatan record
];

console.log('=== SETUP DEBTPAYMENTS HEADERS ===');
console.log('');

console.log('📋 Headers yang akan dibuat:');
DEBTPAYMENTS_HEADERS.forEach((header, index) => {
    const column = String.fromCharCode(65 + index); // A, B, C, ...
    console.log(`   ${column}. ${header}`);
});

console.log('');
console.log('📊 Total: ' + DEBTPAYMENTS_HEADERS.length + ' kolom (A-' + String.fromCharCode(64 + DEBTPAYMENTS_HEADERS.length) + ')');

console.log('');
console.log('🔧 Setup Instructions:');
console.log('');

console.log('📋 MANUAL SETUP:');
console.log('1. Buka Google Sheets: https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID + '/edit');
console.log('2. Pilih tab "DebtPayments"');
console.log('3. Copy dan paste header berikut ke baris pertama (A1:I1):');
console.log('');

// Create tab-separated headers for easy copy-paste
const tabSeparatedHeaders = DEBTPAYMENTS_HEADERS.join('\t');
console.log(tabSeparatedHeaders);

console.log('');
console.log('⚡ OTOMATIS SETUP:');
console.log('1. Buka file: setup-debtpayments-headers.html');
console.log('2. Login ke Google account');
console.log('3. Klik "Setup Headers Otomatis"');

console.log('');
console.log('📝 DETAIL KOLOM:');
console.log('');

const columnDetails = [
    { col: 'A', name: 'ID', desc: 'Unique identifier untuk payment record' },
    { col: 'B', name: 'DebtID', desc: 'ID hutang yang sedang dibayar' },
    { col: 'C', name: 'Type', desc: 'Tipe pembayaran: money atau product' },
    { col: 'D', name: 'Amount', desc: 'Jumlah uang (untuk tipe money)' },
    { col: 'E', name: 'Quantity', desc: 'Jumlah barang (untuk tipe product)' },
    { col: 'F', name: 'ProductName', desc: 'Nama produk (untuk pembayaran product)' },
    { col: 'G', name: 'PaymentDate', desc: 'Tanggal pembayaran dilakukan' },
    { col: 'H', name: 'Notes', desc: 'Catatan atau keterangan tambahan' },
    { col: 'I', name: 'CreatedAt', desc: 'Timestamp pembuatan record' }
];

columnDetails.forEach(detail => {
    console.log(`${detail.col}. ${detail.name.padEnd(12)} - ${detail.desc}`);
});

console.log('');
console.log('💡 SAMPLE DATA:');
console.log('');

// Sample data untuk testing
const sampleData = [
    ['payment_001', 'debt_001', 'money', '500000', '', '', '2025-01-08', 'Pembayaran tunai', '2025-01-08 10:30:00'],
    ['payment_002', 'debt_002', 'product', '', '10', 'Beras 5kg', '2025-01-08', 'Pembayaran dengan barang', '2025-01-08 11:00:00'],
    ['payment_003', 'debt_003', 'money', '250000', '', '', '2025-01-08', 'Pembayaran sebagian', '2025-01-08 11:30:00']
];

console.log('Contoh data yang bisa dimasukkan setelah header:');
console.log('');
sampleData.forEach((row, index) => {
    console.log(`Row ${index + 2}:`);
    row.forEach((cell, cellIndex) => {
        const column = String.fromCharCode(65 + cellIndex);
        const header = DEBTPAYMENTS_HEADERS[cellIndex];
        console.log(`   ${column}${index + 2}. ${header}: ${cell || '(kosong)'}`);
    });
    console.log('');
});

console.log('✅ VERIFICATION CHECKLIST:');
console.log('');
console.log('Setelah setup, pastikan:');
console.log('□ Header sudah terisi di baris pertama (A1:I1)');
console.log('□ Ada 9 kolom dari A sampai I');
console.log('□ Format header bold dan background abu-abu');
console.log('□ Sheet siap menerima data pembayaran hutang');
console.log('□ Tidak ada typo di nama kolom');

console.log('');
console.log('🔗 USEFUL LINKS:');
console.log('');
console.log('• Spreadsheet: https://docs.google.com/spreadsheets/d/' + CONFIG.SPREADSHEET_ID + '/edit');
console.log('• Setup Tool: setup-debtpayments-headers.html');
console.log('• Documentation: OVERPAYMENT_DISPLAY_ENHANCEMENT.md');

console.log('');
console.log('🚀 Ready to setup DebtPayments headers!');

// Function untuk generate Google Sheets formula
function generateSheetsFormula() {
    console.log('');
    console.log('📊 GOOGLE SHEETS FORMULA:');
    console.log('');
    console.log('Jika ingin setup via formula, paste ini di A1:');
    console.log('');
    console.log('=ARRAYFORMULA({"' + DEBTPAYMENTS_HEADERS.join('"; "') + '"})');
    console.log('');
}

generateSheetsFormula();

// Export untuk penggunaan di browser
if (typeof window !== 'undefined') {
    window.DEBTPAYMENTS_CONFIG = {
        HEADERS: DEBTPAYMENTS_HEADERS,
        TAB_SEPARATED: tabSeparatedHeaders,
        COLUMN_DETAILS: columnDetails,
        SAMPLE_DATA: sampleData
    };
}

console.log('✨ Script completed successfully!');
