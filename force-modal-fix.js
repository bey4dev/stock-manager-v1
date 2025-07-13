// EMERGENCY FIX: Force Modal Visible
console.log('🚨 EMERGENCY FIX: Force Modal Visible');

function forceShowModal() {
  console.log('🔧 Forcing modal to show...');
  
  // Find modal with fixed position
  const modals = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
  console.log('🎭 Found fixed modals:', modals.length);
  
  modals.forEach((modal, i) => {
    console.log(`🔧 Fixing modal ${i+1}...`);
    
    // Force visible styles
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    modal.style.zIndex = '99999';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    // Force child elements visible
    const children = modal.querySelectorAll('*');
    children.forEach(child => {
      if (child.classList.contains('bg-white') || child.querySelector('form')) {
        child.style.display = 'block';
        child.style.visibility = 'visible';
        child.style.opacity = '1';
        child.style.position = 'relative';
        child.style.zIndex = '100000';
      }
    });
    
    console.log(`✅ Modal ${i+1} forced visible`);
  });
  
  if (modals.length === 0) {
    console.log('⚠️ No modals found in DOM');
    return false;
  }
  
  return true;
}

function forceCreateWorkingModal() {
  console.log('🚨 Creating force working modal...');
  
  // Remove any existing
  const existing = document.getElementById('force-modal');
  if (existing) existing.remove();
  
  // Create with absolute positioning and high z-index
  const modal = document.createElement('div');
  modal.id = 'force-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 999999 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white !important;
      padding: 30px !important;
      border-radius: 10px !important;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
      max-width: 500px !important;
      width: 100% !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      position: relative !important;
      z-index: 1000000 !important;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
          🚨 Force Modal - Tambah Pembelian
        </h3>
        <button onclick="document.getElementById('force-modal').remove()" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
          ×
        </button>
      </div>
      
      <form id="force-form" style="display: block;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Tanggal *</label>
          <input type="date" id="force-date" required value="${new Date().toISOString().split('T')[0]}"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Produk *</label>
          <select id="force-product" required 
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
            <option value="">Pilih Produk</option>
            <option value="Higss Domino">Higss Domino - Rp 27.000 (Cost)</option>
            <option value="Smartphone Premium">Smartphone Premium - Rp 6.000.000 (Cost)</option>
            <option value="Laptop Gaming">Laptop Gaming - Rp 9.000.000 (Cost)</option>
            <option value="Wireless Headphones">Wireless Headphones - Rp 1.000.000 (Cost)</option>
            <option value="Smart Watch">Smart Watch - Rp 2.500.000 (Cost)</option>
            <option value="Tablet Pro">Tablet Pro - Rp 4.500.000 (Cost)</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Kuantitas *</label>
          <input type="number" id="force-quantity" required min="1" value="1"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Supplier *</label>
          <input type="text" id="force-supplier" required placeholder="Nama supplier"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="document.getElementById('force-modal').remove()"
                  style="padding: 10px 20px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
            Batal
          </button>
          <button type="submit"
                  style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Simpan Pembelian
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Add form handler
  modal.querySelector('#force-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      date: document.getElementById('force-date').value,
      product: document.getElementById('force-product').value,
      quantity: parseInt(document.getElementById('force-quantity').value),
      supplier: document.getElementById('force-supplier').value
    };
    
    console.log('📊 Force Form Data:', formData);
    
    if (!formData.product || !formData.supplier) {
      alert('Mohon isi semua field!');
      return;
    }
    
    // Product cost mapping
    const productCosts = {
      'Higss Domino': 27000,
      'Smartphone Premium': 6000000,
      'Laptop Gaming': 9000000,
      'Wireless Headphones': 1000000,
      'Smart Watch': 2500000,
      'Tablet Pro': 4500000
    };
    
    const cost = productCosts[formData.product] || 100000;
    const purchaseData = {
      ...formData,
      cost: cost,
      total: cost * formData.quantity
    };
    
    console.log('💾 Submitting purchase data:', purchaseData);
    
    try {
      // Try to call the service
      if (window.googleSheetsService) {
        console.log('📤 Calling googleSheetsService.addPurchase...');
        const success = await window.googleSheetsService.addPurchase(purchaseData);
        
        if (success) {
          alert('✅ Pembelian berhasil ditambahkan!');
          document.getElementById('force-modal').remove();
          
          // Try to reload page data
          if (window.location.reload) {
            setTimeout(() => window.location.reload(), 1000);
          }
        } else {
          alert('❌ Gagal menambahkan pembelian. Cek console untuk detail.');
        }
      } else {
        console.log('⚠️ googleSheetsService not available');
        alert('⚠️ Service belum ready. Data: ' + JSON.stringify(purchaseData));
      }
    } catch (error) {
      console.error('❌ Error submitting:', error);
      alert('❌ Error: ' + error.message);
    }
  });
  
  document.body.appendChild(modal);
  console.log('✅ Force modal created and should be visible');
  
  // Focus on first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 100);
}

