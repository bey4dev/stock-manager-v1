#!/usr/bin/env node

/**
 * Google Sheets Setup Script
 * This script helps create the required sheet structure for Stock Manager
 */

const SHEET_STRUCTURES = {
  'Products': [
    'ID', 'Name', 'Category', 'Price', 'Stock', 'Cost', 'Description', 'Status'
  ],
  'Sales': [
    'ID', 'Date', 'Product', 'Quantity', 'Price', 'Total', 'Customer'
  ],
  'Purchases': [
    'ID', 'Date', 'Product', 'Quantity', 'Cost', 'Total', 'Supplier'
  ],
  'Contacts': [
    'ID', 'Name', 'Type', 'Email', 'Phone', 'Address', 'Company', 'Notes', 'CreatedAt', 'UpdatedAt'
  ],
  'Debts': [
    'ID', 'ContactID', 'ContactName', 'ContactType', 'Type', 'Description', 'Amount', 'ProductID', 'ProductName', 'Quantity', 'Status', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'CreatedAt', 'UpdatedAt', 'Notes'
  ],
  'DebtPayments': [
    'ID', 'DebtID', 'Type', 'Amount', 'Quantity', 'PaymentDate', 'Notes', 'CreatedAt'
  ],
  'Dashboard': [
    'Key', 'Value'
  ]
};

console.log('📊 Google Sheets Structure Setup Guide');
console.log('=====================================\n');

console.log('🔗 Spreadsheet ID: 1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0');
console.log('🔗 URL: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit\n');

console.log('📝 Required Sheets and Columns:\n');

Object.entries(SHEET_STRUCTURES).forEach(([sheetName, columns]) => {
  console.log(`📋 Sheet: "${sheetName}"`);
  console.log(`   Columns: ${columns.join(' | ')}`);
  console.log(`   Range: ${sheetName}!A:${String.fromCharCode(64 + columns.length)}\n`);
});

console.log('🛠️  Manual Setup Instructions:');
console.log('1. Open the Google Sheets URL above');
console.log('2. Create each sheet listed above');
console.log('3. Add the header row (first row) with the column names');
console.log('4. Make sure sheet names match exactly (case-sensitive)');
console.log('5. Leave the sheets empty except for headers\n');

console.log('✅ Sample Data for Testing:');
console.log('\n📋 Products Sheet (row 2):');
console.log('P001 | Sample Product | Software | 100000 | 50 | 75000 | Test product | Active');

console.log('\n📋 Sales Sheet (row 2):');
console.log('S001 | 2025-01-07 | Sample Product | 2 | 100000 | 200000 | Test Customer');

console.log('\n📋 Purchases Sheet (row 2):');
console.log('PU001 | 2025-01-07 | Sample Product | 10 | 75000 | 750000 | Test Supplier');

console.log('\n🎯 After setup, the Stock Manager app should work properly!');
