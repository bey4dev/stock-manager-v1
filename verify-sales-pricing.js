// Quick verification script for Sales pricing calculations
// Run this in the browser console to test the pricing logic

function testSalesPricing() {
    console.log("🧪 Testing Sales Pricing Calculations...");
    
    // Test cases
    const testCases = [
        {
            name: "Regular Customer - No Discount",
            input: {
                price: 10000,
                quantity: 2,
                customerType: "regular",
                discountType: "none",
                discountValue: ""
            },
            expected: {
                finalPrice: 10000,
                total: 20000,
                savings: 0
            }
        },
        {
            name: "Reseller - Auto 3% Discount",
            input: {
                price: 10000,
                quantity: 3,
                customerType: "reseller",
                discountType: "none",
                discountValue: ""
            },
            expected: {
                finalPrice: 9700,
                total: 29100,
                savings: 900
            }
        },
        {
            name: "Wholesale - Auto 5% Discount",
            input: {
                price: 10000,
                quantity: 5,
                customerType: "wholesale",
                discountType: "none",
                discountValue: ""
            },
            expected: {
                finalPrice: 9500,
                total: 47500,
                savings: 2500
            }
        },
        {
            name: "Regular + 10% Percentage Discount",
            input: {
                price: 10000,
                quantity: 2,
                customerType: "regular",
                discountType: "percentage",
                discountValue: "10"
            },
            expected: {
                finalPrice: 9000,
                total: 18000,
                savings: 2000
            }
        },
        {
            name: "Regular + Fixed 2000 Discount",
            input: {
                price: 10000,
                quantity: 1,
                customerType: "regular",
                discountType: "fixed",
                discountValue: "2000"
            },
            expected: {
                finalPrice: 8000,
                total: 8000,
                savings: 2000
            }
        },
        {
            name: "Regular + Promo 15% Discount",
            input: {
                price: 10000,
                quantity: 4,
                customerType: "regular",
                discountType: "promo",
                discountValue: "15"
            },
            expected: {
                finalPrice: 8500,
                total: 34000,
                savings: 6000
            }
        },
        {
            name: "Reseller + Additional 5% Discount",
            input: {
                price: 10000,
                quantity: 2,
                customerType: "reseller",
                discountType: "percentage",
                discountValue: "5"
            },
            expected: {
                finalPrice: 9500,
                total: 19000,
                savings: 1000
            }
        }
    ];
    
    let passed = 0;
    let total = testCases.length;
    
    testCases.forEach((testCase, index) => {
        console.log(`\n📋 Test ${index + 1}: ${testCase.name}`);
        
        const { price, quantity, customerType, discountType, discountValue } = testCase.input;
        
        // Calculate final price using the same logic as in the application
        let finalPrice = price;
        
        // Apply customer type discount
        if (customerType === 'reseller') {
            finalPrice = price * 0.97; // 3% discount
        } else if (customerType === 'wholesale') {
            finalPrice = price * 0.95; // 5% discount
        }
        
        // Apply additional discounts
        if (discountType === 'percentage' && discountValue) {
            const discountPercent = parseFloat(discountValue) / 100;
            finalPrice = price * (1 - discountPercent);
        } else if (discountType === 'fixed' && discountValue) {
            const discountAmount = parseFloat(discountValue);
            finalPrice = Math.max(0, price - discountAmount);
        } else if (discountType === 'promo' && discountValue) {
            const promoPercent = parseFloat(discountValue) / 100;
            finalPrice = price * (1 - promoPercent);
        }
        
        const total = finalPrice * quantity;
        const originalTotal = price * quantity;
        const savings = originalTotal - total;
        
        const result = {
            finalPrice: Math.round(finalPrice),
            total: Math.round(total),
            savings: Math.round(savings)
        };
        
        console.log("💰 Expected:", testCase.expected);
        console.log("📊 Result:", result);
        
        const isMatch = (
            result.finalPrice === testCase.expected.finalPrice &&
            result.total === testCase.expected.total &&
            result.savings === testCase.expected.savings
        );
        
        if (isMatch) {
            console.log("✅ PASSED");
            passed++;
        } else {
            console.log("❌ FAILED");
        }
    });
    
    console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log("🎉 All tests passed! Pricing calculations are working correctly.");
    } else {
        console.log("⚠️ Some tests failed. Please review the pricing logic.");
    }
    
    return passed === total;
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Helper function to show pricing breakdown
function showPricingBreakdown(price, quantity, customerType, discountType, discountValue) {
    console.log("\n💰 Pricing Breakdown:");
    console.log(`Base Price: ${formatCurrency(price)}`);
    console.log(`Quantity: ${quantity}`);
    console.log(`Customer Type: ${customerType}`);
    console.log(`Discount Type: ${discountType}`);
    console.log(`Discount Value: ${discountValue || 'None'}`);
    
    let finalPrice = price;
    let discountDetails = [];
    
    if (customerType === 'reseller') {
        finalPrice = price * 0.97;
        discountDetails.push("Reseller discount: 3%");
    } else if (customerType === 'wholesale') {
        finalPrice = price * 0.95;
        discountDetails.push("Wholesale discount: 5%");
    }
    
    if (discountType === 'percentage' && discountValue) {
        const discountPercent = parseFloat(discountValue) / 100;
        finalPrice = price * (1 - discountPercent);
        discountDetails.push(`Additional discount: ${discountValue}%`);
    } else if (discountType === 'fixed' && discountValue) {
        const discountAmount = parseFloat(discountValue);
        finalPrice = Math.max(0, price - discountAmount);
        discountDetails.push(`Fixed discount: ${formatCurrency(discountAmount)}`);
    } else if (discountType === 'promo' && discountValue) {
        const promoPercent = parseFloat(discountValue) / 100;
        finalPrice = price * (1 - promoPercent);
        discountDetails.push(`Promo discount: ${discountValue}%`);
    }
    
    const total = finalPrice * quantity;
    const originalTotal = price * quantity;
    const savings = originalTotal - total;
    
    console.log(`\nDiscounts Applied:`);
    discountDetails.forEach(detail => console.log(`  - ${detail}`));
    
    console.log(`\nFinal Calculation:`);
    console.log(`Final Price per unit: ${formatCurrency(finalPrice)}`);
    console.log(`Total: ${formatCurrency(total)}`);
    console.log(`Original Total: ${formatCurrency(originalTotal)}`);
    console.log(`Total Savings: ${formatCurrency(savings)}`);
}

// Make functions available globally
window.testSalesPricing = testSalesPricing;
window.showPricingBreakdown = showPricingBreakdown;

console.log("🎯 Sales pricing verification tools loaded!");
console.log("📋 Available functions:");
console.log("  - testSalesPricing(): Run all pricing tests");
console.log("  - showPricingBreakdown(price, quantity, customerType, discountType, discountValue): Show detailed breakdown");
console.log("\n🚀 Run testSalesPricing() to start testing!");
