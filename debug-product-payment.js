// Debug script untuk product payment issue
console.log("=== DEBUG PRODUCT PAYMENT ISSUE ===");

// Simulasi data untuk testing
const mockDebt = {
  id: "DEBT_TEST_123",
  amount: 0, // Ini biasanya 0 untuk product debt
  totalAmount: 100000, // Total hutang barang
  quantity: 10, // 10 pcs
  remainingAmount: 100000,
  paidAmount: 0
};

const qtyApply = 5; // Customer bayar 5 pcs

console.log("Mock debt data:", mockDebt);
console.log("Quantity to apply:", qtyApply);

// Test perhitungan yang sekarang digunakan
let pricePerUnit = 0;
if (mockDebt.totalAmount && mockDebt.quantity && mockDebt.quantity > 0) {
  pricePerUnit = mockDebt.totalAmount / mockDebt.quantity;
} else {
  pricePerUnit = 5000; // Fallback dari product cost
}

const amountToApply = pricePerUnit * qtyApply;

console.log("Price per unit calculation:", pricePerUnit);
console.log("Amount to apply:", amountToApply);
console.log("Expected amount:", 50000); // 5 pcs x 10000 per pcs

// Test payment record structure
const paymentRecord = [
  `payment_${Date.now()}_${mockDebt.id}`,
  mockDebt.id,
  'product',
  amountToApply, // D: Amount - ini yang harus benar!
  qtyApply,
  'Product Test',
  new Date().toISOString().split('T')[0],
  'Test payment',
  new Date().toISOString()
];

console.log("Payment record structure:");
paymentRecord.forEach((field, index) => {
  const columns = ['ID', 'DebtID', 'Type', 'Amount', 'Quantity', 'ProductName', 'PaymentDate', 'Notes', 'CreatedAt'];
  console.log(`${columns[index]}: ${field}`);
});

console.log("=== END DEBUG ===");
