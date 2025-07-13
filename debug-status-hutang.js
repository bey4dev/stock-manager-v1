// Test script untuk debugging StatusHutang synchronization
// Jalankan di browser console saat aplikasi terbuka

console.log('🔧 StatusHutang Sync Debug Script');
console.log('=====================================');

// 1. Check if autoUpdateStatusHutang function exists
if (typeof autoUpdateStatusHutang !== 'undefined') {
  console.log('✅ autoUpdateStatusHutang function found');
} else {
  console.log('❌ autoUpdateStatusHutang function not found');
}

// 2. Check Google Sheets API status
if (window.gapi && window.gapi.client && window.gapi.client.sheets) {
  console.log('✅ Google Sheets API is loaded');
} else {
  console.log('❌ Google Sheets API is not loaded');
}

// 3. Check if StatusHutang sheet exists
async function checkStatusHutangSheet() {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0'
    });
    
    const sheets = response.result.sheets?.map(sheet => sheet.properties?.title) || [];
    console.log('📋 Available sheets:', sheets);
    
    if (sheets.includes('StatusHutang')) {
      console.log('✅ StatusHutang sheet exists');
      
      // Check sheet data
      const dataResponse = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
        range: 'StatusHutang!A:K'
      });
      
      const rows = dataResponse.result.values || [];
      console.log('📊 StatusHutang data rows:', rows.length);
      console.log('📄 Headers:', rows[0]);
      console.log('🔍 Sample data:', rows.slice(1, 3));
      
    } else {
      console.log('❌ StatusHutang sheet does not exist');
    }
  } catch (error) {
    console.error('❌ Error checking StatusHutang sheet:', error);
  }
}

// 4. Manual trigger test
async function testStatusHutangUpdate() {
  console.log('🧪 Testing manual StatusHutang update...');
  
  // Sample test data
  const testData = {
    contactId: 'TEST_001',
    contactName: 'Test Customer',
    contactType: 'customer',
    totalHutang: 100000,
    totalTerbayar: 50000,
    sisaHutang: 50000,
    status: 'HUTANG',
    terakhirHutang: '12/07/2025, 15.30.45',
    terakhirBayar: '12/07/2025, 16.00.00'
  };
  
  console.log('📤 Sending test data:', testData);
  
  try {
    // Call the function directly if available
    if (window.GoogleSheetsService && window.GoogleSheetsService.updateStatusHutang) {
      const result = await window.GoogleSheetsService.updateStatusHutang(testData);
      console.log('✅ Test update result:', result);
    } else {
      console.log('❌ GoogleSheetsService.updateStatusHutang not available');
    }
  } catch (error) {
    console.error('❌ Error in test update:', error);
  }
}

// Run checks
console.log('🔍 Running diagnostic checks...');
checkStatusHutangSheet();

console.log('\n📝 Manual test commands:');
console.log('- testStatusHutangUpdate() - Test manual update');
console.log('- checkStatusHutangSheet() - Check sheet status');

// Expose functions globally for manual testing
window.testStatusHutangUpdate = testStatusHutangUpdate;
window.checkStatusHutangSheet = checkStatusHutangSheet;
