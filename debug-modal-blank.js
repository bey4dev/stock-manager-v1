// DEBUG: Modal Blank Issue
console.log('🔍 DEBUGGING: Modal Blank Issue');

// Test 1: Check if modal DOM exists but invisible
function checkModalDOM() {
  console.log('\n🔍 Test 1: Checking Modal DOM...');
  
  const allModals = document.querySelectorAll('[class*="fixed"], [class*="modal"], [class*="overlay"]');
  console.log('📋 Found modal-like elements:', allModals.length);
  
  allModals.forEach((modal, i) => {
    const styles = getComputedStyle(modal);
    console.log(`Modal ${i+1}:`, {
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      zIndex: styles.zIndex,
      position: styles.position,
      classes: modal.className,
      hasContent: modal.innerHTML.length > 0
    });
  });
  
  // Check specific modal patterns
  const fixedInset = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
  console.log('🎭 Fixed inset-0 elements:', fixedInset.length);
  
  fixedInset.forEach((modal, i) => {
    console.log(`Fixed Modal ${i+1}:`, {
      visible: modal.offsetParent !== null,
      hasChildren: modal.children.length,
      innerHTML: modal.innerHTML.substring(0, 100) + '...'
    });
  });
}

// Test 2: Check React state
function checkReactState() {
  console.log('\n🔍 Test 2: Checking React State...');
  
  // Try to find React fiber nodes
  const reactNodes = document.querySelectorAll('[data-reactroot], [id="root"]');
  console.log('⚛️ React root elements:', reactNodes.length);
  
  // Check if showModal state is accessible
  const buttons = document.querySelectorAll('button');
  let addSaleButton = null;
  
  buttons.forEach(btn => {
    if (btn.textContent?.includes('Tambah Penjualan')) {
      addSaleButton = btn;
    }
  });
  
  if (addSaleButton) {
    console.log('✅ Found "Tambah Penjualan" button');
    
    // Check if button has proper React props
    const reactProps = Object.keys(addSaleButton).filter(key => key.startsWith('__react'));
    console.log('⚛️ React props on button:', reactProps.length > 0);
    
    // Try to access React internals (for debugging only)
    try {
      const reactInternalInstance = addSaleButton._reactInternalInstance || 
                                   addSaleButton.__reactInternalInstance;
      console.log('🔍 React internal instance:', !!reactInternalInstance);
    } catch (e) {
      console.log('⚠️ Could not access React internals (normal in production)');
    }
  }
}

// Test 3: Simulate button click with detailed monitoring
function simulateButtonClick() {
  console.log('\n🔍 Test 3: Simulating Button Click...');
  
  const addSaleButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Tambah Penjualan')
  );
  
  if (!addSaleButton) {
    console.log('❌ "Tambah Penjualan" button not found');
    return;
  }
  
  console.log('✅ Found button:', addSaleButton.textContent);
  
  // Monitor DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.classList && (element.classList.contains('fixed') || 
                element.querySelector?.('.fixed'))) {
              console.log('🎭 Modal DOM added:', element.className);
            }
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Click button
  console.log('🖱️ Clicking button...');
  addSaleButton.click();
  
  // Check after click
  setTimeout(() => {
    console.log('⏰ Checking 100ms after click...');
    checkModalDOM();
    
    setTimeout(() => {
      console.log('⏰ Checking 500ms after click...');
      checkModalDOM();
      observer.disconnect();
    }, 500);
  }, 100);
}

// Test 4: Check CSS issues
function checkCSSIssues() {
  console.log('\n🔍 Test 4: Checking CSS Issues...');
  
  // Check if Tailwind CSS is loaded
  const tailwindClasses = ['fixed', 'inset-0', 'z-50', 'bg-white'];
  const testDiv = document.createElement('div');
  testDiv.className = tailwindClasses.join(' ');
  document.body.appendChild(testDiv);
  
  const styles = getComputedStyle(testDiv);
  console.log('🎨 Tailwind classes working:', {
    position: styles.position === 'fixed',
    top: styles.top === '0px',
    left: styles.left === '0px',
    zIndex: parseInt(styles.zIndex) >= 50,
    background: styles.backgroundColor !== 'transparent'
  });
  
  document.body.removeChild(testDiv);
  
  // Check for CSS conflicts
  const allStylesheets = Array.from(document.styleSheets);
  console.log('📄 Loaded stylesheets:', allStylesheets.length);
  
  allStylesheets.forEach((sheet, i) => {
    try {
      console.log(`Stylesheet ${i+1}:`, sheet.href || 'inline');
    } catch (e) {
      console.log(`Stylesheet ${i+1}: Cannot access (CORS)`);
    }
  });
}

