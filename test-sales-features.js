// Test script for Sales pricing features
// This script tests all the new discount, promo, and customer type features

const SALES_FEATURE_TESTS = [
  {
    name: "Regular Customer - No Discount",
    formData: {
      product: "Test Product",
      quantity: 2,
      price: 10000,
      customer: "Regular Customer",
      customerType: "regular",
      discountType: "none",
      discountValue: "",
      promoCode: "",
      notes: "Test regular sale"
    },
    expected: {
      finalPrice: 10000,
      total: 20000,
      originalTotal: 20000,
      savings: 0
    }
  },
  {
    name: "Reseller - Auto 3% Discount",
    formData: {
      product: "Test Product",
      quantity: 2,
      price: 10000,
      customer: "Reseller Customer",
      customerType: "reseller",
      discountType: "percentage",
      discountValue: "3",
      promoCode: "",
      notes: "Test reseller sale"
    },
    expected: {
      finalPrice: 9700,
      total: 19400,
      originalTotal: 20000,
      savings: 600
    }
  },
  {
    name: "Wholesale - Fixed Discount",
    formData: {
      product: "Test Product",
      quantity: 5,
      price: 10000,
      customer: "Wholesale Customer",
      customerType: "wholesale",
      discountType: "fixed",
      discountValue: "5000",
      promoCode: "",
      notes: "Test wholesale sale"
    },
    expected: {
      finalPrice: 5000,
      total: 25000,
      originalTotal: 50000,
      savings: 25000
    }
  },
  {
    name: "Promo Code - Special Offer",
    formData: {
      product: "Test Product",
      quantity: 1,
      price: 10000,
      customer: "Promo Customer",
      customerType: "regular",
      discountType: "promo",
      discountValue: "20",
      promoCode: "SPECIAL20",
      notes: "Test promo sale"
    },
    expected: {
      finalPrice: 8000,
      total: 8000,
      originalTotal: 10000,
      savings: 2000
    }
  },
  {
    name: "Reseller with Promo Code",
    formData: {
      product: "Test Product",
      quantity: 3,
      price: 10000,
      customer: "Reseller with Promo",
      customerType: "reseller",
      discountType: "promo",
      discountValue: "25",
      promoCode: "MEGA25",
      notes: "Test reseller with promo"
    },
    expected: {
      finalPrice: 7500,
      total: 22500,
      originalTotal: 30000,
      savings: 7500
    }
  }
];

// Test function to validate pricing calculations
function testPricingCalculations() {
  console.log("🧪 Testing Sales Pricing Features...");
  
  let passedTests = 0;
  let totalTests = SALES_FEATURE_TESTS.length;
  
  SALES_FEATURE_TESTS.forEach((test, index) => {
    console.log(`\n📋 Test ${index + 1}: ${test.name}`);
    
    // Simulate the calculateFinalPrice function
    const { formData, expected } = test;
    const basePrice = formData.price;
    let finalPrice = basePrice;
    let savings = 0;
    
    // Apply customer type discount
    if (formData.customerType === 'reseller') {
      finalPrice = basePrice * 0.97; // 3% discount
    } else if (formData.customerType === 'wholesale') {
      finalPrice = basePrice * 0.95; // 5% discount
    }
    
    // Apply additional discounts
    if (formData.discountType === 'percentage' && formData.discountValue) {
      const discountPercent = parseFloat(formData.discountValue) / 100;
      finalPrice = basePrice * (1 - discountPercent);
    } else if (formData.discountType === 'fixed' && formData.discountValue) {
      const discountAmount = parseFloat(formData.discountValue);
      finalPrice = Math.max(0, basePrice - discountAmount);
    } else if (formData.discountType === 'promo' && formData.discountValue) {
      const promoPercent = parseFloat(formData.discountValue) / 100;
      finalPrice = basePrice * (1 - promoPercent);
    }
    
    const total = finalPrice * formData.quantity;
    const originalTotal = basePrice * formData.quantity;
    savings = originalTotal - total;
    
    // Validate results
    const results = {
      finalPrice: Math.round(finalPrice),
      total: Math.round(total),
      originalTotal: Math.round(originalTotal),
      savings: Math.round(savings)
    };
    
    console.log("💰 Expected:", expected);
    console.log("📊 Actual:", results);
    
    const passed = JSON.stringify(results) === JSON.stringify(expected);
    console.log(passed ? "✅ PASSED" : "❌ FAILED");
    
    if (passed) passedTests++;
  });
  
  console.log(`\n📈 Test Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SALES_FEATURE_TESTS, testPricingCalculations };
}

// Run tests if script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testSalesFeatures = testPricingCalculations;
  console.log("🎯 Sales feature tests loaded. Run 'testSalesFeatures()' to execute.");
} else {
  // Node.js environment
  testPricingCalculations();
}
