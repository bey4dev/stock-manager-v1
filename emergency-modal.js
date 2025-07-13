// Emergency Modal Fix - Run this in console if modal still blank

console.log('🚨 EMERGENCY MODAL FIX');

// Force create modal for Sales
function createEmergencySalesModal() {
  console.log('🚨 Creating emergency sales modal...');
  
  // Remove existing modal if any
  const existing = document.getElementById('emergency-sales-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'emergency-sales-modal';
  modal.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75" style="z-index: 9999;">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">🚨 Emergency Sales Form</h3>
            <button onclick="document.getElementById('emergency-sales-modal').remove()" 
                    class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          
          <form id="emergency-sales-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input type="date" id="sale-date" required value="${new Date().toISOString().split('T')[0]}"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Produk *</label>
              <select id="sale-product" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Pilih Produk</option>
                <option value="Smartphone Premium">Smartphone Premium - Rp 8.000.000</option>
                <option value="Laptop Gaming">Laptop Gaming - Rp 12.000.000</option>
                <option value="Wireless Headphones">Wireless Headphones - Rp 1.500.000</option>
                <option value="Smart Watch">Smart Watch - Rp 3.500.000</option>
                <option value="Tablet Pro">Tablet Pro - Rp 6.000.000</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kuantitas *</label>
              <input type="number" id="sale-quantity" required min="1" value="1"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <input type="text" id="sale-customer" required placeholder="Nama customer"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
            </div>
            
            <div class="flex justify-end space-x-3 pt-6">
              <button type="button" onclick="document.getElementById('emergency-sales-modal').remove()"
                      class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Batal
              </button>
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Add submit handler
  modal.querySelector('#emergency-sales-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      date: document.getElementById('sale-date').value,
      product: document.getElementById('sale-product').value,
      quantity: parseInt(document.getElementById('sale-quantity').value),
      customer: document.getElementById('sale-customer').value
    };
    
    console.log('📊 Emergency Sales Form Data:', formData);
    
    // Get product price mapping
    const productPrices = {
      'Smartphone Premium': 8000000,
      'Laptop Gaming': 12000000,
      'Wireless Headphones': 1500000,
      'Smart Watch': 3500000,
      'Tablet Pro': 6000000
    };
    
    const price = productPrices[formData.product] || 0;
    const saleData = {
      ...formData,
      price: price,
      total: price * formData.quantity
    };
    
    console.log('💾 Calling window.googleSheetsService.addSale...');
    
    try {
      // Try to call the service directly
      if (window.googleSheetsService) {
        const success = await window.googleSheetsService.addSale(saleData);
        if (success) {
          alert('✅ Penjualan berhasil ditambahkan!');
          document.getElementById('emergency-sales-modal').remove();
          location.reload(); // Refresh to see changes
        } else {
          alert('❌ Gagal menambahkan penjualan');
        }
      } else {
        console.log('⚠️ googleSheetsService not available on window');
        alert('⚠️ Service tidak tersedia. Data: ' + JSON.stringify(saleData));
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    }
  });
  
  document.body.appendChild(modal);
  console.log('✅ Emergency sales modal created');
}

// Force create modal for Purchases
function createEmergencyPurchasesModal() {
  console.log('🚨 Creating emergency purchases modal...');
  
  // Remove existing modal if any
  const existing = document.getElementById('emergency-purchases-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'emergency-purchases-modal';
  modal.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75" style="z-index: 9999;">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">🚨 Emergency Purchases Form</h3>
            <button onclick="document.getElementById('emergency-purchases-modal').remove()" 
                    class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          
          <form id="emergency-purchases-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input type="date" id="purchase-date" required value="${new Date().toISOString().split('T')[0]}"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Produk *</label>
              <select id="purchase-product" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Produk</option>
                <option value="Smartphone Premium">Smartphone Premium - Rp 6.000.000 (Cost)</option>
                <option value="Laptop Gaming">Laptop Gaming - Rp 9.000.000 (Cost)</option>
                <option value="Wireless Headphones">Wireless Headphones - Rp 1.000.000 (Cost)</option>
                <option value="Smart Watch">Smart Watch - Rp 2.500.000 (Cost)</option>
                <option value="Tablet Pro">Tablet Pro - Rp 4.500.000 (Cost)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kuantitas *</label>
              <input type="number" id="purchase-quantity" required min="1" value="1"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <input type="text" id="purchase-supplier" required placeholder="Nama supplier"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            </div>
            
            <div class="flex justify-end space-x-3 pt-6">
              <button type="button" onclick="document.getElementById('emergency-purchases-modal').remove()"
                      class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Batal
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Add submit handler
  modal.querySelector('#emergency-purchases-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      date: document.getElementById('purchase-date').value,
      product: document.getElementById('purchase-product').value,
      quantity: parseInt(document.getElementById('purchase-quantity').value),
      supplier: document.getElementById('purchase-supplier').value
    };
    
    console.log('📊 Emergency Purchases Form Data:', formData);
    
    // Get product cost mapping
    const productCosts = {
      'Smartphone Premium': 6000000,
      'Laptop Gaming': 9000000,
      'Wireless Headphones': 1000000,
      'Smart Watch': 2500000,
      'Tablet Pro': 4500000
    };
    
    const cost = productCosts[formData.product] || 0;
    const purchaseData = {
      ...formData,
      cost: cost,
      total: cost * formData.quantity
    };
    
    console.log('💾 Calling window.googleSheetsService.addPurchase...');
    
    try {
      // Try to call the service directly
      if (window.googleSheetsService) {
        const success = await window.googleSheetsService.addPurchase(purchaseData);
        if (success) {
          alert('✅ Pembelian berhasil ditambahkan!');
          document.getElementById('emergency-purchases-modal').remove();
          location.reload(); // Refresh to see changes
        } else {
          alert('❌ Gagal menambahkan pembelian');
        }
      } else {
        console.log('⚠️ googleSheetsService not available on window');
        alert('⚠️ Service tidak tersedia. Data: ' + JSON.stringify(purchaseData));
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    }
  });
  
  document.body.appendChild(modal);
  console.log('✅ Emergency purchases modal created');
}

// Auto-detect current page and show appropriate modal
function showEmergencyModal() {
  const currentPath = window.location.pathname;
  const pageTitle = document.title;
  const currentText = document.body.textContent;
  
  if (currentText.includes('Penjualan') || currentText.includes('Sales')) {
    createEmergencySalesModal();
  } else if (currentText.includes('Pembelian') || currentText.includes('Purchases')) {
    createEmergencyPurchasesModal();
  } else {
    // Default to sales
    createEmergencySalesModal();
  }
}

// Export functions
window.emergencyModal = {
  createEmergencySalesModal,
  createEmergencyPurchasesModal,
  showEmergencyModal
};

console.log('🚨 Emergency modal functions available:');
console.log('  - window.emergencyModal.createEmergencySalesModal()');
console.log('  - window.emergencyModal.createEmergencyPurchasesModal()');
console.log('  - window.emergencyModal.showEmergencyModal() (auto-detect)');
