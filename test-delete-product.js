// Debug Delete Product Script
// Jalankan di browser console untuk test delete langsung

console.log('🧪 [DELETE TEST] Testing product deletion...');

// Function to test delete product
async function testDeleteProduct(productId) {
  console.log('🗑️ [DELETE TEST] Starting delete test for product:', productId);
  
  try {
    // 1. Check API availability
    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
      console.error('❌ [DELETE TEST] Google Sheets API not available');
      return false;
    }
    
    // 2. Get spreadsheet metadata
    console.log('🔍 [DELETE TEST] Getting spreadsheet metadata...');
    const metaResponse = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
    });
    
    const sheets = metaResponse.result.sheets || [];
    console.log('📋 [DELETE TEST] Available sheets:', sheets.map(s => s.properties.title));
    
    const productsSheet = sheets.find(sheet => sheet.properties.title === 'Products');
    if (!productsSheet) {
      console.error('❌ [DELETE TEST] Products sheet not found');
      return false;
    }
    
    const sheetId = productsSheet.properties.sheetId;
    console.log('✅ [DELETE TEST] Products sheet ID:', sheetId);
    
    // 3. Get current products data
    console.log('📊 [DELETE TEST] Getting current products...');
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
      range: 'Products!A:H',
    });
    
    const rows = response.result.values || [];
    console.log('📊 [DELETE TEST] Total rows:', rows.length);
    console.log('📊 [DELETE TEST] Headers:', rows[0]);
    
    // 4. Find product to delete
    const rowIndex = rows.findIndex(row => row[0] === productId);
    if (rowIndex === -1) {
      console.error('❌ [DELETE TEST] Product not found:', productId);
      console.log('Available products:', rows.slice(1).map(row => row[0]));
      return false;
    }
    
    console.log('✅ [DELETE TEST] Found product at row:', rowIndex + 1);
    console.log('📄 [DELETE TEST] Product data:', rows[rowIndex]);
    
    // 5. Delete the row
    console.log('🗑️ [DELETE TEST] Deleting row...');
    const deleteResult = await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }]
      }
    });
    
    console.log('✅ [DELETE TEST] Delete operation completed:', deleteResult);
    
    // 6. Verify deletion
    console.log('🔍 [DELETE TEST] Verifying deletion...');
    const verifyResponse = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
      range: 'Products!A:H',
    });
    
    const newRows = verifyResponse.result.values || [];
    console.log('📊 [DELETE TEST] Rows after deletion:', newRows.length);
    
    const stillExists = newRows.some(row => row[0] === productId);
    if (stillExists) {
      console.error('❌ [DELETE TEST] Product still exists after deletion!');
      return false;
    } else {
      console.log('✅ [DELETE TEST] Product successfully deleted!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ [DELETE TEST] Error during delete test:', error);
    return false;
  }
}

// Get list of available products first
async function listProducts() {
  try {
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
      range: 'Products!A:H',
    });
    
    const rows = response.result.values || [];
    console.log('📋 [DELETE TEST] Available products:');
    rows.slice(1).forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row[0]}, Name: ${row[1]}`);
    });
    
    return rows.slice(1).map(row => row[0]);
  } catch (error) {
    console.error('❌ [DELETE TEST] Error listing products:', error);
    return [];
  }
}

// Run the test
listProducts().then(productIds => {
  if (productIds.length > 0) {
    console.log('🎯 [DELETE TEST] To test deletion, run:');
    console.log(`testDeleteProduct('${productIds[0]}')`);
    
    // Make functions globally available
    window.testDeleteProduct = testDeleteProduct;
    window.listProducts = listProducts;
  }
});
