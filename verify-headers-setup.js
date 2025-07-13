// Script untuk memverifikasi header Sales sheet sudah benar
// Jalankan di browser console setelah login ke aplikasi

function verifyHeadersSetup() {
    console.log("🔍 Verifying Sales sheet headers setup...");
    
    // Expected headers based on application structure
    const expectedHeaders = [
        'ID',
        'Date', 
        'Product',
        'Quantity',
        'Price',
        'FinalPrice',
        'Total',
        'Customer',
        'CustomerType',
        'DiscountType', 
        'DiscountValue',
        'PromoCode',
        'OriginalTotal',
        'Savings',
        'Notes'
    ];
    
    console.log("📋 Expected headers (15 columns A-O):");
    expectedHeaders.forEach((header, index) => {
        const column = String.fromCharCode(65 + index); // A, B, C, etc.
        console.log(`  ${column}: ${header}`);
    });
    
    // Check if we can access Google Sheets API
    if (typeof window.gapi !== 'undefined' && window.gapi.client) {
        console.log("\n🔗 Checking Google Sheets connection...");
        
        // Try to get the first row (headers) from Sales sheet
        window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0',
            range: 'Sales!A1:O1'
        }).then(response => {
            const actualHeaders = response.result.values ? response.result.values[0] : [];
            
            console.log("\n📊 Current headers in spreadsheet:");
            actualHeaders.forEach((header, index) => {
                const column = String.fromCharCode(65 + index);
                console.log(`  ${column}: ${header}`);
            });
            
            // Compare headers
            console.log("\n🔍 Header validation:");
            let allMatch = true;
            
            if (actualHeaders.length !== expectedHeaders.length) {
                console.log(`❌ Column count mismatch: Expected ${expectedHeaders.length}, got ${actualHeaders.length}`);
                allMatch = false;
            }
            
            expectedHeaders.forEach((expected, index) => {
                const actual = actualHeaders[index];
                const column = String.fromCharCode(65 + index);
                
                if (actual === expected) {
                    console.log(`✅ ${column}: ${expected}`);
                } else {
                    console.log(`❌ ${column}: Expected "${expected}", got "${actual || 'missing'}"`);
                    allMatch = false;
                }
            });
            
            if (allMatch) {
                console.log("\n🎉 Headers setup is CORRECT! ✅");
                console.log("✅ All 15 columns are properly configured");
                console.log("✅ Application will work with current structure");
            } else {
                console.log("\n⚠️ Headers setup needs FIXING! ❌");
                console.log("📋 Please use the fix-sales-headers.html file to correct the headers");
                console.log("🔗 Or manually set headers in Google Sheets:");
                console.log("   " + expectedHeaders.join('\t'));
            }
            
        }).catch(error => {
            console.error("❌ Error accessing Google Sheets:", error);
            console.log("Please ensure you're logged in and have proper permissions");
        });
        
    } else {
        console.log("❌ Google Sheets API not available");
        console.log("Please run this script from the Stock Manager application");
    }
}

// Test sales data structure
function testSalesDataStructure() {
    console.log("\n🧪 Testing sales data structure...");
    
    const testSale = {
        id: 'SAL_' + Date.now(),
        date: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        product: 'Test Product',
        quantity: 2,
        price: 10000,
        finalPrice: 9700,
        total: 19400,
        customer: 'Test Customer',
        customerType: 'reseller',
        discountType: 'none',
        discountValue: '',
        promoCode: '',
        originalTotal: 20000,
        savings: 600,
        notes: 'Test reseller discount 3%'
    };
    
    console.log("📊 Test sales data structure:");
    console.log(testSale);
    
    // Convert to array format (same as what's saved to sheets)
    const arrayFormat = [
        testSale.id,
        testSale.date,
        testSale.product,
        testSale.quantity,
        testSale.price,
        testSale.finalPrice,
        testSale.total,
        testSale.customer,
        testSale.customerType,
        testSale.discountType,
        testSale.discountValue,
        testSale.promoCode,
        testSale.originalTotal,
        testSale.savings,
        testSale.notes
    ];
    
    console.log("\n📋 Array format (what gets saved to sheets):");
    arrayFormat.forEach((value, index) => {
        const column = String.fromCharCode(65 + index);
        console.log(`  ${column}: ${value}`);
    });
    
    console.log("\n✅ Data structure is ready for new headers!");
}

// Instructions for manual header setup
function showManualSetupInstructions() {
    console.log("\n📝 Manual Header Setup Instructions:");
    console.log("1. Open Google Sheets: https://docs.google.com/spreadsheets/d/1dNSPsbJf7MUQ79F7r_DpbHLNEMo4CG7KZGYN2ubHFt0/edit");
    console.log("2. Go to 'Sales' sheet");
    console.log("3. Select cell A1");
    console.log("4. Copy and paste this header row:");
    console.log("   ID\tDate\tProduct\tQuantity\tPrice\tFinalPrice\tTotal\tCustomer\tCustomerType\tDiscountType\tDiscountValue\tPromoCode\tOriginalTotal\tSavings\tNotes");
    console.log("5. Format the header row (bold, background color)");
    console.log("6. Adjust column widths as needed");
    console.log("7. Freeze the header row (View > Freeze > 1 row)");
}

// Export functions for global use
window.verifyHeadersSetup = verifyHeadersSetup;
window.testSalesDataStructure = testSalesDataStructure;
window.showManualSetupInstructions = showManualSetupInstructions;

console.log("🎯 Sales Headers Verification Tools Loaded!");
console.log("Available functions:");
console.log("  verifyHeadersSetup() - Check if headers are correctly set");
console.log("  testSalesDataStructure() - Test data structure");
console.log("  showManualSetupInstructions() - Show manual setup steps");
console.log("\n🚀 Run verifyHeadersSetup() to start verification!");
