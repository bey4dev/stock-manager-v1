import { CalendarIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { DateFilterOption } from './DateFilter';
import { getFilterLabel } from '../utils/dateFilter';

interface FilterSummaryProps {
  dateFilter: DateFilterOption;
  totalFilteredSales: number;
  totalFilteredPurchases: number;
  totalSales: number;
  totalPurchases: number;
  filteredRevenue: number;
  filteredCost: number;
}

export default function FilterSummary({
  dateFilter,
  totalFilteredSales,
  totalFilteredPurchases,
  totalSales,
  totalPurchases,
  filteredRevenue,
  filteredCost
}: FilterSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFilterDescription = (option: DateFilterOption): string => {
    const descriptions = {
      all: 'Menampilkan seluruh data historis',
      today: 'Data transaksi hari ini',
      yesterday: 'Data transaksi kemarin',
      last7days: 'Data 7 hari terakhir',
      last2weeks: 'Data 2 minggu terakhir',
      last1month: 'Data 1 bulan terakhir',
      thisyear: 'Data sepanjang tahun ini'
    };
    return descriptions[option] || 'Data sesuai filter yang dipilih';
  };

  const salesPercentage = totalSales > 0 ? (totalFilteredSales / totalSales) * 100 : 0;
  const purchasesPercentage = totalPurchases > 0 ? (totalFilteredPurchases / totalPurchases) * 100 : 0;

  if (dateFilter === 'all') {
    return null; // Don't show summary for 'all' filter
  }

  return (
    <div className="filter-summary-gradient rounded-2xl shadow-lg p-6 mb-8 relative">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
      </div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-white bg-opacity-15 rounded-lg backdrop-blur-sm border border-white border-opacity-20">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold tracking-tight text-white">{getFilterLabel(dateFilter)}</h2>
          <p className="text-blue-100 text-sm font-body opacity-90">{getFilterDescription(dateFilter)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Transactions Summary */}
        <div className="filter-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-200" />
            <span className="font-display font-semibold text-white">Transaksi</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-200 text-sm font-body">Penjualan</span>
              <div className="text-right">
                <div className="font-bold font-display text-white metric-number">{totalFilteredSales}</div>
                <div className="text-xs text-blue-200 font-body opacity-80">
                  {salesPercentage.toFixed(1)}% dari total
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-200 text-sm font-body">Pembelian</span>
              <div className="text-right">
                <div className="font-bold font-display text-white metric-number">{totalFilteredPurchases}</div>
                <div className="text-xs text-blue-200 font-body opacity-80">
                  {purchasesPercentage.toFixed(1)}% dari total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="filter-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <CurrencyDollarIcon className="w-5 h-5 text-green-300" />
            <span className="font-display font-semibold text-white">Pendapatan</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-lg font-bold font-display text-white metric-number">{formatCurrency(filteredRevenue)}</div>
              <div className="text-xs text-blue-200 font-body opacity-80">Total penjualan</div>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="filter-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <CurrencyDollarIcon className="w-5 h-5 text-yellow-300" />
            <span className="font-display font-semibold text-white">Profit</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-lg font-bold font-display text-white metric-number">{formatCurrency(filteredRevenue - filteredCost)}</div>
              <div className="text-xs text-blue-200 font-body opacity-80">
                Margin: {filteredRevenue > 0 ? (((filteredRevenue - filteredCost) / filteredRevenue) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 pt-4 border-t border-white border-opacity-15 relative z-10">
        <div className="flex flex-wrap gap-4 text-sm text-white font-body">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 shadow-sm"></div>
            <span className="opacity-90">Rata-rata/hari: {formatCurrency(filteredRevenue / Math.max(1, getDayCount(dateFilter)))}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 shadow-sm"></div>
            <span className="opacity-90">Transaksi/hari: {(totalFilteredSales / Math.max(1, getDayCount(dateFilter))).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDayCount(option: DateFilterOption): number {
  switch (option) {
    case 'today':
    case 'yesterday':
      return 1;
    case 'last7days':
      return 7;
    case 'last2weeks':
      return 14;
    case 'last1month':
      return 30;
    case 'thisyear':
      return new Date().getDate() + (new Date().getMonth() * 30); // Approximate
    default:
      return 1;
  }
}
