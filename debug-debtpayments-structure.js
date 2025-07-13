// Debug script untuk verifikasi struktur DebtPayments sheet
console.log("=== DEBT PAYMENTS SHEET STRUCTURE CHECK ===");

// Struktur yang diharapkan untuk DebtPayments sheet:
const expectedStructure = [
  { column: 'A', name: 'ID', description: 'Payment ID' },
  { column: 'B', name: 'DebtID', description: 'Related Debt ID' },
  { column: 'C', name: 'Type', description: 'Payment Type (money/product)' },
  { column: 'D', name: 'Amount', description: 'Payment Amount (PENTING!)' },
  { column: 'E', name: 'Quantity', description: 'Product Quantity (jika product)' },
  { column: 'F', name: 'ProductName', description: 'Product Name (jika product)' },
  { column: 'G', name: 'PaymentDate', description: 'Payment Date' },
  { column: 'H', name: 'Notes', description: 'Payment Notes' },
  { column: 'I', name: 'CreatedAt', description: 'Created Timestamp' }
];

console.log("Expected DebtPayments sheet structure:");
expectedStructure.forEach(col => {
  console.log(`${col.column}: ${col.name} - ${col.description}`);
});

console.log("\n=== SAMPLE PAYMENT RECORD ===");
const samplePayment = [
  'payment_1234567890_DEBT_123',  // A: ID
  'DEBT_123',                     // B: DebtID
  'product',                      // C: Type
  50000,                          // D: Amount ← HARUS BENAR!
  5,                              // E: Quantity
  'Barang Test',                  // F: ProductName
  '2025-07-11',                   // G: PaymentDate
  'Test payment notes',           // H: Notes
  '2025-07-11T17:13:50.485Z'      // I: CreatedAt
];

console.log("Sample payment record:");
samplePayment.forEach((value, index) => {
  const col = expectedStructure[index];
  console.log(`${col.column}: ${col.name} = ${value} (${typeof value})`);
});

console.log("\n=== POTENTIAL ISSUES ===");
console.log("1. Amount field (column D) should be number, not string");
console.log("2. Check if Google Sheets is interpreting numbers correctly");
console.log("3. Verify sheet column order matches our mapping");
console.log("4. Check for any formula or formatting issues in column D");

console.log("\n=== VERIFICATION CHECKLIST ===");
console.log("□ DebtPayments sheet exists");
console.log("□ Column D is formatted as Number in Google Sheets");
console.log("□ No formulas are overriding column D values");
console.log("□ Permission to write to DebtPayments sheet");
console.log("□ Data types match expected structure");

console.log("=== END STRUCTURE CHECK ===");
