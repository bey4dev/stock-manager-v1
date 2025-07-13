import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import type { Sale, Purchase } from '../services/GoogleSheetsService';
import type { DateFilterOption } from './DateFilter';
import { getFilterLabel } from '../utils/dateFilter';
import { getCurrentWIBDate } from '../utils/dateWIB';

interface ExportButtonProps {
  filteredSales: Sale[];
  filteredPurchases: Purchase[];
  dateFilter: DateFilterOption;
  className?: string;
}

export default function ExportButton({
  filteredSales,
  filteredPurchases,
  dateFilter,
  className = ''
}: ExportButtonProps) {
  const generateCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header.toLowerCase().replace(/\s+/g, '')];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesData = () => {
    if (filteredSales.length === 0) {
      alert('Tidak ada data penjualan untuk diekspor');
      return;
    }

    const headers = ['Tanggal', 'Produk', 'Quantity', 'Harga', 'Total', 'Customer', 'Notes'];
    const salesData = filteredSales.map(sale => ({
      tanggal: sale.date,
      produk: sale.product,
      quantity: sale.quantity,
      harga: sale.price,
      total: sale.total,
      customer: sale.customer,
      notes: sale.notes || ''
    }));

    const today = getCurrentWIBDate();
    const dateStr = today.toISOString().split('T')[0];
    const filterLabel = getFilterLabel(dateFilter).replace(/\s+/g, '_');
    const filename = `penjualan_${filterLabel}_${dateStr}.csv`;

    generateCSV(salesData, headers, filename);
  };

  const exportPurchasesData = () => {
    if (filteredPurchases.length === 0) {
      alert('Tidak ada data pembelian untuk diekspor');
      return;
    }

    const headers = ['Tanggal', 'Produk', 'Quantity', 'Biaya', 'Total', 'Supplier'];
    const purchasesData = filteredPurchases.map(purchase => ({
      tanggal: purchase.date,
      produk: purchase.product,
      quantity: purchase.quantity,
      biaya: purchase.cost,
      total: purchase.total,
      supplier: purchase.supplier
    }));

    const today = getCurrentWIBDate();
    const dateStr = today.toISOString().split('T')[0];
    const filterLabel = getFilterLabel(dateFilter).replace(/\s+/g, '_');
    const filename = `pembelian_${filterLabel}_${dateStr}.csv`;

    generateCSV(purchasesData, headers, filename);
  };

  const exportCombinedReport = () => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;

    const summaryData = [
      { metric: 'Total Penjualan', value: filteredSales.length },
      { metric: 'Total Pembelian', value: filteredPurchases.length },
      { metric: 'Total Revenue', value: totalRevenue },
      { metric: 'Total Cost', value: totalCost },
      { metric: 'Profit', value: profit },
      { metric: 'Profit Margin (%)', value: profitMargin.toFixed(2) },
      { metric: 'Periode', value: getFilterLabel(dateFilter) }
    ];

    const headers = ['Metric', 'Value'];
    
    const today = getCurrentWIBDate();
    const dateStr = today.toISOString().split('T')[0];
    const filterLabel = getFilterLabel(dateFilter).replace(/\s+/g, '_');
    const filename = `laporan_${filterLabel}_${dateStr}.csv`;

    generateCSV(summaryData, headers, filename);
  };

  const hasData = filteredSales.length > 0 || filteredPurchases.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={exportSalesData}
          disabled={filteredSales.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Ekspor Penjualan
        </button>
        
        <button
          onClick={exportPurchasesData}
          disabled={filteredPurchases.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Ekspor Pembelian
        </button>
        
        <button
          onClick={exportCombinedReport}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Ekspor Laporan
        </button>
      </div>
    </div>
  );
}
