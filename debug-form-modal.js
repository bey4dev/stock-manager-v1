// Debug script untuk form modal sales & purchases

console.log('🔍 DEBUG: Form Modal Sales & Purchases');

// Test 1: Check if products exist
function checkProducts() {
  console.log('📦 [DEBUG] Checking products...');
  
  // From React context
  if (window.React) {
    console.log('✅ React available');
  }
  
  // Check if products are available in the app
  const productElements = document.querySelectorAll('option[value]');
  console.log('📋 Found option elements:', productElements.length);
  
  productElements.forEach((el, i) => {
    if (el.value && el.value !== '') {
      console.log(`${i+1}. ${el.textContent} (value: ${el.value})`);
    }
  });
}

// Test 2: Check modal visibility
function checkModalVisibility() {
  console.log('👀 [DEBUG] Checking modal visibility...');
  
  // Look for modal elements
  const modals = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
  console.log('🎭 Found modal elements:', modals.length);
  
  modals.forEach((modal, i) => {
    console.log(`Modal ${i+1}:`, {
      visible: modal.offsetParent !== null,
      zIndex: getComputedStyle(modal).zIndex,
      display: getComputedStyle(modal).display,
      classes: modal.className
    });
  });
}

// Test 3: Check form elements
function checkFormElements() {
  console.log('📝 [DEBUG] Checking form elements...');
  
  const forms = document.querySelectorAll('form');
  console.log('📋 Found forms:', forms.length);
  
  forms.forEach((form, i) => {
    console.log(`Form ${i+1}:`);
    
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log(`  - Inputs: ${inputs.length}`);
    
    inputs.forEach((input, j) => {
      console.log(`    ${j+1}. ${input.type || input.tagName} (name: ${input.name || 'no-name'}, value: ${input.value})`);
    });
  });
}

// Test 4: Check for React errors
function checkReactErrors() {
  console.log('⚛️ [DEBUG] Checking React errors...');
  
  // Check if there are React error boundaries
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log('❌ Found error elements:', errorElements.length);
  
  errorElements.forEach((el, i) => {
    console.log(`Error ${i+1}:`, el.textContent);
  });
}

// Test 5: Check button click handlers
function checkButtonHandlers() {
  console.log('🔘 [DEBUG] Checking button handlers...');
  
  const buttons = document.querySelectorAll('button');
  console.log('🔘 Found buttons:', buttons.length);
  
  buttons.forEach((btn, i) => {
    const text = btn.textContent?.trim();
    if (text?.includes('Tambah')) {
      console.log(`Button ${i+1}: "${text}" - has click handler: ${btn.onclick !== null}`);
    }
  });
}

// Test 6: Simulate button click
function simulateAddSaleClick() {
  console.log('🎯 [DEBUG] Simulating "Tambah Penjualan" click...');
  
  const buttons = document.querySelectorAll('button');
  let addSaleButton = null;
  
  buttons.forEach(btn => {
    if (btn.textContent?.includes('Tambah Penjualan')) {
      addSaleButton = btn;
    }
  });
  
  if (addSaleButton) {
    console.log('✅ Found "Tambah Penjualan" button');
    try {
      addSaleButton.click();
      console.log('✅ Button clicked successfully');
      
      // Check if modal appeared
      setTimeout(() => {
        const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
        console.log('🎭 Modal appeared:', modal !== null);
        if (modal) {
          console.log('🎭 Modal classes:', modal.className);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error clicking button:', error);
    }
  } else {
    console.log('❌ "Tambah Penjualan" button not found');
  }
}

// Test 7: Check localStorage/session data
function checkStorageData() {
  console.log('💾 [DEBUG] Checking storage data...');
  
  const authData = localStorage.getItem('stockmanager_auth');
  console.log('🔐 Auth data:', authData ? 'Present' : 'Missing');
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('👤 User:', parsed.user?.name || 'No name');
      console.log('🔓 Authenticated:', parsed.isAuthenticated);
    } catch (e) {
      console.log('❌ Error parsing auth data:', e);
    }
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting all debug tests...');
  
  checkProducts();
  checkModalVisibility();
  checkFormElements();
  checkReactErrors();
  checkButtonHandlers();
  checkStorageData();
  
  console.log('✅ All tests completed');
}

// Export functions for manual testing
window.debugFormModal = {
  checkProducts,
  checkModalVisibility,
  checkFormElements,
  checkReactErrors,
  checkButtonHandlers,
  simulateAddSaleClick,
  checkStorageData,
  runAllTests
};

console.log('🔧 Debug functions available as window.debugFormModal');
console.log('📋 Available functions:');
console.log('  - checkProducts()');
console.log('  - checkModalVisibility()');
console.log('  - checkFormElements()');
console.log('  - checkReactErrors()');
console.log('  - checkButtonHandlers()');
console.log('  - simulateAddSaleClick()');
console.log('  - checkStorageData()');
console.log('  - runAllTests()');
