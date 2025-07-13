// INSTANT MODAL FIX - Copy paste ini ke console browser

console.log('⚡ INSTANT MODAL FIX');

// Detect current page and create working modal
const isOnPurchasesPage = document.body.textContent.includes('Pembelian') || 
                          document.body.textContent.includes('Purchases') ||
                          window.location.href.includes('purchases');

const isOnSalesPage = document.body.textContent.includes('Penjualan') || 
                      document.body.textContent.includes('Sales') ||
                      window.location.href.includes('sales');

function createInstantModal() {
  // Remove any existing modals
  document.querySelectorAll('#instant-modal, #force-modal, #force-sales-modal').forEach(el => el.remove());
  
  const isForPurchases = isOnPurchasesPage || (!isOnSalesPage && Math.random() > 0.5);
  
  const modal = document.createElement('div');
  modal.id = 'instant-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    z-index: 999999 !important;
    background: rgba(0,0,0,0.7) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 20px !important;
  `;
  
  modal.innerHTML = `
    <div style="background: white !important; padding: 30px !important; border-radius: 10px !important; 
                box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important; max-width: 500px !important; width: 100% !important;">
      <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
        ${isForPurchases ? '📦 Tambah Pembelian' : '💰 Tambah Penjualan'}
      </h3>
      
      <form id="instant-form">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tanggal *</label>
          <input type="date" id="instant-date" required value="${new Date().toISOString().split('T')[0]}"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Produk *</label>
          <select id="instant-product" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
            <option value="">Pilih Produk</option>
            <option value="Higss Domino">Higss Domino - ${isForPurchases ? 'Rp 27.000 (Cost)' : 'Rp 35.000'}</option>
            <option value="Smartphone Premium">Smartphone Premium - ${isForPurchases ? 'Rp 6.000.000 (Cost)' : 'Rp 8.000.000'}</option>
            <option value="Laptop Gaming">Laptop Gaming - ${isForPurchases ? 'Rp 9.000.000 (Cost)' : 'Rp 12.000.000'}</option>
            <option value="Tablet Pro">Tablet Pro - ${isForPurchases ? 'Rp 4.500.000 (Cost)' : 'Rp 6.000.000'}</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Kuantitas *</label>
          <input type="number" id="instant-quantity" required min="1" value="1"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">${isForPurchases ? 'Supplier' : 'Customer'} *</label>
          <input type="text" id="instant-contact" required placeholder="${isForPurchases ? 'Nama supplier' : 'Nama customer'}"
                 style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="document.getElementById('instant-modal').remove()"
                  style="padding: 10px 20px; background: #f0f0f0; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;">
            Batal
          </button>
          <button type="submit" style="padding: 10px 20px; background: ${isForPurchases ? '#2563eb' : '#16a34a'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Simpan ${isForPurchases ? 'Pembelian' : 'Penjualan'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Add form handler
  modal.querySelector('#instant-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      date: document.getElementById('instant-date').value,
      product: document.getElementById('instant-product').value,
      quantity: parseInt(document.getElementById('instant-quantity').value),
      contact: document.getElementById('instant-contact').value
    };
    
    if (!formData.product || !formData.contact) {
      alert('Mohon isi semua field!');
      return;
    }
    
    const productData = {
      'Higss Domino': { cost: 27000, price: 35000 },
      'Smartphone Premium': { cost: 6000000, price: 8000000 },
      'Laptop Gaming': { cost: 9000000, price: 12000000 },
      'Tablet Pro': { cost: 4500000, price: 6000000 }
    };
    
    const productInfo = productData[formData.product] || { cost: 50000, price: 75000 };
    
    let submitData;
    if (isForPurchases) {
      submitData = {
        date: formData.date,
        product: formData.product,
        quantity: formData.quantity,
        cost: productInfo.cost,
        total: productInfo.cost * formData.quantity,
        supplier: formData.contact
      };
    } else {
      submitData = {
        date: formData.date,
        product: formData.product,
        quantity: formData.quantity,
        price: productInfo.price,
        total: productInfo.price * formData.quantity,
        customer: formData.contact
      };
    }
    
    console.log('📤 Submitting:', submitData);
    
    try {
      let success = false;
      
      if (window.googleSheetsService) {
        if (isForPurchases) {
          success = await window.googleSheetsService.addPurchase(submitData);
        } else {
          success = await window.googleSheetsService.addSale(submitData);
        }
      }
      
      if (success) {
        alert(`✅ ${isForPurchases ? 'Pembelian' : 'Penjualan'} berhasil ditambahkan!`);
        document.getElementById('instant-modal').remove();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('❌ Gagal. Cek console untuk detail.');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    }
  });
  
  document.body.appendChild(modal);
  
  // Focus first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input, select');
    if (firstInput) firstInput.focus();
  }, 100);
  
  console.log(`✅ Instant ${isForPurchases ? 'Purchases' : 'Sales'} modal created!`);
}

// Auto-create modal
createInstantModal();

// Also expose as function
window.createInstantModal = createInstantModal;

console.log('⚡ INSTANT MODAL READY!');
console.log('🔄 To recreate: window.createInstantModal()');
