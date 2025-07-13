// Debug script untuk troubleshoot ContactSummary tidak terisi
// Run: node debug-contactsummary-issue.js

console.log('🔍 DEBUG: ContactSummary Tidak Terisi Data');
console.log('='.repeat(50));

function debugPossibleIssues() {
  console.log('\n📋 Possible Issues & Solutions:');
  
  console.log('\n❌ Issue 1: autoUpdateContactSummary() tidak terpanggil');
  console.log('Solution: Check browser console untuk error');
  console.log('Expected Log: "🔄 Auto-updating ContactSummary..."');
  
  console.log('\n❌ Issue 2: getContactSummaries() return empty array');
  console.log('Solution: Debug getContactSummaries() function');
  console.log('Expected Log: "📋 No contacts to update in summary"');
  
  console.log('\n❌ Issue 3: ensureContactSummarySheet() gagal');
  console.log('Solution: Check Google Sheets API connection');
  console.log('Expected Log: "✅ ContactSummary sheet already exists"');
  
  console.log('\n❌ Issue 4: clearSheetData() atau appendToSheet() error');
  console.log('Solution: Check Google Sheets permissions');
  console.log('Expected Error: "❌ Error auto-updating ContactSummary:"');
  
  console.log('\n❌ Issue 5: Data mapping error');
  console.log('Solution: Check summary object properties');
  console.log('Expected: summary.contactId, summary.contactName, etc.');
}

function debugStepByStep() {
  console.log('\n🔧 Step-by-Step Debugging:');
  
  console.log('\n1. Check Browser Console Logs:');
  console.log('   - Open Developer Tools (F12)');
  console.log('   - Go to Console tab');
  console.log('   - Add new debt');
  console.log('   - Look for these logs:');
  console.log('     ✅ "🔄 Auto-updating ContactSummary..."');
  console.log('     ✅ "✅ ContactSummary auto-updated with X contacts"');
  console.log('     ❌ "📋 No contacts to update in summary"');
  console.log('     ❌ "❌ Error auto-updating ContactSummary:"');
  
  console.log('\n2. Check Google Sheets:');
  console.log('   - Open your Google Sheets');
  console.log('   - Look for "ContactSummary" tab');
  console.log('   - Check if tab exists but empty');
  console.log('   - Check if headers are present (row 1)');
  
  console.log('\n3. Verify Data Loading:');
  console.log('   - Add debt with existing customer');
  console.log('   - Check if debt appears in main table');
  console.log('   - Check contact summary section untuk balance');
  
  console.log('\n4. Manual Test:');
  console.log('   - Click "Generate Report" button manually');
  console.log('   - See if that works and ContactSummary gets data');
  console.log('   - Compare manual vs auto-update behavior');
}

function debugCodeFlow() {
  console.log('\n🔄 Expected Code Flow:');
  
  console.log('\n📝 When Adding New Debt:');
  console.log('1. handleSubmit() called');
  console.log('2. Debt data saved to Google Sheets');
  console.log('3. loadData() called');
  console.log('4. autoUpdateContactSummary() called');
  console.log('5. ensureContactSummarySheet() ensures sheet exists');
  console.log('6. getContactSummaries() gets current data');
  console.log('7. Data mapped to 16-column format');
  console.log('8. clearSheetData() clears existing data');
  console.log('9. appendToSheet() adds new data');
  console.log('10. Success log printed');
  
  console.log('\n🎯 Key Functions to Debug:');
  console.log('- autoUpdateContactSummary() - Main function');
  console.log('- getContactSummaries() - Data source');
  console.log('- ensureContactSummarySheet() - Sheet creation');
  console.log('- clearSheetData() & appendToSheet() - Data writing');
}

function provideSolutions() {
  console.log('\n💡 Quick Solutions to Try:');
  
  console.log('\n✅ Solution 1: Add Debug Logs');
  console.log('Add this after autoUpdateContactSummary() call:');
  console.log('```');
  console.log('await autoUpdateContactSummary();');
  console.log('console.log("DEBUG: autoUpdateContactSummary completed");');
  console.log('```');
  
  console.log('\n✅ Solution 2: Check getContactSummaries()');
  console.log('Add this debug before autoUpdateContactSummary():');
  console.log('```');
  console.log('const summaries = getContactSummaries();');
  console.log('console.log("DEBUG: Contact summaries:", summaries);');
  console.log('console.log("DEBUG: Summaries count:", summaries.length);');
  console.log('```');
  
  console.log('\n✅ Solution 3: Try Manual Trigger');
  console.log('Test manual "Generate Report" button first');
  console.log('If manual works but auto doesn\'t:');
  console.log('- Issue is in auto-trigger timing');
  console.log('- May need to delay autoUpdateContactSummary()');
  
  console.log('\n✅ Solution 4: Check Sheet Permissions');
  console.log('Ensure Google Sheets has proper permissions:');
  console.log('- Read/Write access to spreadsheet');
  console.log('- Ability to create new sheets');
  console.log('- API limits not exceeded');
}

// Run all debug functions
debugPossibleIssues();
debugStepByStep();
debugCodeFlow();
provideSolutions();

console.log('\n' + '='.repeat(50));
console.log('🎯 NEXT STEPS:');
console.log('1. Check browser console logs saat add debt');
console.log('2. Verify getContactSummaries() returns data');
console.log('3. Test manual "Generate Report" button');
console.log('4. Check Google Sheets permissions');
console.log('5. Add debug logs untuk track flow');

console.log('\n🔍 Focus Area: Browser Console Logs');
console.log('Look for "🔄 Auto-updating ContactSummary..." log');
console.log('If not found: autoUpdateContactSummary() not called');
console.log('If found but no data: getContactSummaries() issue');
