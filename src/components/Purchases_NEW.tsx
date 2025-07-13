import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  Package,
  Building,
  X
} from 'lucide-react';

export default function Purchases() {
  const { state, addPurchase } = useApp();
  const { purchases, products, loading } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    quantity: '',
    supplier: ''
  });

  // Debug state changes
  useEffect(() => {
    console.log('🔍 [PURCHASES] State changed:', {
      showModal,
      loading,
      productsCount: products.length,
      purchasesCount: purchases.length,
      isAuthenticated: state.isAuthenticated
    });
  }, [showModal, loading, products.length, purchases.length, state.isAuthenticated]);

  useEffect(() => {
    console.log('🔍 [PURCHASES] Modal state changed:', showModal);
  }, [showModal]);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = productFilter === 'all' || purchase.product === productFilter;
    const matchesSupplier = supplierFilter === 'all' || purchase.supplier === supplierFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const purchaseDate = new Date(purchase.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24));
      
      switch(dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesProduct && matchesSupplier && matchesDate;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📋 [PURCHASES] Form submitted:', formData);
    
    try {
      // Validation
      if (!formData.product || !formData.quantity || !formData.supplier) {
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

      const purchaseData = {
        date: formData.date,
        product: formData.product,
        quantity: quantity,
        cost: selectedProduct.cost,
        total: selectedProduct.cost * quantity,
        supplier: formData.supplier.trim()
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
      date: new Date().toISOString().split('T')[0],
      product: '',
      quantity: '',
      supplier: ''
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Enhanced Header dengan animasi dan visual lebih menarik */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 md:p-8 lg:p-10 text-white shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-full" 
                 style={{
                   backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                   backgroundSize: '30px 30px'
                 }}>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Pembelian Stok
                  </h1>
                  <div className="flex items-center gap-2 text-blue-100 text-sm">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Live Data Management</span>
                  </div>
                </div>
              </div>
              <p className="text-blue-100 text-lg md:text-xl max-w-2xl leading-relaxed">
                Kelola pembelian stok dari supplier dengan sistem yang terintegrasi dan real-time
              </p>
              
              {/* Quick Stats dalam Header */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Total Transaksi</div>
                  <div className="text-xl font-bold text-white">{filteredPurchases.length}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <div className="text-xs text-blue-200 uppercase tracking-wide">Total Investasi</div>
                  <div className="text-xl font-bold text-white">Rp {totalCost.toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
              <button
                onClick={() => {
                  console.log('🎭 [PURCHASES] Open modal button clicked:', { 
                    showModal, 
                    loading, 
                    productsCount: products.length 
                  });
                  setShowModal(true);
                  console.log('🎭 [PURCHASES] Modal state set to true');
                }}
                className="group inline-flex items-center justify-center px-6 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 min-w-[200px]"
              >
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span>Tambah Pembelian</span>
              </button>
              
              <button className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                <Package className="h-5 w-5 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards dengan layout yang lebih modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Pembelian</p>
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {filteredPurchases.length}
                </p>
                <p className="text-sm text-gray-500 font-medium">transaksi berhasil</p>
              </div>
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Quantity</p>
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {totalQuantity.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 font-medium">items dibeli</p>
              </div>
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Package className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Investasi</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none">
                  Rp {(totalCost / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500 font-medium">rupiah diinvestasikan</p>
              </div>
              <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters dengan design yang lebih modern */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Filter & Pencarian Data</h3>
              <p className="text-gray-600 mt-1">Gunakan filter untuk menemukan data pembelian dengan cepat</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-gray-700 mb-3">Pencarian Global</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari supplier atau produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Periode Tanggal</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Filter Produk</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
              >
                <option value="all">Semua Produk</option>
                {products.filter(p => p.status === 'Active' || !p.status).map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Filter Supplier</label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white font-medium"
              >
                <option value="all">Semua Supplier</option>
                {[...new Set(purchases.map(p => p.supplier))].map(supplier => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                  setProductFilter('all');
                  setSupplierFilter('all');
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <X className="h-5 w-5 mr-2" />
                Reset Filter
              </button>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all') && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-gray-600">Filter Aktif:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Search className="h-4 w-4 mr-2" />
                    "{searchTerm}"
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    📅 {dateFilter === 'today' ? 'Hari Ini' : dateFilter === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
                  </span>
                )}
                {productFilter !== 'all' && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    📦 {productFilter}
                  </span>
                )}
                {supplierFilter !== 'all' && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    🏢 {supplierFilter}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Table dengan design yang lebih modern */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Enhanced Summary Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-700">
                  Menampilkan <span className="font-black text-gray-900 text-lg">{filteredPurchases.length}</span> dari <span className="font-black text-gray-900 text-lg">{purchases.length}</span> total transaksi
                  {(searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all') && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      📊 Filter Aktif
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-700">
                  Total Nilai: <span className="font-black text-blue-600 text-lg">Rp {totalCost.toLocaleString('id-ID')}</span>
                </div>
                {(searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter('all');
                      setProductFilter('all');
                      setSupplierFilter('all');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Table View dengan design modern */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    📅 Tanggal
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    📦 Produk
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    🏢 Supplier
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    📊 Quantity
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    💰 Harga Beli
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider border-b border-gray-300">
                    💎 Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center bg-gradient-to-b from-gray-50 to-white">
                      <div className="flex flex-col items-center max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                          <ShoppingCart className="h-12 w-12 text-blue-500" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4">
                          {searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all'
                            ? '🔍 Tidak ada hasil yang sesuai'
                            : '📦 Belum ada data pembelian'
                          }
                        </h3>
                        <p className="text-gray-600 mb-8 text-lg leading-relaxed text-center">
                          {searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all'
                            ? 'Coba ubah filter atau kata kunci pencarian Anda untuk menemukan data yang sesuai'
                            : 'Mulai catat pembelian stok dari supplier untuk mengelola inventori dengan lebih baik'
                          }
                        </p>
                        {!searchTerm && dateFilter === 'all' && productFilter === 'all' && supplierFilter === 'all' && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 transform hover:scale-105"
                          >
                            <Plus className="h-6 w-6 mr-3" />
                            Tambah Pembelian Pertama
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase, index) => (
                    <tr key={purchase.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {new Date(purchase.date).getDate()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(purchase.date).toLocaleDateString('id-ID', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{purchase.product}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{purchase.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                          {purchase.quantity} unit
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          Rp {purchase.cost.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-6 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-lg">
                          💎 Rp {purchase.total.toLocaleString('id-ID')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View dengan design modern */}
          <div className="md:hidden">
            {filteredPurchases.length === 0 ? (
              <div className="px-6 py-20 text-center bg-gradient-to-b from-gray-50 to-white">
                <div className="flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-8 shadow-2xl">
                    <ShoppingCart className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">
                    {searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all'
                      ? '🔍 Tidak ada hasil yang sesuai'
                      : '📦 Belum ada data pembelian'
                    }
                  </h3>
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all'
                      ? 'Coba ubah filter atau kata kunci pencarian Anda'
                      : 'Mulai catat pembelian stok dari supplier'
                    }
                  </p>
                  {!searchTerm && dateFilter === 'all' && productFilter === 'all' && supplierFilter === 'all' && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-2xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Tambah Pembelian Pertama
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <div key={purchase.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">{purchase.product}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <span className="truncate">
                                {new Date(purchase.date).toLocaleDateString('id-ID', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building className="h-4 w-4 text-gray-600" />
                          </div>
                          <p className="text-sm text-gray-700 font-bold truncate">{purchase.supplier}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Quantity</div>
                            <div className="text-lg font-black text-gray-900">{purchase.quantity} unit</div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Harga Satuan</div>
                            <div className="text-lg font-black text-gray-900">
                              Rp {purchase.cost.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-blue-700">Total Pembelian:</span>
                            <span className="text-xl font-black text-blue-600">
                              Rp {purchase.total.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal dengan design yang lebih premium */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">
                      Tambah Pembelian Baru
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                      Catat pembelian stok dari supplier dengan lengkap
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🎭 [PURCHASES] Modal X button clicked');
                      setShowModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-3 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-3">
                      Tanggal Pembelian <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-3">
                      Kuantitas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-colors font-medium"
                      placeholder="Masukkan jumlah"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3">
                    Produk <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-colors bg-white font-medium"
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
                  <p className="mt-2 text-xs text-gray-500 font-medium">
                    Pilih produk beserta harga beli dan stok saat ini
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-3">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Nama supplier"
                    className="w-full px-4 py-4 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-colors font-medium"
                  />
                </div>

                {formData.product && formData.quantity && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200">
                    <h4 className="text-lg font-black text-blue-900 mb-6 flex items-center">
                      <DollarSign className="h-6 w-6 mr-3" />
                      Ringkasan Pembelian
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                        <div className="text-xs text-blue-600 uppercase tracking-wide font-black mb-2">
                          Harga per Unit
                        </div>
                        <div className="text-2xl font-black text-blue-900">
                          Rp {(products.find(p => p.name === formData.product)?.cost || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                        <div className="text-xs text-blue-600 uppercase tracking-wide font-black mb-2">
                          Quantity
                        </div>
                        <div className="text-2xl font-black text-blue-900">
                          {formData.quantity} unit
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                        <div className="text-xs text-blue-600 uppercase tracking-wide font-black mb-2">
                          Total Biaya
                        </div>
                        <div className="text-2xl font-black text-blue-900">
                          Rp {((products.find(p => p.name === formData.product)?.cost || 0) * parseInt(formData.quantity || '0')).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-2xl transition-colors shadow-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl transition-colors shadow-xl"
                  >
                    Simpan Pembelian
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