function forceCreateSalesModal() {
  console.log('🚨 Creating force sales modal...');
  
  // Remove any existing
  const existing = document.getElementById('force-sales-modal');
  if (existing) existing.remove();
  
  // Create with absolute positioning and high z-index
  const modal = document.createElement('div');
  modal.id = 'force-sales-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 999999 !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white !important;
      padding: 30px !important;
      border-radius: 10px !important;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
      max-width: 500px !important;
      width: 100% !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      position: relative !important;
      z-index: 1000000 !important;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
          🚨 Force Modal - Tambah Penjualan
        </h3>
        <button onclick="document.getElementById('force-sales-modal').remove()" 
                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
          ×
        </button>
      </div>
      
      <form id="force-sales-form" style="display: block;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Tanggal *</label>
          <input type="date" id="force-sales-date" required value="${new Date().toISOString().split('T')[0]}"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Produk *</label>
          <select id="force-sales-product" required 
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
            <option value="">Pilih Produk</option>
            <option value="Higss Domino">Higss Domino - Rp 35.000</option>
            <option value="Smartphone Premium">Smartphone Premium - Rp 8.000.000</option>
            <option value="Laptop Gaming">Laptop Gaming - Rp 12.000.000</option>
            <option value="Wireless Headphones">Wireless Headphones - Rp 1.500.000</option>
            <option value="Smart Watch">Smart Watch - Rp 3.500.000</option>
            <option value="Tablet Pro">Tablet Pro - Rp 6.000.000</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Kuantitas *</label>
          <input type="number" id="force-sales-quantity" required min="1" value="1"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Customer *</label>
          <input type="text" id="force-sales-customer" required placeholder="Nama customer"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="document.getElementById('force-sales-modal').remove()"
                  style="padding: 10px 20px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
            Batal
          </button>
          <button type="submit"
                  style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Simpan Penjualan
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Add form handler
  modal.querySelector('#force-sales-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      date: document.getElementById('force-sales-date').value,
      product: document.getElementById('force-sales-product').value,
      quantity: parseInt(document.getElementById('force-sales-quantity').value),
      customer: document.getElementById('force-sales-customer').value
    };
    
    console.log('📊 Force Sales Form Data:', formData);
    
    if (!formData.product || !formData.customer) {
      alert('Mohon isi semua field!');
      return;
    }
    
    // Product price mapping
    const productPrices = {
      'Higss Domino': 35000,
      'Smartphone Premium': 8000000,
      'Laptop Gaming': 12000000,
      'Wireless Headphones': 1500000,
      'Smart Watch': 3500000,
      'Tablet Pro': 6000000
    };
    
    const price = productPrices[formData.product] || 50000;
    const saleData = {
      ...formData,
      price: price,
      total: price * formData.quantity
    };
    
    console.log('💾 Submitting sale data:', saleData);
    
    try {
      // Try to call the service
      if (window.googleSheetsService) {
        console.log('📤 Calling googleSheetsService.addSale...');
        const success = await window.googleSheetsService.addSale(saleData);
        
        if (success) {
          alert('✅ Penjualan berhasil ditambahkan!');
          document.getElementById('force-sales-modal').remove();
          
          // Try to reload page data
          if (window.location.reload) {
            setTimeout(() => window.location.reload(), 1000);
          }
        } else {
          alert('❌ Gagal menambahkan penjualan. Cek console untuk detail.');
        }
      } else {
        console.log('⚠️ googleSheetsService not available');
        alert('⚠️ Service belum ready. Data: ' + JSON.stringify(saleData));
      }
    } catch (error) {
      console.error('❌ Error submitting:', error);
      alert('❌ Error: ' + error.message);
    }
  });
  
  document.body.appendChild(modal);
  console.log('✅ Force sales modal created and should be visible');
  
  // Focus on first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 100);
}

function autoDetectAndForceModal() {
  console.log('🤖 Auto-detecting page and forcing appropriate modal...');
  
  const pageText = document.body.textContent;
  
  if (pageText.includes('Pembelian') || pageText.includes('Purchases')) {
    console.log('📦 Detected Purchases page, showing purchases modal');
    forceCreateWorkingModal();
  } else if (pageText.includes('Penjualan') || pageText.includes('Sales')) {
    console.log('💰 Detected Sales page, showing sales modal');
    forceCreateSalesModal();
  } else {
    console.log('❓ Unknown page, showing purchases modal as default');
    forceCreateWorkingModal();
  }
}

// Export functions
window.forceModal = {
  forceShowModal,
  forceCreateWorkingModal,
  forceCreateSalesModal,
  autoDetectAndForceModal
};

console.log('🚨 Force modal functions available:');
console.log('  - window.forceModal.forceShowModal() (try to fix existing modal)');
console.log('  - window.forceModal.forceCreateWorkingModal() (force purchases modal)');
console.log('  - window.forceModal.forceCreateSalesModal() (force sales modal)');
console.log('  - window.forceModal.autoDetectAndForceModal() (auto-detect page)');
console.log('');
console.log('🎯 QUICK FIX: Run window.forceModal.autoDetectAndForceModal()');
