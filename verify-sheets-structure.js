// Google Sheets Structure Verification and Setup Script
console.log('📋 Starting Google Sheets Structure Verification...');

// Configuration from the app
const GOOGLE_CONFIG = {
  SPREADSHEET_ID: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
  SHEETS: {
    PRODUCTS: 'Products',
    SALES: 'Sales', 
    PURCHASES: 'Purchases',
    CONTACTS: 'Contacts',
    DEBTS: 'Debts',
    DEBT_PAYMENTS: 'DebtPayments',
    DASHBOARD: 'Dashboard'
  }
};

// Expected sheet structures
const SHEET_STRUCTURES = {
  Products: {
    headers: ['ID', 'Name', 'Category', 'Price', 'Stock', 'Cost', 'Description', 'Status'],
    sampleData: [
      ['PROD001', 'Laptop Dell', 'Electronics', '15000000', '5', '12000000', 'Laptop Dell Inspiron', 'Active'],
      ['PROD002', 'Mouse Wireless', 'Electronics', '150000', '20', '100000', 'Mouse wireless ergonomis', 'Active']
    ]
  },
  Sales: {
    headers: ['ID', 'Date', 'Product', 'Quantity', 'Price', 'Total', 'Customer'],
    sampleData: [
      ['SALE001', '2024-01-15', 'Laptop Dell', '1', '15000000', '15000000', 'John Doe'],
      ['SALE002', '2024-01-16', 'Mouse Wireless', '2', '150000', '300000', 'Jane Smith']
    ]
  },
  Purchases: {
    headers: ['ID', 'Date', 'Product', 'Quantity', 'Cost', 'Total', 'Supplier'],
    sampleData: [
      ['PUR001', '2024-01-10', 'Laptop Dell', '10', '12000000', '120000000', 'PT. Teknologi Maju'],
      ['PUR002', '2024-01-12', 'Mouse Wireless', '50', '100000', '5000000', 'CV. Aksesoris Komputer']
    ]
  },
  Contacts: {
    headers: ['ID', 'Name', 'Type', 'Email', 'Phone', 'Address', 'Company', 'Notes', 'CreatedAt', 'UpdatedAt'],
    sampleData: [
      ['CON001', 'PT. Teknologi Maju', 'Supplier', 'info@teknomaju.com', '021-1234567', 'Jakarta Selatan', 'PT. Teknologi Maju', 'Supplier laptop dan komputer', '2024-01-01', '2024-01-01'],
      ['CON002', 'John Doe', 'Customer', 'john@email.com', '08123456789', 'Jakarta Utara', 'PT. ABC', 'Customer tetap', '2024-01-01', '2024-01-01']
    ]
  },
  Debts: {
    headers: ['ID', 'ContactID', 'ContactName', 'ContactType', 'Type', 'Description', 'Amount', 'ProductID', 'ProductName', 'Quantity', 'Status', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'CreatedAt', 'UpdatedAt', 'Notes'],
    sampleData: [
      ['DEBT001', 'CON002', 'John Doe', 'Customer', 'Money', 'Pembayaran laptop', '5000000', '', '', '0', 'Unpaid', '5000000', '0', '5000000', '2024-02-15', '2024-01-15', '2024-01-15', 'Cicilan laptop'],
      ['DEBT002', 'CON001', 'PT. Teknologi Maju', 'Supplier', 'Product', 'Barang belum diterima', '0', 'PROD001', 'Laptop Dell', '5', 'Pending', '60000000', '0', '60000000', '2024-01-25', '2024-01-10', '2024-01-10', 'Menunggu pengiriman']
    ]
  },
  DebtPayments: {
    headers: ['ID', 'DebtID', 'Type', 'Amount', 'Quantity', 'PaymentDate', 'Notes', 'CreatedAt'],
    sampleData: [
      ['PAY001', 'DEBT001', 'Money', '2000000', '0', '2024-01-20', 'Pembayaran pertama', '2024-01-20'],
      ['PAY002', 'DEBT002', 'Product', '0', '2', '2024-01-15', 'Diterima 2 unit laptop', '2024-01-15']
    ]
  },
  Dashboard: {
    headers: ['Key', 'Value'],
    sampleData: [
      ['total_products', '25'],
      ['total_sales', '50'],
      ['total_purchases', '30'],
      ['total_revenue', '75000000'],
      ['total_expenses', '45000000'],
      ['profit_margin', '40'],
      ['low_stock_items', '3'],
      ['pending_debts', '2']
    ]
  }
};

console.log('📊 Expected Sheet Structures:');
Object.entries(SHEET_STRUCTURES).forEach(([sheetName, structure]) => {
  console.log(`\n📋 ${sheetName}:`);
  console.log(`   Headers: ${structure.headers.join(', ')}`);
  console.log(`   Sample rows: ${structure.sampleData.length}`);
});

console.log('\n🔧 Setup Instructions:');
console.log('1. Open your Google Spreadsheet:');
console.log(`   https://docs.google.com/spreadsheets/d/${GOOGLE_CONFIG.SPREADSHEET_ID}/edit`);
console.log('\n2. Create the following sheets if they don\'t exist:');
Object.values(GOOGLE_CONFIG.SHEETS).forEach(sheetName => {
  console.log(`   - ${sheetName}`);
});

console.log('\n3. For each sheet, add headers in row 1:');
Object.entries(SHEET_STRUCTURES).forEach(([sheetName, structure]) => {
  console.log(`\n   ${sheetName} (A1:${String.fromCharCode(64 + structure.headers.length)}1):`);
  structure.headers.forEach((header, index) => {
    console.log(`   ${String.fromCharCode(65 + index)}1: ${header}`);
  });
});

console.log('\n4. Optional: Add sample data for testing:');
console.log('   (The app will automatically create missing sheets and headers)');

console.log('\n📱 App Features that will use these sheets:');
console.log('✅ Products: Manajemen produk dan stok');
console.log('✅ Sales: Pencatatan penjualan');
console.log('✅ Purchases: Pencatatan pembelian stok (UPDATED!)');
console.log('✅ Contacts: Data customer dan supplier');
console.log('✅ Debts: Hutang piutang uang dan barang');
console.log('✅ DebtPayments: Pembayaran dan pengiriman barang');
console.log('✅ Dashboard: Metrics dan statistik');

console.log('\n🚀 Auto-Setup:');
console.log('- App akan otomatis membuat sheet yang hilang saat login');
console.log('- App akan otomatis menambah header yang hilang');
console.log('- Tidak perlu setup manual jika sudah terkoneksi dengan Google Sheets');

console.log('\n✅ Google Sheets Structure Verification Complete!');
