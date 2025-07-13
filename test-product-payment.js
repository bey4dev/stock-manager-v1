// Real-time test script untuk product payment
console.log("=== REAL-TIME PRODUCT PAYMENT TEST ===");

// Function untuk simulasi test case
function testProductPaymentCalculation(testCase) {
  console.log(`\n--- Test Case: ${testCase.name} ---`);
  
  const {
    debtTotalAmount,
    debtQuantity, 
    paymentQuantity,
    expectedPricePerUnit,
    expectedAmount
  } = testCase;
  
  console.log("Input:", {
    debtTotalAmount,
    debtQuantity,
    paymentQuantity
  });
  
  // Simulasi perhitungan yang sama dengan kode
  let pricePerUnit = 0;
  if (debtTotalAmount && debtQuantity && debtQuantity > 0) {
    pricePerUnit = parseFloat((debtTotalAmount / debtQuantity).toString());
  }
  
  const amountToApply = parseFloat((pricePerUnit * paymentQuantity).toString());
  
  console.log("Calculation:", {
    pricePerUnit,
    amountToApply,
    expectedPricePerUnit,
    expectedAmount
  });
  
  console.log("Validation:", {
    pricePerUnitCorrect: pricePerUnit === expectedPricePerUnit,
    amountCorrect: amountToApply === expectedAmount,
    isValidNumber: !isNaN(amountToApply) && isFinite(amountToApply)
  });
  
  // Test payment record structure
  const paymentRecord = [
    `payment_${Date.now()}_TEST`,
    'DEBT_TEST',
    'product',
    parseFloat(amountToApply.toString()), // Amount dengan validasi tipe
    parseInt(paymentQuantity.toString()),
    'Test Product',
    new Date().toISOString().split('T')[0],
    `Test payment ${paymentQuantity} pcs`,
    new Date().toISOString()
  ];
  
  console.log("Payment Record Amount:", {
    value: paymentRecord[3],
    type: typeof paymentRecord[3],
    isNumber: typeof paymentRecord[3] === 'number',
    isValid: !isNaN(paymentRecord[3]) && isFinite(paymentRecord[3])
  });
  
  return {
    success: amountToApply === expectedAmount && !isNaN(amountToApply),
    amountToApply,
    paymentRecord
  };
}

// Test cases
const testCases = [
  {
    name: "Hutang 10 pcs @ 10000, bayar 5 pcs",
    debtTotalAmount: 100000,
    debtQuantity: 10,
    paymentQuantity: 5,
    expectedPricePerUnit: 10000,
    expectedAmount: 50000
  },
  {
    name: "Hutang 3 pcs @ 15000, bayar 2 pcs", 
    debtTotalAmount: 45000,
    debtQuantity: 3,
    paymentQuantity: 2,
    expectedPricePerUnit: 15000,
    expectedAmount: 30000
  },
  {
    name: "Hutang 1 pcs @ 25000, bayar 1 pcs",
    debtTotalAmount: 25000,
    debtQuantity: 1,
    paymentQuantity: 1,
    expectedPricePerUnit: 25000,
    expectedAmount: 25000
  }
];

// Run all test cases
let allPassed = true;
testCases.forEach(testCase => {
  const result = testProductPaymentCalculation(testCase);
  if (!result.success) {
    allPassed = false;
    console.log(`❌ FAILED: ${testCase.name}`);
  } else {
    console.log(`✅ PASSED: ${testCase.name}`);
  }
});

console.log(`\n=== FINAL RESULT ===`);
console.log(allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED");
console.log("=== END TEST ===");