// Test 5: Check JavaScript errors
function checkJavaScriptErrors() {
  console.log('\n🔍 Test 5: Checking JavaScript Errors...');
  
  // Monitor for errors
  const originalError = console.error;
  let errorCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    console.log('🚨 JavaScript Error detected:', args);
    originalError.apply(console, args);
  };
  
  // Check for React errors
  window.addEventListener('error', (e) => {
    console.log('🚨 Window Error:', e.message, e.filename, e.lineno);
  });
  
  // Check for unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.log('🚨 Unhandled Promise Rejection:', e.reason);
  });
  
  console.log('⚠️ Error monitoring active. Error count so far:', errorCount);
}

// Test 6: Manual modal creation
function createTestModal() {
  console.log('\n🔍 Test 6: Creating Test Modal...');
  
  // Remove existing test modal
  const existingTest = document.getElementById('test-modal');
  if (existingTest) {
    existingTest.remove();
  }
  
  // Create test modal
  const testModal = document.createElement('div');
  testModal.id = 'test-modal';
  testModal.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 class="text-lg font-semibold mb-4">Test Modal</h3>
          <p>This is a test modal to check if modal rendering works.</p>
          <button onclick="document.getElementById('test-modal').remove()" 
                  class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(testModal);
  console.log('✅ Test modal created. Should be visible now.');
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.getElementById('test-modal')) {
      document.getElementById('test-modal').remove();
      console.log('🗑️ Test modal auto-removed');
    }
  }, 5000);
}

// Test 7: Check products data
function checkProductsData() {
  console.log('\n🔍 Test 7: Checking Products Data...');
  
  // Check select options
  const selects = document.querySelectorAll('select');
  console.log('📋 Found select elements:', selects.length);
  
  selects.forEach((select, i) => {
    const options = select.querySelectorAll('option');
    console.log(`Select ${i+1}:`, {
      totalOptions: options.length,
      hasProducts: options.length > 1, // More than just "Pilih Produk"
      options: Array.from(options).map(opt => opt.textContent)
    });
  });
  
  // Check if products are in memory
  const authData = localStorage.getItem('stockmanager_auth');
  console.log('💾 Auth data exists:', !!authData);
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log('🔐 User authenticated:', parsed.isAuthenticated);
    } catch (e) {
      console.log('❌ Error parsing auth data');
    }
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all modal debugging tests...\n');
  
  checkModalDOM();
  checkReactState();
  checkCSSIssues();
  checkJavaScriptErrors();
  checkProductsData();
  
  console.log('\n🎯 Running interactive tests...');
  
  // Interactive tests
  setTimeout(() => {
    simulateButtonClick();
    
    setTimeout(() => {
      createTestModal();
    }, 1000);
  }, 1000);
}

// Quick fix attempts
function quickFixes() {
  console.log('\n🔧 Attempting quick fixes...');
  
  // Fix 1: Force re-render by toggling classes
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent?.includes('Tambah')) {
      btn.style.visibility = 'visible';
      btn.style.display = 'inline-flex';
    }
  });
  
  // Fix 2: Check if z-index is blocked
  const highZIndex = 99999;
  const testElement = document.createElement('div');
  testElement.style.position = 'fixed';
  testElement.style.top = '50px';
  testElement.style.left = '50px';
  testElement.style.width = '200px';
  testElement.style.height = '100px';
  testElement.style.backgroundColor = 'red';
  testElement.style.zIndex = String(highZIndex);
  testElement.style.border = '2px solid black';
  testElement.innerHTML = 'Z-Index Test';
  testElement.id = 'z-index-test';
  
  document.body.appendChild(testElement);
  console.log('🎨 Z-index test element added (red box)');
  
  setTimeout(() => {
    document.getElementById('z-index-test')?.remove();
    console.log('🗑️ Z-index test element removed');
  }, 3000);
}

// Export functions
window.debugModalBlank = {
  checkModalDOM,
  checkReactState,
  simulateButtonClick,
  checkCSSIssues,
  checkJavaScriptErrors,
  createTestModal,
  checkProductsData,
  runAllTests,
  quickFixes
};

console.log('🔧 Modal debugging functions available as window.debugModalBlank');
console.log('📋 Usage: window.debugModalBlank.runAllTests()');
console.log('⚡ Quick test: window.debugModalBlank.createTestModal()');
