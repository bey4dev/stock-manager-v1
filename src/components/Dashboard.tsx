import { useApp } from '../contexts/AppContext';
import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  BarChart3,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import DateFilter from './DateFilter';
import DashboardInsights from './DashboardInsights';
import FilterSummary from './FilterSummary';
import ExportButton from './ExportButton';
import type { DateFilterOption } from './DateFilter';
import { 
  filterSalesByDate, 
  filterPurchasesByDate, 
  calculateFilteredMetrics,
  getFilterLabel 
} from '../utils/dateFilter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { state, loadAllData } = useApp();
  const { dashboardMetrics, loading, products, sales, purchases } = state;
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');

  console.log('📊 [DASHBOARD] Rendering Dashboard component');
  console.log('📊 [DASHBOARD] State:', {
    loading,
    hasMetrics: !!dashboardMetrics,
    productsCount: products.length,
    salesCount: sales.length,
    purchasesCount: purchases.length,
    currentFilter: dateFilter
  });

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    const filteredSales = filterSalesByDate(sales, dateFilter);
    const filteredPurchases = filterPurchasesByDate(purchases, dateFilter);
    
    console.log('🔍 [DASHBOARD] Filtering data:', {
      filter: dateFilter,
      originalSales: sales.length,
      filteredSales: filteredSales.length,
      originalPurchases: purchases.length,
      filteredPurchases: filteredPurchases.length
    });

    return {
      sales: filteredSales,
      purchases: filteredPurchases,
      metrics: calculateFilteredMetrics(filteredSales, filteredPurchases, products)
    };
  }, [sales, purchases, products, dateFilter]);

  const handleReloadData = async () => {
    console.log('🔄 [DASHBOARD] Manual data reload triggered');
    try {
      await loadAllData();
      console.log('✅ [DASHBOARD] Manual data reload completed');
    } catch (error) {
      console.error('❌ [DASHBOARD] Manual data reload failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // Use filtered metrics instead of original dashboard metrics
  const metrics = filteredData.metrics;

  // Ensure arrays are defined and not null
  const safeMonthlySales = metrics.monthlySales || [];
  const safeTopProducts = metrics.topProducts || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Produk',
      value: metrics.totalProducts,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Penjualan',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'green',
      change: '+23%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Pembelian',
      value: formatCurrency(metrics.totalCost),
      icon: ShoppingCart,
      color: 'purple',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Profit',
      value: formatCurrency(metrics.profit),
      icon: TrendingUp,
      color: metrics.profit >= 0 ? 'emerald' : 'red',
      change: metrics.profit >= 0 ? '+15%' : '-5%',
      changeType: metrics.profit >= 0 ? 'positive' as const : 'negative' as const
    },
    {
      title: 'Stok Rendah',
      value: metrics.lowStockProducts,
      icon: Activity,
      color: metrics.lowStockProducts > 0 ? 'red' : 'green',
      change: metrics.lowStockProducts > 0 ? 'Perlu Perhatian' : 'Aman',
      changeType: metrics.lowStockProducts > 0 ? 'negative' as const : 'positive' as const
    },
    {
      title: 'Total Customer',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'indigo',
      change: '+5%',
      changeType: 'positive' as const
    }
  ];

  // Chart data
  const monthlySalesData = {
    labels: safeMonthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Penjualan Bulanan',
        data: safeMonthlySales.map(item => item.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
      },
    ],
  };

  const topProductsData = {
    labels: safeTopProducts.map(item => item.name),
    datasets: [
      {
        data: safeTopProducts.map(item => item.sales),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 85, 99, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 85, 99, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 600,
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-gray-900 tracking-tight font-display-optimized">Dashboard Analytics</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <ExportButton
                filteredSales={filteredData.sales}
                filteredPurchases={filteredData.purchases}
                dateFilter={dateFilter}
              />
              <DateFilter 
                value={dateFilter}
                onChange={setDateFilter}
                className="flex-shrink-0"
              />
              <button
                onClick={handleReloadData}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">{loading ? 'Loading...' : 'Reload Data'}</span>
                <span className="sm:hidden">{loading ? '...' : 'Reload'}</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-gray-600 font-body text-sm sm:text-base">Overview sistem manajemen stok dan penjualan produk digital</p>
            {dateFilter !== 'all' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium font-body">
                <span>Filter: {getFilterLabel(dateFilter)}</span>
                <button 
                  onClick={() => setDateFilter('all')}
                  className="hover:bg-blue-100 rounded-full p-1 transition-colors touch-target"
                  title="Hapus filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          {/* Data Status Indicator */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
              <span className="font-medium text-gray-700">Data Status:</span>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                <span className={`inline-flex items-center gap-1 ${products.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${products.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm">Products ({products.length})</span>
                </span>
                <span className={`inline-flex items-center gap-1 ${filteredData.sales.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${filteredData.sales.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm">Sales ({filteredData.sales.length}{dateFilter !== 'all' ? `/${sales.length}` : ''})</span>
                </span>
                <span className={`inline-flex items-center gap-1 ${filteredData.purchases.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${filteredData.purchases.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm">Purchases ({filteredData.purchases.length}{dateFilter !== 'all' ? `/${purchases.length}` : ''})</span>
                </span>
                <span className={`inline-flex items-center gap-1 ${metrics ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${metrics ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm">Metrics ({metrics ? 'OK' : 'No Data'})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <FilterSummary
          dateFilter={dateFilter}
          totalFilteredSales={filteredData.sales.length}
          totalFilteredPurchases={filteredData.purchases.length}
          totalSales={sales.length}
          totalPurchases={purchases.length}
          filteredRevenue={metrics.totalRevenue}
          filteredCost={metrics.totalCost}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="mobile-stat-card sm:bg-white sm:rounded-2xl sm:shadow-lg sm:border sm:border-gray-100 sm:p-6 sm:hover:shadow-xl sm:transition-all sm:duration-300">
                <div className="mobile-stat-header sm:flex sm:items-center sm:justify-between sm:mb-4">
                  <div className={`mobile-stat-icon sm:p-3 sm:bg-${card.color}-100 sm:rounded-xl`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-white sm:text-${card.color}-600`} />
                  </div>
                  <div className={`mobile-stat-change sm:flex sm:items-center sm:gap-1 sm:text-sm sm:font-medium ${
                    card.changeType === 'positive' ? 'positive sm:text-green-600' : 'negative sm:text-red-600'
                  }`}>
                    <span className="hidden sm:inline">
                      {card.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </span>
                    {card.change}
                  </div>
                </div>
                <div>
                  <h3 className="mobile-stat-label sm:text-sm sm:font-medium sm:font-body sm:text-gray-600 sm:mb-1">{card.title}</h3>
                  <p className="mobile-stat-value sm:text-2xl sm:font-bold sm:font-display sm:text-gray-900 sm:tracking-tight sm:metric-number">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights Section */}
        <div className="mb-6 sm:mb-8">
          <DashboardInsights
            filteredSales={filteredData.sales}
            filteredPurchases={filteredData.purchases}
            allSales={sales}
            allPurchases={purchases}
            dateFilter={dateFilter}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Monthly Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 tracking-tight">Tren Penjualan Bulanan</h2>
            </div>
            <div className="h-64 sm:h-80">
              {metrics.monthlySales.length > 0 ? (
                <Line data={monthlySalesData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm sm:text-base">Belum ada data penjualan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 tracking-tight">Produk Terlaris</h2>
            </div>
            <div className="h-64 sm:h-80">
              {metrics.topProducts.length > 0 ? (
                <Doughnut data={topProductsData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm sm:text-base">Belum ada data produk</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 tracking-tight">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group touch-target">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-semibold font-display text-gray-900">Tambah Produk</h3>
                <p className="text-xs sm:text-sm font-body text-gray-600">Tambah produk digital baru</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group touch-target">
              <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-semibold font-display text-gray-900">Catat Penjualan</h3>
                <p className="text-xs sm:text-sm font-body text-gray-600">Input penjualan terbaru</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group touch-target sm:col-span-2 lg:col-span-1">
              <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-semibold font-display text-gray-900">Input Pembelian</h3>
                <p className="text-xs sm:text-sm font-body text-gray-600">Tambah pembelian stok</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
