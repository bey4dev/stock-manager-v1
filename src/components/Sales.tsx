import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Plus,
  Search,
  TrendingUp,
  Eye,
  DollarSign,
  Package,
  User,
  X
} from 'lucide-react';
import { formatWIBDate, formatWIBDateForInput, parseWIBTimestamp } from '../utils/dateWIB';
import type { Sale } from '../services/GoogleSheetsService';

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

export default function Sales() {
  const { state, addSale, addContact, loadProducts } = useApp();
  const { sales, products, contacts, loading } = state;
  
  // Monitor products data changes untuk debugging
  useEffect(() => {
    console.log('📦 [SALES] Products data updated:', {
      productCount: products.length,
      sampleProducts: products.slice(0, 3).map(p => ({
        name: p.name,
        stock: p.stock,
        status: p.status
      }))
    });
  }, [products]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    date: formatWIBDateForInput(),
    product: '',
    quantity: '',
    customer: '',
    newCustomerName: '',
    customerType: 'regular', // regular, reseller, wholesale
    discountType: 'none', // none, percentage, fixed, promo
    discountValue: '',
    promoCode: '',
    finalPrice: '',
    notes: ''
  });

  // Predefined promo codes
  const promoCodes = {
    'NEW2025': { type: 'percentage', value: 15, description: 'New Year 2025 - 15% Off' },
    'BULK50': { type: 'percentage', value: 10, description: 'Bulk Purchase - 10% Off' },
    'RESELLER20': { type: 'percentage', value: 20, description: 'Reseller Special - 20% Off' },
    'CLEARANCE': { type: 'fixed', value: 50000, description: 'Clearance Sale - Rp 50k Off' }
  };

  // Customer type pricing rules
  const customerTypePricing = {
    regular: { discount: 0, description: 'Regular Customer' },
    reseller: { discount: 3, description: 'Reseller (3% Off)' },
    wholesale: { discount: 5, description: 'Wholesale (5% Off)' }
  };

  // Function to handle sale detail
  const handleViewDetail = (sale: Sale) => {
    console.log('👁️ [SALES] Viewing sale detail:', sale);
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedSale(null);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = productFilter === 'all' || sale.product === productFilter;
    
    // Menggunakan filter tanggal dengan parsing WIB timestamp yang benar
    const matchesDate = dateFilter === 'all' || isDateInRange(sale.date, dateFilter);
    
    return matchesSearch && matchesProduct && matchesDate;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📋 [SALES] Form submitted:', formData);
    
    try {
      // Determine final customer name
      const finalCustomerName = formData.customer === 'other' 
        ? formData.newCustomerName.trim()
        : formData.customer.trim();

      // Validation
      if (!formData.product || !formData.quantity || !finalCustomerName) {
        alert('Semua field harus diisi');
        return;
      }

      const selectedProduct = products.find(p => p.name === formData.product);
      if (!selectedProduct) {
        console.error('❌ [SALES] Product not found:', formData.product);
        alert('Pilih produk yang valid');
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Kuantitas harus berupa angka positif');
        return;
      }

      // Check stock
      if (quantity > selectedProduct.stock) {
        alert(`Stok tidak mencukupi. Stok tersedia: ${selectedProduct.stock}`);
        return;
      }

      // Check if customer exists or create new customer
      let customerToUse = finalCustomerName;

      if (formData.customer === 'other') {
        console.log('👤 [SALES] Creating new customer contact:', finalCustomerName);
        
        // Check if customer with this name already exists
        const existingCustomer = contacts.find(
          contact => contact.name.toLowerCase() === finalCustomerName.toLowerCase() && contact.type === 'customer'
        );

        if (!existingCustomer) {
          console.log('➕ [SALES] Adding new customer to contacts...');
          
          const newCustomer = {
            name: finalCustomerName,
            type: 'customer' as const,
            email: '',
            phone: '',
            address: '',
            company: '',
            notes: `Auto-created from sales on ${formatWIBDate(new Date())}`
          };

          const contactSuccess = await addContact(newCustomer);
          if (contactSuccess) {
            console.log('✅ [SALES] New customer contact added');
          } else {
            console.warn('⚠️ [SALES] Failed to add customer contact, continuing with sale...');
          }
        } else {
          console.log('👤 [SALES] Customer already exists in contacts');
        }
      }

      const saleData = {
        date: formData.date,
        product: formData.product,
        quantity: quantity,
        price: selectedProduct.price,
        finalPrice: parseInt(formData.finalPrice) || (selectedProduct.price * quantity),
        total: parseInt(formData.finalPrice) || (selectedProduct.price * quantity),
        customer: customerToUse,
        customerType: formData.customerType,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        promoCode: formData.promoCode,
        originalTotal: selectedProduct.price * quantity,
        savings: (selectedProduct.price * quantity) - (parseInt(formData.finalPrice) || (selectedProduct.price * quantity)),
        notes: formData.notes
      };

      console.log('💾 [SALES] Saving sale data:', saleData);
      
      const success = await addSale(saleData);
      if (success) {
        console.log('✅ [SALES] Sale added successfully');
        resetForm();
        setShowModal(false);
      } else {
        console.error('❌ [SALES] Failed to add sale');
        alert('Gagal menambah penjualan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ [SALES] Error adding sale:', error);
      alert('Gagal menambah penjualan. Silakan coba lagi.');
    }
  };

  const resetForm = () => {
    setFormData({
      date: formatWIBDateForInput(),
      product: '',
      quantity: '',
      customer: '',
      newCustomerName: '',
      customerType: 'regular',
      discountType: 'none',
      discountValue: '',
      promoCode: '',
      finalPrice: '',
      notes: ''
    });
  };

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Calculate final price with all discounts
  const calculateFinalPrice = () => {
    if (!formData.product || !formData.quantity) return 0;
    
    const selectedProduct = products.find(p => p.name === formData.product);
    if (!selectedProduct) return 0;
    
    const quantity = parseInt(formData.quantity) || 0;
    const basePrice = selectedProduct.price * quantity;
    
    let finalPrice = basePrice;
    let totalDiscountPercentage = 0;
    let fixedDiscount = 0;
    
    // Apply customer type discount
    const customerDiscount = customerTypePricing[formData.customerType as keyof typeof customerTypePricing]?.discount || 0;
    totalDiscountPercentage += customerDiscount;
    
    // Apply additional discounts
    if (formData.discountType === 'percentage') {
      const additionalDiscount = parseFloat(formData.discountValue) || 0;
      totalDiscountPercentage += additionalDiscount;
    } else if (formData.discountType === 'fixed') {
      fixedDiscount = parseFloat(formData.discountValue) || 0;
    } else if (formData.discountType === 'promo' && formData.promoCode) {
      const promo = promoCodes[formData.promoCode as keyof typeof promoCodes];
      if (promo) {
        if (promo.type === 'percentage') {
          totalDiscountPercentage += promo.value;
        } else if (promo.type === 'fixed') {
          fixedDiscount += promo.value;
        }
      }
    }
    
    // Apply percentage discounts
    finalPrice = basePrice * (1 - totalDiscountPercentage / 100);
    
    // Apply fixed discounts
    finalPrice = Math.max(0, finalPrice - fixedDiscount);
    
    return Math.round(finalPrice);
  };

  // Auto-calculate price when relevant fields change
  useEffect(() => {
    const price = calculateFinalPrice();
    setFormData(prev => ({ ...prev, finalPrice: price.toString() }));
  }, [formData.product, formData.quantity, formData.customerType, formData.discountType, formData.discountValue, formData.promoCode, products]);

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
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Penjualan</h1>
            <p className="text-gray-600">Kelola transaksi penjualan produk</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              console.log('🎭 [SALES] Open modal button clicked:', { 
                showModal, 
                loading, 
                productsCount: products.length 
              });
              
              // Refresh products data saat modal dibuka untuk memastikan stok terbaru
              if (!loading) {
                console.log('🔄 [SALES] Refreshing products data before opening modal...');
                await loadProducts();
              }
              
              setShowModal(true);
              console.log('🎭 [SALES] Modal state set to true');
            }}
            className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                Tambah Penjualan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">
                Rp {totalRevenue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Penjualan</h3>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Kuantitas Terjual</h3>
              <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Rata-rata Order</h3>
              <p className="text-2xl font-bold text-gray-900">
                Rp {averageOrderValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
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
                placeholder="Cari customer atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Semua Produk</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuantitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Satuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatWIBDate(sale.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{sale.product}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {sale.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    Rp {sale.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleViewDetail(sale)}
                      className="text-blue-600 hover:text-blue-900 flex items-center transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada data penjualan yang ditemukan</p>
        </div>
      )}

      {/* Modal - Always render, control with display */}
      <div 
        className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
          showModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ 
          display: showModal ? 'block' : 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }}
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div 
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
            onClick={() => {
              console.log('🎭 [SALES] Modal backdrop clicked');
              setShowModal(false);
              resetForm();
            }} />

          <div 
            className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Tambah Penjualan Baru
              </h3>
              <button
                onClick={() => {
                  console.log('🎭 [SALES] Modal X button clicked');
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk *
                </label>
                <select
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Pilih Produk</option>
                  {loading ? (
                    <option disabled>Loading products...</option>
                  ) : products.length === 0 ? (
                    <option disabled>Tidak ada produk tersedia</option>
                  ) : (
                    products.filter(p => p.status === 'Active' || !p.status).map(product => (
                      <option key={product.id} value={product.name}>
                        {product.name} - Rp {product.price.toLocaleString('id-ID')} (Stok: {product.stock})
                      </option>
                    ))
                  )}
                </select>
                {loading && (
                  <p className="text-xs text-blue-600 mt-1">🔄 Memperbarui data produk...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuantitas *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required={formData.customer !== 'other'}
                  value={formData.customer === 'other' ? 'other' : formData.customer}
                  onChange={(e) => {
                    if (e.target.value === 'other') {
                      setFormData({...formData, customer: 'other', newCustomerName: ''});
                    } else {
                      setFormData({...formData, customer: e.target.value, newCustomerName: ''});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Pilih Customer</option>
                  {contacts
                    .filter(contact => contact.type === 'customer')
                    .map(customer => (
                      <option key={customer.id} value={customer.name}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </option>
                    ))
                  }
                  <option value="other">+ Customer Lain</option>
                </select>
                
                {formData.customer === 'other' && (
                  <input
                    type="text"
                    required
                    placeholder="Nama customer baru"
                    value={formData.newCustomerName || ''}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => setFormData({...formData, newCustomerName: e.target.value})}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Customer
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({...formData, customerType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="regular">Regular Customer</option>
                  <option value="reseller">Reseller (3% Off)</option>
                  <option value="wholesale">Wholesale (5% Off)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Diskon
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value, discountValue: '', promoCode: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="none">Tidak Ada Diskon</option>
                  <option value="percentage">Diskon Persentase</option>
                  <option value="fixed">Diskon Nominal</option>
                  <option value="promo">Kode Promo</option>
                </select>
              </div>

              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diskon Persentase (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder="Contoh: 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.discountType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diskon Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    placeholder="Contoh: 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.discountType === 'promo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Promo
                  </label>
                  <select
                    value={formData.promoCode}
                    onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kode Promo</option>
                    {Object.entries(promoCodes).map(([code, promo]) => (
                      <option key={code} value={code}>
                        {code} - {promo.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Catatan tambahan untuk penjualan ini"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {formData.product && formData.quantity && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                  <div className="space-y-2">
                    {/* Base Price */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga Dasar:</span>
                      <span className="font-medium">
                        Rp {((products.find(p => p.name === formData.product)?.price || 0) * parseInt(formData.quantity || '0')).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    {/* Customer Type Discount */}
                    {formData.customerType !== 'regular' && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Diskon {customerTypePricing[formData.customerType as keyof typeof customerTypePricing]?.description}:</span>
                        <span>-{customerTypePricing[formData.customerType as keyof typeof customerTypePricing]?.discount}%</span>
                      </div>
                    )}
                    
                    {/* Additional Discount */}
                    {formData.discountType === 'percentage' && formData.discountValue && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Diskon Tambahan:</span>
                        <span>-{formData.discountValue}%</span>
                      </div>
                    )}
                    
                    {formData.discountType === 'fixed' && formData.discountValue && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Diskon Tambahan:</span>
                        <span>-Rp {parseInt(formData.discountValue).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    
                    {formData.discountType === 'promo' && formData.promoCode && promoCodes[formData.promoCode as keyof typeof promoCodes] && (
                      <div className="flex justify-between text-sm text-purple-600">
                        <span>Promo {formData.promoCode}:</span>
                        <span>
                          -{promoCodes[formData.promoCode as keyof typeof promoCodes].type === 'percentage' 
                            ? `${promoCodes[formData.promoCode as keyof typeof promoCodes].value}%`
                            : `Rp ${promoCodes[formData.promoCode as keyof typeof promoCodes].value.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Total Savings */}
                    {(() => {
                      const basePrice = (products.find(p => p.name === formData.product)?.price || 0) * parseInt(formData.quantity || '0');
                      const finalPrice = parseInt(formData.finalPrice) || basePrice;
                      const savings = basePrice - finalPrice;
                      return savings > 0 && (
                        <div className="flex justify-between text-sm font-medium text-green-600 border-t pt-2">
                          <span>Total Hemat:</span>
                          <span>Rp {savings.toLocaleString('id-ID')}</span>
                        </div>
                      );
                    })()}
                    
                    {/* Final Price */}
                    <div className="flex justify-between text-lg font-bold text-green-700 border-t pt-2">
                      <span>Total Pembayaran:</span>
                      <span>Rp {parseInt(formData.finalPrice || '0').toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div 
          className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
            showDetailModal ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={{ 
            display: showDetailModal ? 'block' : 'none',
          }}
          aria-hidden="true"
        >
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseDetail}></div>
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Penjualan
                </h3>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Transaksi
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedSale.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal & Waktu
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {formatWIBDate(selectedSale.date, { includeTime: true, includeSeconds: true })}
                    </p>
                  </div>
                </div>

                {/* Product & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produk
                    </label>
                    <div className="flex items-center bg-gray-50 p-3 rounded">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedSale.product}</p>
                        <p className="text-xs text-gray-500">Kuantitas: {selectedSale.quantity}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <div className="flex items-center bg-gray-50 p-3 rounded">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedSale.customer}</p>
                        {selectedSale.customerType && (
                          <p className="text-xs text-gray-500 capitalize">{selectedSale.customerType}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Detail Harga</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Harga Satuan:</span>
                      <span className="text-gray-900">Rp {selectedSale.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kuantitas:</span>
                      <span className="text-gray-900">{selectedSale.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">Rp {(selectedSale.price * selectedSale.quantity).toLocaleString('id-ID')}</span>
                    </div>
                    
                    {/* Discount Info */}
                    {selectedSale.discountType && selectedSale.discountType !== 'none' && (
                      <>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tipe Diskon:</span>
                            <span className="text-gray-900 capitalize">{selectedSale.discountType}</span>
                          </div>
                          {selectedSale.discountValue && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Nilai Diskon:</span>
                              <span className="text-red-600">
                                {selectedSale.discountType === 'percentage' 
                                  ? `${selectedSale.discountValue}%`
                                  : `Rp ${Number(selectedSale.discountValue).toLocaleString('id-ID')}`
                                }
                              </span>
                            </div>
                          )}
                          {selectedSale.promoCode && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Kode Promo:</span>
                              <span className="text-blue-600 font-medium">{selectedSale.promoCode}</span>
                            </div>
                          )}
                          {selectedSale.savings && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Hemat:</span>
                              <span className="text-red-600">Rp {selectedSale.savings.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-green-600">Rp {selectedSale.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedSale.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedSale.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseDetail}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
