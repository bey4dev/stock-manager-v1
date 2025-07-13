import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import type { Sale, Purchase } from '../services/GoogleSheetsService';
import type { DateFilterOption } from './DateFilter';
import { getDataInsights, getPerformanceComparison } from '../utils/dateFilter';

interface DashboardInsightsProps {
  filteredSales: Sale[];
  filteredPurchases: Purchase[];
  allSales: Sale[];
  allPurchases: Purchase[];
  dateFilter: DateFilterOption;
}

export default function DashboardInsights({
  filteredSales,
  filteredPurchases,
  allSales,
  allPurchases,
  dateFilter
}: DashboardInsightsProps) {
  const insights = getDataInsights(filteredSales, filteredPurchases);
  const comparison = getPerformanceComparison(
    { sales: filteredSales, purchases: filteredPurchases },
    { sales: allSales, purchases: allPurchases },
    dateFilter
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Meningkat':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'Menurun':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpIcon className="w-3 h-3 text-green-500" />;
    if (growth < 0) return <ArrowDownIcon className="w-3 h-3 text-red-500" />;
    return <MinusIcon className="w-3 h-3 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (filteredSales.length === 0 && filteredPurchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ClockIcon className="w-5 h-5 text-amber-600" />
          </div>
          Insights & Analytics
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500">Tidak ada data untuk periode yang dipilih</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold font-display text-gray-900 mb-6 flex items-center gap-3 tracking-tight">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <ClockIcon className="w-5 h-5 text-indigo-600" />
        </div>
        Insights & Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sales Trend */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium font-body text-blue-700">Tren Penjualan</span>
            {getTrendIcon(insights.salesTrend)}
          </div>
          <p className="text-lg font-bold font-display text-blue-900">{insights.salesTrend}</p>
          {comparison.hasPreviousData && (
            <div className={`flex items-center gap-1 text-xs ${getGrowthColor(comparison.revenueGrowth)}`}>
              {getGrowthIcon(comparison.revenueGrowth)}
              {formatPercentage(comparison.revenueGrowth)} vs periode sebelumnya
            </div>
          )}
        </div>

        {/* Profit Margin */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Margin Profit</span>
            <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-lg font-bold text-green-900">
            {insights.profitMargin.toFixed(1)}%
          </p>
          {comparison.hasPreviousData && (
            <div className={`flex items-center gap-1 text-xs ${getGrowthColor(comparison.profitGrowth)}`}>
              {getGrowthIcon(comparison.profitGrowth)}
              {formatPercentage(comparison.profitGrowth)} vs periode sebelumnya
            </div>
          )}
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Rata-rata Order</span>
            <CurrencyDollarIcon className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(insights.averageOrderValue)}
          </p>
          <div className="text-xs text-purple-600">
            dari {insights.totalTransactions} transaksi
          </div>
        </div>

        {/* Best Selling Hour */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Jam Terlaris</span>
            <ClockIcon className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-lg font-bold text-orange-900">
            {insights.bestSellingHour || 'Tidak tersedia'}
          </p>
          <div className="text-xs text-orange-600">
            Penjualan tertinggi
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      {comparison.hasPreviousData && dateFilter !== 'all' && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Perbandingan Periode Sebelumnya</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pendapatan</span>
                <div className={`flex items-center gap-1 ${getGrowthColor(comparison.revenueGrowth)}`}>
                  {getGrowthIcon(comparison.revenueGrowth)}
                  <span className="text-sm font-medium">
                    {formatPercentage(comparison.revenueGrowth)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jumlah Penjualan</span>
                <div className={`flex items-center gap-1 ${getGrowthColor(comparison.salesGrowth)}`}>
                  {getGrowthIcon(comparison.salesGrowth)}
                  <span className="text-sm font-medium">
                    {formatPercentage(comparison.salesGrowth)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profit</span>
                <div className={`flex items-center gap-1 ${getGrowthColor(comparison.profitGrowth)}`}>
                  {getGrowthIcon(comparison.profitGrowth)}
                  <span className="text-sm font-medium">
                    {formatPercentage(comparison.profitGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
