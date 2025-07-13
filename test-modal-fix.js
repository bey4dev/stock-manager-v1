// TEST: Modal Fixed - Verification Script
console.log('🎯 TESTING: Modal Fixed - Verification');

// Test 1: Check if modal structure is correct
function testModalStructure() {
  console.log('\n✅ Test 1: Modal Structure Check');
  
  // Go to Sales page
  const salesLink = Array.from(document.querySelectorAll('a')).find(a => 
    a.textContent?.includes('Penjualan') || a.href?.includes('sales')
  );
  
  if (salesLink) {
    console.log('🔍 Found Sales link, clicking...');
    salesLink.click();
    
    setTimeout(() => {
      // Find "Tambah Penjualan" button
      const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Tambah Penjualan')
      );
      
      if (addButton) {
        console.log('✅ Found "Tambah Penjualan" button');
        
        // Check modal structure before clicking
        const modalContainers = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
        console.log('📋 Modal containers found:', modalContainers.length);
        
        modalContainers.forEach((modal, i) => {
          const styles = getComputedStyle(modal);
          console.log(`Modal ${i+1} initial state:`, {
            display: styles.display,
            opacity: styles.opacity,
            visibility: styles.visibility,
            zIndex: styles.zIndex
          });
        });
        
        // Click button and test
        console.log('🖱️ Clicking "Tambah Penjualan" button...');
        addButton.click();
        
        setTimeout(() => {
          testModalVisibility();
        }, 500);
        
      } else {
        console.log('❌ "Tambah Penjualan" button not found');
      }
    }, 1000);
  } else {
    console.log('❌ Sales link not found');
  }
}

// Test 2: Check modal visibility after click
function testModalVisibility() {
  console.log('\n✅ Test 2: Modal Visibility Check');
  
  const modalContainers = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
  console.log('📋 Modal containers after click:', modalContainers.length);
  
  let visibleModals = 0;
  
  modalContainers.forEach((modal, i) => {
    const styles = getComputedStyle(modal);
    const isVisible = styles.display !== 'none' && 
                     styles.visibility !== 'hidden' && 
                     parseFloat(styles.opacity) > 0;
    
    console.log(`Modal ${i+1} after click:`, {
      display: styles.display,
      opacity: styles.opacity,
      visibility: styles.visibility,
      zIndex: styles.zIndex,
      isVisible: isVisible
    });
    
    if (isVisible) {
      visibleModals++;
      
      // Check modal content
      const hasForm = modal.querySelector('form');
      const hasInputs = modal.querySelectorAll('input, select').length;
      const hasSubmitButton = modal.querySelector('button[type="submit"]');
      
      console.log(`Modal ${i+1} content:`, {
        hasForm: !!hasForm,
        inputCount: hasInputs,
        hasSubmitButton: !!hasSubmitButton,
        innerHTML: modal.innerHTML.substring(0, 200) + '...'
      });
    }
  });
  
  if (visibleModals > 0) {
    console.log('🎉 SUCCESS: Modal is visible after click!');
    
    // Test form functionality
    setTimeout(() => {
      testFormFunctionality();
    }, 500);
  } else {
    console.log('❌ FAILED: Modal is not visible after click');
    
    // Try force show
    console.log('🔧 Attempting to force show modal...');
    forceShowModal();
  }
}

// Test 3: Test form functionality
function testFormFunctionality() {
  console.log('\n✅ Test 3: Form Functionality Check');
  
  const visibleModal = Array.from(document.querySelectorAll('[class*="fixed"][class*="inset-0"]')).find(modal => {
    const styles = getComputedStyle(modal);
    return styles.display !== 'none' && styles.visibility !== 'hidden' && parseFloat(styles.opacity) > 0;
  });
  
  if (visibleModal) {
    const form = visibleModal.querySelector('form');
    if (form) {
      console.log('📋 Testing form elements...');
      
      // Test select dropdown
      const productSelect = form.querySelector('select');
      if (productSelect) {
        const options = productSelect.querySelectorAll('option');
        console.log('🛍️ Product select:', {
          optionCount: options.length,
          hasProducts: options.length > 1,
          firstOption: options[0]?.textContent,
          secondOption: options[1]?.textContent
        });
      }
      
      // Test inputs
      const inputs = form.querySelectorAll('input');
      console.log('📝 Form inputs:', {
        inputCount: inputs.length,
        types: Array.from(inputs).map(input => input.type)
      });
      
      // Test buttons
      const buttons = form.querySelectorAll('button');
      console.log('🔘 Form buttons:', {
        buttonCount: buttons.length,
        texts: Array.from(buttons).map(btn => btn.textContent)
      });
      
      console.log('✅ Form functionality test completed!');
      
    } else {
      console.log('❌ Form not found in modal');
    }
  } else {
    console.log('❌ No visible modal found for form test');
  }
}

