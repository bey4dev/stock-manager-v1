import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import GoogleSheetsService from '../services/GoogleSheetsService';
import { getWIBTimestamp } from '../utils/dateWIB';

interface Contact {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactFormData {
  name: string;
  type: 'customer' | 'supplier';
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await loadContacts();
    setLoading(false);
  };

  const loadContacts = async () => {
    try {
      const response = await GoogleSheetsService.getSheetData('Contacts');
      if (response.success && response.data) {
        const contactsData = response.data.map((row: any[], index: number) => ({
          id: row[0] || `contact_${index + 1}`,
          name: row[1] || '',
          type: row[2] || 'customer',
          email: row[3] || '',
          phone: row[4] || '',
          address: row[5] || '',
          company: row[6] || '',
          notes: row[7] || '',
          createdAt: row[8] || getWIBTimestamp(),
          updatedAt: row[9] || getWIBTimestamp()
        }));
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const now = getWIBTimestamp();
      const contactData = {
        ...formData,
        id: editingContact?.id || `contact_${Date.now()}`,
        createdAt: editingContact?.createdAt || now,
        updatedAt: now
      };

      const rowData = [
        contactData.id,
        contactData.name,
        contactData.type,
        contactData.email,
        contactData.phone,
        contactData.address,
        contactData.company,
        contactData.notes,
        contactData.createdAt,
        contactData.updatedAt
      ];

      let response;
      if (editingContact) {
        // Update existing contact
        const contactIndex = contacts.findIndex(c => c.id === editingContact.id);
        response = await GoogleSheetsService.updateSheetRow('Contacts', contactIndex + 2, rowData);
      } else {
        // Add new contact
        response = await GoogleSheetsService.appendToSheet('Contacts', [rowData]);
      }

      if (response.success) {
        await loadData();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      company: contact.company || '',
      notes: contact.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kontak ini?')) return;
    
    try {
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      if (contactIndex !== -1) {
        const response = await GoogleSheetsService.deleteSheetRow('Contacts', contactIndex + 2);
        if (response.success) {
          await loadData();
        }
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'customer',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: ''
    });
    setEditingContact(null);
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.type === filter;
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontak</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola data customer dan supplier
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tambah Kontak
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Kontak</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama, perusahaan, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Tipe</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('customer')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'customer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setFilter('supplier')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'supplier'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingContact ? 'Edit Kontak' : 'Tambah Kontak Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'customer' | 'supplier' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama perusahaan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Alamat lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Catatan tambahan"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {editingContact ? 'Update Kontak' : 'Simpan Kontak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Summary Stats */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredContacts.length}</span> kontak
                {searchQuery && (
                  <span className="ml-2 text-gray-500">dari pencarian "{searchQuery}"</span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {contacts.filter(c => c.type === 'customer').length} Customer
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {contacts.filter(c => c.type === 'supplier').length} Supplier
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Info Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perusahaan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'Tidak ada kontak yang ditemukan' : 'Belum ada kontak'}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {contact.type === 'customer' ? (
                                <UserIcon className="h-5 w-5 text-gray-500" />
                              ) : (
                                <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </div>
                            {contact.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {contact.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.type === 'customer'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {contact.type === 'customer' ? 'Customer' : 'Supplier'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {contact.email && <div className="flex items-center mb-1"><span className="text-gray-400 mr-1">✉</span>{contact.email}</div>}
                          {contact.phone && <div className="flex items-center"><span className="text-gray-400 mr-1">📞</span>{contact.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contact.company || '-'}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit kontak"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus kontak"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {filteredContacts.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchQuery ? 'Tidak ada kontak yang ditemukan' : 'Belum ada kontak'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => {
                return (
                  <div key={contact.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {contact.type === 'customer' ? (
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {contact.name}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.type === 'customer'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {contact.type === 'customer' ? 'Customer' : 'Supplier'}
                            </span>
                          </div>
                          {contact.company && (
                            <p className="text-sm text-gray-600 mb-1">{contact.company}</p>
                          )}
                          <div className="space-y-1">
                            {contact.email && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <span className="text-gray-400 mr-1">✉</span>
                                {contact.email}
                              </p>
                            )}
                            {contact.phone && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <span className="text-gray-400 mr-1">📞</span>
                                {contact.phone}
                              </p>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{contact.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Edit kontak"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                          title="Hapus kontak"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
