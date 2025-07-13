// Test Form Modal - Run di Console Browser

console.log('🧪 TESTING: Form Modal Sales & Purchases');

// Test 1: Check if products are available
function testProductsAvailable() {
  console.log('\n🔍 Test 1: Checking products availability...');
  
  // Check products in select options
  const productSelects = document.querySelectorAll('select option');
  const productOptions = Array.from(productSelects).filter(opt => opt.value && opt.value !== '');
  
  console.log(`📦 Found ${productOptions.length} product options`);
  productOptions.forEach((opt, i) => {
    console.log(`${i+1}. ${opt.textContent} (value: ${opt.value})`);
  });
  
  return productOptions.length > 0;
}

// Test 2: Open Sales Modal
function testOpenSalesModal() {
  console.log('\n🔍 Test 2: Opening Sales Modal...');
  
  const salesButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Tambah Penjualan')
  );
  
  if (salesButton) {
    console.log('✅ Found "Tambah Penjualan" button');
    salesButton.click();
    
    setTimeout(() => {
      const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
      console.log('🎭 Sales modal opened:', modal !== null);
      
      if (modal) {
        const form = modal.querySelector('form');
        console.log('📋 Form found in modal:', form !== null);
        
        if (form) {
          const inputs = form.querySelectorAll('input, select');
          console.log(`📝 Found ${inputs.length} form fields`);
          
          inputs.forEach((input, i) => {
            const label = input.previousElementSibling?.textContent || 'No label';
            console.log(`${i+1}. ${label}: ${input.tagName.toLowerCase()}${input.type ? '(' + input.type + ')' : ''}`);
          });
        }
      }
    }, 100);
    
    return true;
  } else {
    console.log('❌ "Tambah Penjualan" button not found');
    return false;
  }
}

// Test 3: Fill Sales Form
function testFillSalesForm() {
  console.log('\n🔍 Test 3: Filling Sales Form...');
  
  const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
  if (!modal) {
    console.log('❌ Modal not found. Please open modal first.');
    return false;
  }
  
  const form = modal.querySelector('form');
  if (!form) {
    console.log('❌ Form not found in modal');
    return false;
  }
  
  try {
    // Fill date
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Date filled');
    }
    
    // Fill product
    const productSelect = form.querySelector('select');
    if (productSelect && productSelect.options.length > 1) {
      productSelect.value = productSelect.options[1].value;
      productSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Product selected:', productSelect.options[1].textContent);
    }
    
    // Fill quantity
    const quantityInput = form.querySelector('input[type="number"]');
    if (quantityInput) {
      quantityInput.value = '5';
      quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Quantity filled: 5');
    }
    
    // Fill customer
    const textInputs = form.querySelectorAll('input[type="text"]');
    const customerInput = textInputs[textInputs.length - 1]; // Usually the last text input
    if (customerInput) {
      customerInput.value = 'Test Customer';
      customerInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Customer filled: Test Customer');
    }
    
    console.log('📋 Form filled successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error filling form:', error);
    return false;
  }
}

// Test 4: Submit Sales Form
function testSubmitSalesForm() {
  console.log('\n🔍 Test 4: Submitting Sales Form...');
  
  const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
  if (!modal) {
    console.log('❌ Modal not found');
    return false;
  }
  
  const form = modal.querySelector('form');
  if (!form) {
    console.log('❌ Form not found');
    return false;
  }
  
  try {
    console.log('📤 Submitting form...');
    
    // Find submit button
    const submitButton = form.querySelector('button[type="submit"]') || 
                        form.querySelector('button:not([type="button"])');
    
    if (submitButton) {
      console.log('🔘 Found submit button:', submitButton.textContent);
      submitButton.click();
      console.log('✅ Form submitted');
      
      // Wait for response
      setTimeout(() => {
        console.log('⏳ Checking for success/error messages...');
      }, 1000);
      
      return true;
    } else {
      console.log('❌ Submit button not found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    return false;
  }
}

// Test 5: Close Modal
function testCloseModal() {
  console.log('\n🔍 Test 5: Closing Modal...');
  
  const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
  if (!modal) {
    console.log('ℹ️ Modal already closed');
    return true;
  }
  
  // Try clicking X button
  const closeButton = modal.querySelector('button[class*="text-gray"]') ||
                     modal.querySelector('button svg[class*="X"]')?.parentElement;
  
  if (closeButton) {
    closeButton.click();
    console.log('✅ Modal closed via X button');
    return true;
  }
  
  // Try clicking backdrop
  const backdrop = modal.querySelector('[class*="bg-gray-500"]');
  if (backdrop) {
    backdrop.click();
    console.log('✅ Modal closed via backdrop');
    return true;
  }
  
  console.log('❌ Could not find way to close modal');
  return false;
}

// Test Purchases Modal
function testPurchasesModal() {
  console.log('\n🔍 Test 6: Testing Purchases Modal...');
  
  // Navigate to purchases page first
  const purchasesNav = Array.from(document.querySelectorAll('a, button')).find(el => 
    el.textContent?.includes('Pembelian')
  );
  
  if (purchasesNav) {
    console.log('🔗 Navigating to Purchases page...');
    purchasesNav.click();
    
    setTimeout(() => {
      const purchasesButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('Tambah Pembelian')
      );
      
      if (purchasesButton) {
        console.log('✅ Found "Tambah Pembelian" button');
        purchasesButton.click();
        
        setTimeout(() => {
          const modal = document.querySelector('[class*="fixed"][class*="inset-0"]');
          console.log('🎭 Purchases modal opened:', modal !== null);
        }, 100);
      } else {
        console.log('❌ "Tambah Pembelian" button not found');
      }
    }, 500);
  } else {
    console.log('❌ Purchases navigation not found');
  }
}

// Run All Tests
function runAllTests() {
  console.log('🚀 Running all form modal tests...\n');
  
  const test1 = testProductsAvailable();
  
  if (test1) {
    setTimeout(() => {
      const test2 = testOpenSalesModal();
      
      if (test2) {
        setTimeout(() => {
          const test3 = testFillSalesForm();
          
          if (test3) {
            setTimeout(() => {
              testSubmitSalesForm();
              
              setTimeout(() => {
                testCloseModal();
                
                setTimeout(() => {
                  testPurchasesModal();
                }, 1000);
              }, 2000);
            }, 1000);
          }
        }, 500);
      }
    }, 100);
  }
  
  console.log('\n🎯 Test sequence started. Monitor console for results.');
}

// Export functions
window.testFormModal = {
  testProductsAvailable,
  testOpenSalesModal,
  testFillSalesForm,
  testSubmitSalesForm,
  testCloseModal,
  testPurchasesModal,
  runAllTests
};

console.log('🔧 Form modal test functions available as window.testFormModal');
console.log('📋 Usage: window.testFormModal.runAllTests()');
console.log('   Or run individual tests like: window.testFormModal.testOpenSalesModal()');
