import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  Package,
  X,
  Grid,
  List
} from 'lucide-react';
import { formatWIBDate, formatWIBDateTimeForInput, getWIBTimestamp, parseWIBTimestamp } from '../utils/dateWIB';

// Helper function untuk filter tanggal dengan parsing WIB timestamp yang benar
const isDateInRange = (dateString: string, filterType: string): boolean => {
  try {
    // Parse tanggal menggunakan parseWIBTimestamp untuk menangani format WIB
    const itemDate = parseWIBTimestamp(dateString);
    if (isNaN(itemDate.getTime())) {
      console.warn('Invalid date:', dateString);
      return false;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

    switch(filterType) {
      case 'today':
        return itemDateOnly.getTime() === today.getTime();
        
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return itemDateOnly.getTime() === yesterday.getTime();
        
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDateOnly >= sevenDaysAgo && itemDateOnly <= today;
        
      case '2weeks':
        const twoWeeksAgo = new Date(today);
        twoWeeksAgo.setDate(today.getDate() - 14);
        return itemDateOnly >= twoWeeksAgo && itemDateOnly <= today;
        
      case 'thisMonth':
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return itemDateOnly >= startOfThisMonth && itemDateOnly <= endOfThisMonth;
        
      case 'lastMonth':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return itemDateOnly >= startOfLastMonth && itemDateOnly <= endOfLastMonth;
        
      default:
        return true;
    }
  } catch (error) {
    console.error('Error in date filtering:', error);
    return false;
  }
};

export default function Purchases() {
  const { state, addPurchase, addContact, loadProducts } = useApp();
  const { purchases, products, contacts, loading } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('purchases-view-mode');
    return (saved as 'grid' | 'list') || 'grid';
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    dateTime: formatWIBDateTimeForInput(),
    product: '',
    quantity: '',
    supplier: '',
    newSupplierName: ''
  });

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = productFilter === 'all' || purchase.product === productFilter;
    
    // Menggunakan filter tanggal dengan parsing WIB timestamp yang benar
    const matchesDate = dateFilter === 'all' || isDateInRange(purchase.date, dateFilter);
    
    return matchesSearch && matchesProduct && matchesDate;
  });

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('purchases-view-mode', mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📋 [PURCHASES] Form submitted:', formData);
    
    try {
      // Validation
      const finalSupplierName = formData.supplier === 'other' 
        ? formData.newSupplierName.trim()
        : formData.supplier.trim();

      if (!formData.product || !formData.quantity || !finalSupplierName) {
        alert('Semua field harus diisi');
        return;
      }

      const selectedProduct = products.find(p => p.name === formData.product);
      if (!selectedProduct) {
        console.error('❌ [PURCHASES] Product not found:', formData.product);
        alert('Pilih produk yang valid');
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Kuantitas harus berupa angka positif');
        return;
      }

      // Check if supplier exists or create new supplier
      let supplierToUse = finalSupplierName;
      
      if (formData.supplier === 'other') {
        console.log('🏪 [PURCHASES] Creating new supplier contact:', finalSupplierName);
        
        // Check if supplier with this name already exists
        const existingSupplier = contacts.find(
          contact => contact.name.toLowerCase() === finalSupplierName.toLowerCase() && contact.type === 'supplier'
        );
        
        if (!existingSupplier) {
          console.log('➕ [PURCHASES] Adding new supplier to contacts...');
          const newContact = await addContact({
            name: finalSupplierName,
            type: 'supplier'
          });
          
          if (newContact) {
            console.log('✅ [PURCHASES] New supplier added to contacts:', newContact);
            supplierToUse = newContact.name;
          } else {
            console.log('⚠️ [PURCHASES] Failed to add supplier to contacts, proceeding with name only');
          }
        } else {
          console.log('📋 [PURCHASES] Supplier already exists in contacts:', existingSupplier);
          supplierToUse = existingSupplier.name;
        }
      }

      const purchaseData = {
        date: getWIBTimestamp(new Date(formData.dateTime)),
        product: formData.product,
        quantity: quantity,
        cost: selectedProduct.cost,
        total: selectedProduct.cost * quantity,
        supplier: supplierToUse
      };

      console.log('💾 [PURCHASES] Saving purchase data:', purchaseData);
      
      const success = await addPurchase(purchaseData);
      if (success) {
        console.log('✅ [PURCHASES] Purchase added successfully');
        resetForm();
        setShowModal(false);
      } else {
        console.error('❌ [PURCHASES] Failed to add purchase');
        alert('Gagal menambah pembelian. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ [PURCHASES] Error adding purchase:', error);
      alert('Gagal menambah pembelian. Silakan coba lagi.');
    }
  };

  const resetForm = () => {
    setFormData({
      dateTime: formatWIBDateTimeForInput(),
      product: '',
      quantity: '',
      supplier: '',
      newSupplierName: ''
    });
  };

  const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembelian Stok</h1>
            <p className="text-gray-600">Kelola pembelian stok dari supplier</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              console.log('🎭 [PURCHASES] Open modal button clicked:', { 
                showModal, 
                loading, 
                productsCount: products.length 
              });
              
              // Refresh products data saat modal dibuka untuk memastikan data terbaru
              if (!loading) {
                console.log('🔄 [PURCHASES] Refreshing products data before opening modal...');
                await loadProducts();
              }
              
              setShowModal(true);
              console.log('🎭 [PURCHASES] Modal state set to true');
            }}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memuat...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2" />
                Tambah Pembelian
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Biaya</h3>
              <p className="text-2xl font-bold text-gray-900">
                Rp {totalCost.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Pembelian</h3>
              <p className="text-2xl font-bold text-gray-900">{filteredPurchases.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Rata-rata Biaya</h3>
              <p className="text-2xl font-bold text-gray-900">
                Rp {filteredPurchases.length > 0 ? (totalCost / filteredPurchases.length).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari supplier atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="2weeks">2 Minggu Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="lastMonth">Bulan Lalu</option>
            </select>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Produk</option>
              {products.filter(p => p.status === 'Active' || !p.status).map(product => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <Package className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Belum ada data pembelian</p>
              <p className="text-sm">Tambah pembelian pertama Anda dengan klik tombol di atas</p>
            </div>
          ) : (
            filteredPurchases.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{purchase.product}</h3>
                      <p className="text-sm text-gray-600 mb-2">Supplier: {purchase.supplier}</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                        {formatWIBDate(purchase.date, { includeTime: true })}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-900">
                        {purchase.quantity} unit
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Harga per Unit:</span>
                      <span className="text-gray-900">
                        Rp {purchase.cost.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Biaya:</span>
                      <span className="text-red-600 font-semibold">
                        Rp {purchase.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full">
                        Selesai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View */
        filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Package className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Belum ada data pembelian</p>
              <p className="text-sm">Tambah pembelian pertama Anda dengan klik tombol di atas</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk & Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga per Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Biaya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{purchase.product}</div>
                            <div className="text-sm text-gray-500">Supplier: {purchase.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatWIBDate(purchase.date, { includeTime: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {purchase.quantity} unit
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Rp {purchase.cost.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          Rp {purchase.total.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Tambah Pembelian Baru
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Catat pembelian stok dari supplier
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    console.log('🎭 [PURCHASES] Modal X button clicked');
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal & Waktu Pembelian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kuantitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan jumlah"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produk <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Pilih Produk</option>
                  {products.length === 0 ? (
                    <option disabled>Loading products...</option>
                  ) : (
                    products.filter(p => p.status === 'Active' || !p.status).map(product => (
                      <option key={product.id} value={product.name}>
                        {product.name} - Rp {product.cost.toLocaleString('id-ID')} (Stok: {product.stock})
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Pilih produk beserta harga beli dan stok saat ini
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  required={formData.supplier !== 'other'}
                  value={formData.supplier === 'other' ? 'other' : formData.supplier}
                  onChange={(e) => {
                    if (e.target.value === 'other') {
                      setFormData({...formData, supplier: 'other', newSupplierName: ''});
                    } else {
                      setFormData({...formData, supplier: e.target.value, newSupplierName: ''});
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Pilih Supplier</option>
                  {contacts
                    .filter(contact => contact.type === 'supplier')
                    .map(supplier => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name} {supplier.company && `(${supplier.company})`}
                      </option>
                    ))
                  }
                  <option value="other">+ Supplier Lain</option>
                </select>
                
                {formData.supplier === 'other' && (
                  <input
                    type="text"
                    required
                    placeholder="Nama supplier baru"
                    value={formData.newSupplierName || ''}
                    className="w-full mt-2 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onChange={(e) => setFormData({...formData, newSupplierName: e.target.value})}
                  />
                )}
              </div>

              {formData.product && formData.quantity && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-base font-semibold text-blue-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Ringkasan Pembelian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">
                        Harga per Unit
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        Rp {(products.find(p => p.name === formData.product)?.cost || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">
                        Quantity
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {formData.quantity} unit
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">
                        Total Biaya
                      </div>
                      <div className="text-xl font-bold text-blue-900">
                        Rp {((products.find(p => p.name === formData.product)?.cost || 0) * parseInt(formData.quantity || '0')).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Simpan Pembelian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
