import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { state, signOut } = useApp();
  const { user } = state;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'Produk', icon: Package, page: 'products' },
    { name: 'Pembelian Stok', icon: ShoppingCart, page: 'purchases' },
    { name: 'Penjualan', icon: TrendingUp, page: 'sales' },
    { name: 'Kontak', icon: Users, page: 'contacts' },
    { name: 'Hutang Piutang', icon: CreditCard, page: 'debts' },
    { name: 'Pengaturan', icon: Settings, page: 'settings' },
  ];

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-64 bg-white shadow-2xl transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">SM</span>
            </div>
            <h1 className="ml-3 text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              StockManager
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-2 touch-target"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 flex-1 px-3 sm:px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.name}
                onClick={() => {
                  onNavigate(item.page);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 sm:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 touch-target ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Demo User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'demo@example.com'}</p>
            </div>
            <button
              onClick={async () => {
                console.log('🚪 [LAYOUT] Sign out button clicked');
                await signOut();
              }}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors p-2 touch-target"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600 p-2 -ml-2 touch-target"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h2 className="ml-2 lg:ml-0 text-lg sm:text-xl font-semibold text-gray-900 capitalize truncate">
                {currentPage === 'dashboard' ? 'Dashboard' :
                 currentPage === 'products' ? 'Manajemen Produk' :
                 currentPage === 'purchases' ? 'Pembelian Stok' :
                 currentPage === 'sales' ? 'Rekap Penjualan' :
                 currentPage === 'contacts' ? 'Kontak' :
                 currentPage === 'debts' ? 'Hutang Piutang' :
                 currentPage === 'settings' ? 'Pengaturan' : 
                 currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
              <div className="sm:hidden">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="mobile-container lg:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
