import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import GoogleSheetsService from '../services/GoogleSheetsService';
import {
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  Package,
  Building,
  X,
  Filter
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  company?: string;
}

export default function PurchasesEnhanced() {
  const { state, addPurchase } = useApp();
  const { purchases, products, loading } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    quantity: '',
    supplier: '',
    supplierId: '',
    notes: ''
  });

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await GoogleSheetsService.getSheetData('Contacts');
      if (response.success && response.data) {
        const contactsData = response.data
          .map((row: any[]) => ({
            id: row[0] || '',
            name: row[1] || '',
            type: row[2] || 'supplier',
            company: row[6] || ''
          }))
          .filter(contact => contact.type === 'supplier' && contact.name);
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Get unique suppliers for filter
  const uniqueSuppliers = [...new Set(purchases.map(p => p.supplier))];

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProduct = productFilter === 'all' || purchase.product === productFilter;
    const matchesSupplier = supplierFilter === 'all' || purchase.supplier === supplierFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const purchaseDate = new Date(purchase.date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = purchaseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = purchaseDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = purchaseDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesProduct && matchesSupplier && matchesDate;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [PURCHASES] Form submitted:', formData);
    
    try {
      const selectedProduct = products.find(p => p.id === formData.product);
      const selectedSupplier = contacts.find(c => c.id === formData.supplierId);
      
      if (!selectedProduct) {
        alert('Please select a product');
        return;
      }

      const purchaseData = {
        date: formData.date,
        product: selectedProduct.name,
        quantity: parseInt(formData.quantity),
        cost: selectedProduct.cost || 0,
        total: (selectedProduct.cost || 0) * parseInt(formData.quantity),
        supplier: selectedSupplier ? selectedSupplier.name : formData.supplier,
        supplierId: formData.supplierId,
        notes: formData.notes
      };

      console.log('🔍 [PURCHASES] Calling addPurchase with:', purchaseData);
      await addPurchase(purchaseData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        product: '',
        quantity: '',
        supplier: '',
        supplierId: '',
        notes: ''
      });
      
      setShowModal(false);
      console.log('✅ [PURCHASES] Purchase added successfully');
      
    } catch (error) {
      console.error('❌ [PURCHASES] Error adding purchase:', error);
      alert('Error adding purchase. Please try again.');
    }
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedContact = contacts.find(c => c.id === e.target.value);
    setFormData({
      ...formData,
      supplierId: e.target.value,
      supplier: selectedContact ? selectedContact.name : ''
    });
  };

  const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading purchases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembelian Stok</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola pembelian stok dari supplier
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembelian
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pembelian
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredPurchases.length} transaksi
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Quantity
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalQuantity} items
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Nilai
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Rp {totalPurchases.toLocaleString('id-ID')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari supplier atau produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produk
            </label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Produk</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Supplier</option>
              {uniqueSuppliers.map(supplier => (
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
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
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
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || dateFilter !== 'all' || productFilter !== 'all' || supplierFilter !== 'all' 
                      ? 'Tidak ada pembelian yang sesuai dengan filter'
                      : 'Belum ada data pembelian'}
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchase.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {purchase.product}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {purchase.supplier}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {purchase.cost.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rp {purchase.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Tambah Pembelian Baru
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk *
                </label>
                <select
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih produk...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Rp {product.cost.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih supplier...</option>
                  {loadingContacts ? (
                    <option disabled>Loading suppliers...</option>
                  ) : (
                    contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} {contact.company ? `(${contact.company})` : ''}
                      </option>
                    ))
                  )}
                </select>
                {!formData.supplierId && (
                  <input
                    type="text"
                    placeholder="Atau masukkan nama supplier baru..."
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan jumlah..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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