// Force show modal (if needed)
function forceShowModal() {
  console.log('\n🔧 Force Show Modal');
  
  // Try to find React state and force update
  const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Tambah Penjualan')
  );
  
  if (addButton) {
    // Check if there are any modals with display: none
    const hiddenModals = Array.from(document.querySelectorAll('[class*="fixed"][class*="inset-0"]')).filter(modal => {
      const styles = getComputedStyle(modal);
      return styles.display === 'none';
    });
    
    console.log('🔍 Hidden modals found:', hiddenModals.length);
    
    if (hiddenModals.length > 0) {
      const modal = hiddenModals[0];
      console.log('🎭 Attempting to show first hidden modal...');
      
      // Force show with CSS
      modal.style.display = 'block';
      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
      
      setTimeout(() => {
        const styles = getComputedStyle(modal);
        console.log('🔍 Modal after force show:', {
          display: styles.display,
          opacity: styles.opacity,
          visibility: styles.visibility
        });
        
        if (styles.display !== 'none') {
          console.log('🎉 SUCCESS: Modal forced to show!');
        } else {
          console.log('❌ FAILED: Could not force show modal');
        }
      }, 100);
    }
  }
}

// Test 4: Test Purchases modal too
function testPurchasesModal() {
  console.log('\n✅ Test 4: Purchases Modal Check');
  
  // Go to Purchases page
  const purchasesLink = Array.from(document.querySelectorAll('a')).find(a => 
    a.textContent?.includes('Pembelian') || a.href?.includes('purchases')
  );
  
  if (purchasesLink) {
    console.log('🔍 Found Purchases link, clicking...');
    purchasesLink.click();
    
    setTimeout(() => {
      // Find "Tambah Pembelian" button
      const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Tambah Pembelian')
      );
      
      if (addButton) {
        console.log('✅ Found "Tambah Pembelian" button');
        
        // Click button and test
        console.log('🖱️ Clicking "Tambah Pembelian" button...');
        addButton.click();
        
        setTimeout(() => {
          const modalContainers = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
          let visibleModals = 0;
          
          modalContainers.forEach((modal, i) => {
            const styles = getComputedStyle(modal);
            const isVisible = styles.display !== 'none' && 
                             styles.visibility !== 'hidden' && 
                             parseFloat(styles.opacity) > 0;
            
            if (isVisible) visibleModals++;
          });
          
          if (visibleModals > 0) {
            console.log('🎉 SUCCESS: Purchases modal is visible!');
          } else {
            console.log('❌ FAILED: Purchases modal is not visible');
          }
        }, 500);
        
      } else {
        console.log('❌ "Tambah Pembelian" button not found');
      }
    }, 1000);
  } else {
    console.log('❌ Purchases link not found');
  }
}

// Run all tests
function runModalTests() {
  console.log('🚀 Starting Modal Fixed Verification Tests...\n');
  
  // Start with Sales modal test
  testModalStructure();
  
  // Test Purchases modal after Sales test completes
  setTimeout(() => {
    testPurchasesModal();
  }, 4000);
}

// Check current page and run appropriate test
function quickTest() {
  const currentPath = window.location.pathname;
  console.log('📍 Current page:', currentPath);
  
  if (currentPath.includes('sales') || document.querySelector('h1')?.textContent?.includes('Penjualan')) {
    console.log('🎯 On Sales page - testing Sales modal...');
    
    const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Tambah Penjualan')
    );
    
    if (addButton) {
      console.log('🖱️ Clicking Sales modal button...');
      addButton.click();
      
      setTimeout(() => {
        testModalVisibility();
      }, 500);
    }
  } else if (currentPath.includes('purchases') || document.querySelector('h1')?.textContent?.includes('Pembelian')) {
    console.log('🎯 On Purchases page - testing Purchases modal...');
    
    const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Tambah Pembelian')
    );
    
    if (addButton) {
      console.log('🖱️ Clicking Purchases modal button...');
      addButton.click();
      
      setTimeout(() => {
        testModalVisibility();
      }, 500);
    }
  } else {
    console.log('📝 Not on Sales/Purchases page - running full test...');
    runModalTests();
  }
}

// Export functions
window.modalFixTest = {
  testModalStructure,
  testModalVisibility,
  testFormFunctionality,
  forceShowModal,
  testPurchasesModal,
  runModalTests,
  quickTest
};

console.log('🔧 Modal Fix Test functions available as window.modalFixTest');
console.log('📋 Usage: window.modalFixTest.quickTest()');
console.log('⚡ Full test: window.modalFixTest.runModalTests()');

// Auto run quick test if on appropriate page
if (window.location.pathname.includes('sales') || window.location.pathname.includes('purchases')) {
  setTimeout(() => {
    console.log('🤖 Auto-running quick test...');
    quickTest();
  }, 2000);
}
