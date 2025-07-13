// FINAL TEST: Modal Fix Verification
console.log('🎉 FINAL TEST: Modal Fix Verification');

// Test modal functionality on current page
function testCurrentPage() {
  const currentURL = window.location.href;
  console.log('📍 Current URL:', currentURL);
  
  // Test Sales page
  if (currentURL.includes('sales') || document.querySelector('h1')?.textContent?.includes('Penjualan')) {
    console.log('🎯 Testing Sales page modal...');
    testSalesModal();
  }
  // Test Purchases page  
  else if (currentURL.includes('purchases') || document.querySelector('h1')?.textContent?.includes('Pembelian')) {
    console.log('🎯 Testing Purchases page modal...');
    testPurchasesModal();
  }
  // Navigate to Sales first
  else {
    console.log('🚀 Navigating to Sales page first...');
    navigateToSales();
  }
}

function testSalesModal() {
  const button = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Tambah Penjualan')
  );
  
  if (button) {
    console.log('✅ Found "Tambah Penjualan" button');
    
    // Before click - check modal state
    const modalsBefore = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
    console.log('📋 Modals before click:', modalsBefore.length);
    
    modalsBefore.forEach((modal, i) => {
      const styles = getComputedStyle(modal);
      console.log(`Modal ${i+1} before:`, {
        display: styles.display,
        opacity: styles.opacity,
        visibility: styles.visibility
      });
    });
    
    // Click button
    console.log('🖱️ Clicking button...');
    button.click();
    
    // After click - check modal state
    setTimeout(() => {
      const modalsAfter = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
      console.log('📋 Modals after click:', modalsAfter.length);
      
      let successCount = 0;
      modalsAfter.forEach((modal, i) => {
        const styles = getComputedStyle(modal);
        const isVisible = styles.display !== 'none' && 
                         styles.visibility !== 'hidden' && 
                         parseFloat(styles.opacity) > 0;
        
        console.log(`Modal ${i+1} after:`, {
          display: styles.display,
          opacity: styles.opacity,
          visibility: styles.visibility,
          isVisible: isVisible
        });
        
        if (isVisible) {
          successCount++;
          
          // Check form content
          const form = modal.querySelector('form');
          const inputs = modal.querySelectorAll('input, select');
          const submitBtn = modal.querySelector('button[type="submit"]');
          
          console.log('📝 Form content:', {
            hasForm: !!form,
            inputCount: inputs.length,
            hasSubmit: !!submitBtn
          });
        }
      });
      
      if (successCount > 0) {
        console.log('🎉 SUCCESS! Sales modal is working!');
        
        // Test closing modal
        setTimeout(() => {
          testCloseModal();
        }, 1000);
      } else {
        console.log('❌ FAILED! Sales modal not visible');
      }
    }, 500);
    
  } else {
    console.log('❌ "Tambah Penjualan" button not found');
  }
}

function testPurchasesModal() {
  const button = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Tambah Pembelian')
  );
  
  if (button) {
    console.log('✅ Found "Tambah Pembelian" button');
    
    // Click button
    console.log('🖱️ Clicking button...');
    button.click();
    
    // Check result
    setTimeout(() => {
      const modals = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
      let visibleCount = 0;
      
      modals.forEach((modal, i) => {
        const styles = getComputedStyle(modal);
        const isVisible = styles.display !== 'none' && 
                         styles.visibility !== 'hidden' && 
                         parseFloat(styles.opacity) > 0;
        
        if (isVisible) visibleCount++;
      });
      
      if (visibleCount > 0) {
        console.log('🎉 SUCCESS! Purchases modal is working!');
      } else {
        console.log('❌ FAILED! Purchases modal not visible');
      }
    }, 500);
    
  } else {
    console.log('❌ "Tambah Pembelian" button not found');
  }
}

function testCloseModal() {
  console.log('🔄 Testing modal close functionality...');
  
  // Find close button (X)
  const closeBtn = document.querySelector('button[class*="text-gray-400"]');
  if (closeBtn) {
    console.log('✅ Found close button, clicking...');
    closeBtn.click();
    
    setTimeout(() => {
      const modals = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
      let visibleCount = 0;
      
      modals.forEach(modal => {
        const styles = getComputedStyle(modal);
        const isVisible = styles.display !== 'none' && 
                         styles.visibility !== 'hidden' && 
                         parseFloat(styles.opacity) > 0;
        if (isVisible) visibleCount++;
      });
      
      if (visibleCount === 0) {
        console.log('🎉 SUCCESS! Modal closes properly!');
      } else {
        console.log('⚠️ Modal might still be visible after close');
      }
    }, 500);
  }
}

function navigateToSales() {
  const salesLink = Array.from(document.querySelectorAll('a')).find(a => 
    a.textContent?.includes('Penjualan') || a.href?.includes('sales')
  );
  
  if (salesLink) {
    console.log('🔗 Found Sales link, navigating...');
    salesLink.click();
    
    setTimeout(() => {
      testSalesModal();
    }, 1000);
  } else {
    console.log('❌ Sales link not found in navigation');
  }
}

function runCompleteTest() {
  console.log('🚀 Running complete modal test...');
  
  // Test 1: Current page
  testCurrentPage();
  
  // Test 2: Navigate to other page after delay
  setTimeout(() => {
    if (window.location.href.includes('sales')) {
      // If on sales, test purchases
      console.log('🔄 Now testing Purchases page...');
      const purchasesLink = Array.from(document.querySelectorAll('a')).find(a => 
        a.textContent?.includes('Pembelian') || a.href?.includes('purchases')
      );
      
      if (purchasesLink) {
        purchasesLink.click();
        setTimeout(() => {
          testPurchasesModal();
        }, 1000);
      }
    } else if (window.location.href.includes('purchases')) {
      // If on purchases, test sales
      console.log('🔄 Now testing Sales page...');
      navigateToSales();
    }
  }, 3000);
}

// Summary function
function showSummary() {
  console.log('\n📊 MODAL FIX SUMMARY:');
  console.log('✅ Sales.tsx - Modal structure fixed');
  console.log('✅ Purchases.tsx - Modal structure fixed');
  console.log('✅ Conditional rendering replaced with CSS display control');
  console.log('✅ Both modals use consistent pattern');
  console.log('✅ No more manual console script needed');
  console.log('\n🎯 Expected behavior:');
  console.log('• Click "Tambah Penjualan" → Modal appears instantly');
  console.log('• Click "Tambah Pembelian" → Modal appears instantly');
  console.log('• Form fields are populated and functional');
  console.log('• Close buttons work (X, backdrop, Cancel)');
}

// Export test functions
window.finalModalTest = {
  testCurrentPage,
  testSalesModal,
  testPurchasesModal,
  testCloseModal,
  navigateToSales,
  runCompleteTest,
  showSummary
};

console.log('🔧 Final Modal Test available as window.finalModalTest');
console.log('📋 Quick test: window.finalModalTest.testCurrentPage()');
console.log('🚀 Complete test: window.finalModalTest.runCompleteTest()');
console.log('📊 Summary: window.finalModalTest.showSummary()');

// Show summary
showSummary();

// Auto-run test if on appropriate page
setTimeout(() => {
  if (window.location.href.includes('sales') || window.location.href.includes('purchases')) {
    console.log('\n🤖 Auto-running modal test...');
    testCurrentPage();
  }
}, 1000);
