// Database Status Check - untuk debugging di browser console
// Jalankan script ini di browser console setelah login ke aplikasi

async function checkDatabaseStatus() {
  console.log('🔍 Checking Google Sheets Database Status...');
  
  if (!window.gapi || !window.gapi.client) {
    console.error('❌ Google API client not loaded');
    return;
  }

  const SPREADSHEET_ID = '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0';
  const REQUIRED_SHEETS = ['Products', 'Sales', 'Purchases', 'Contacts', 'Debts', 'DebtPayments', 'Dashboard'];
  
  try {
    // Get spreadsheet metadata
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const existingSheets = response.result.sheets?.map(sheet => sheet.properties.title) || [];
    console.log('📋 Existing sheets:', existingSheets);
    
    // Check missing sheets
    const missingSheets = REQUIRED_SHEETS.filter(sheet => !existingSheets.includes(sheet));
    if (missingSheets.length > 0) {
      console.warn('⚠️ Missing sheets:', missingSheets);
    } else {
      console.log('✅ All required sheets exist');
    }
    
    // Check headers for each existing sheet
    for (const sheetName of existingSheets.filter(sheet => REQUIRED_SHEETS.includes(sheet))) {
      try {
        const headerResponse = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A1:Z1`,
        });
        
        const headers = headerResponse.result.values?.[0] || [];
        console.log(`📋 ${sheetName} headers:`, headers);
        
        if (headers.length === 0) {
          console.warn(`⚠️ ${sheetName} has no headers`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${sheetName} headers:`, error);
      }
    }
    
    // Check data counts
    for (const sheetName of existingSheets.filter(sheet => REQUIRED_SHEETS.includes(sheet))) {
      try {
        const dataResponse = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A:A`,
        });
        
        const rowCount = (dataResponse.result.values?.length || 0) - 1; // Exclude header
        console.log(`📊 ${sheetName} data rows: ${Math.max(0, rowCount)}`);
      } catch (error) {
        console.error(`❌ Error checking ${sheetName} data:`, error);
      }
    }
    
    console.log('✅ Database status check complete');
    
  } catch (error) {
    console.error('❌ Error checking database status:', error);
  }
}

// Auto-check if in browser
if (typeof window !== 'undefined') {
  console.log('🔧 Database check function loaded. Run checkDatabaseStatus() to verify.');
  
  // Auto-run if gapi is already loaded
  if (window.gapi && window.gapi.client) {
    checkDatabaseStatus();
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkDatabaseStatus };
}
