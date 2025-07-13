import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Bell,
  Palette,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Save,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const { state } = useApp();
  const { user } = state;
  
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    notifications: {
      lowStock: true,
      newSales: true,
      weeklyReport: false
    },
    appearance: {
      theme: 'light',
      language: 'id'
    },
    general: {
      autoBackup: true,
      currency: 'IDR',
      dateFormat: 'DD/MM/YYYY'
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifikasi', icon: Bell },
    { id: 'appearance', name: 'Tampilan', icon: Palette },
    { id: 'data', name: 'Data & Backup', icon: Database },
    { id: 'security', name: 'Keamanan', icon: Shield }
  ];

  const handleSave = () => {
    // Simulate save
    alert('Pengaturan berhasil disimpan!');
  };

  const handleExportData = () => {
    // Simulate export
    alert('Data berhasil diekspor!');
  };

  const handleImportData = () => {
    // Simulate import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = () => {
      alert('Data berhasil diimpor!');
    };
    input.click();
  };

  const handleSyncData = () => {
    // Simulate sync
    alert('Sinkronisasi dengan Google Sheets berhasil!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600">Kelola preferensi dan konfigurasi aplikasi</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-4 w-4 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Profil</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || 'Demo User'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || 'demo@example.com'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perusahaan
                      </label>
                      <input
                        type="text"
                        placeholder="Nama perusahaan"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posisi
                      </label>
                      <input
                        type="text"
                        placeholder="Posisi/jabatan"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferensi Notifikasi</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Stok Rendah</h4>
                        <p className="text-sm text-gray-600">Notifikasi ketika stok produk mencapai batas minimum</p>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            lowStock: !settings.notifications.lowStock
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.lowStock ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.lowStock ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Penjualan Baru</h4>
                        <p className="text-sm text-gray-600">Notifikasi untuk setiap transaksi penjualan baru</p>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            newSales: !settings.notifications.newSales
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.newSales ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.newSales ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Laporan Mingguan</h4>
                        <p className="text-sm text-gray-600">Ringkasan penjualan dan stok setiap minggu</p>
                      </div>
                      <button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            weeklyReport: !settings.notifications.weeklyReport
                          }
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.weeklyReport ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tampilan & Bahasa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tema
                      </label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">Terang</option>
                        <option value="dark">Gelap</option>
                        <option value="auto">Otomatis</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bahasa
                      </label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Backup</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Unduh semua data dalam format JSON atau CSV
                      </p>
                      <button
                        onClick={handleExportData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Unggah data dari file JSON atau CSV
                      </p>
                      <button
                        onClick={handleImportData}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Sinkronisasi Google Sheets</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Sinkronkan data dengan Google Sheets untuk backup otomatis
                        </p>
                        <button
                          onClick={handleSyncData}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sinkronkan Sekarang
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Auto Backup</h4>
                      <p className="text-sm text-gray-600">Backup otomatis ke Google Sheets setiap jam</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        general: { ...settings.general, autoBackup: !settings.general.autoBackup }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.general.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.general.autoBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keamanan & Privasi</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Koneksi Google</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Status koneksi dengan Google Sheets API
                      </p>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-sm text-green-600 font-medium">Terhubung</span>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">API Documentation</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Pelajari lebih lanjut tentang Google Sheets API
                      </p>
                      <a
                        href="https://developers.google.com/workspace/sheets/api/quickstart/js"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Buka Dokumentasi
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-900 mb-1">Mode Demo Aktif</h4>
                          <p className="text-sm text-yellow-700">
                            Anda sedang menggunakan mode demo. Data tidak akan tersimpan secara permanen.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
