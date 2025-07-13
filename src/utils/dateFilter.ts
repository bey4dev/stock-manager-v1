import type { Sale, Purchase } from '../services/GoogleSheetsService';
import { getCurrentWIBDate, parseWIBTimestamp } from './dateWIB';

export type DateFilterOption = 'today' | 'yesterday' | 'last7days' | 'last2weeks' | 'last1month' | 'thisyear' | 'all';

/**
 * Get date range based on filter option
 */
export const getDateRange = (option: DateFilterOption): { start: Date; end: Date } | null => {
  const now = getCurrentWIBDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
      };
    
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) // End of yesterday
      };
    
    case 'last7days':
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
      };
    
    case 'last2weeks':
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        start: twoWeeksAgo,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
      };
    
    case 'last1month':
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return {
        start: oneMonthAgo,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
      };
    
    case 'thisyear':
      const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st
      return {
        start: startOfYear,
        end: endOfYear
      };
    
    case 'all':
    default:
      return null; // No filtering
  }
};

/**
 * Parse date from various formats used in the application
 */
const parseItemDate = (dateString: string): Date => {
  // Handle WIB timestamp format
  if (dateString.includes('WIB')) {
    return parseWIBTimestamp(dateString);
  }
  
  // Handle other date formats
  return new Date(dateString);
};

/**
 * Check if a date falls within the specified range
 */
const isDateInRange = (date: Date, range: { start: Date; end: Date }): boolean => {
  return date >= range.start && date <= range.end;
};

/**
 * Filter sales data based on date range
 */
export const filterSalesByDate = (sales: Sale[], option: DateFilterOption): Sale[] => {
  if (option === 'all') {
    return sales;
  }
  
  const range = getDateRange(option);
  if (!range) {
    return sales;
  }
  
  return sales.filter(sale => {
    try {
      const saleDate = parseItemDate(sale.date);
      return isDateInRange(saleDate, range);
    } catch (error) {
      console.warn('Error parsing sale date:', sale.date, error);
      return false;
    }
  });
};

/**
 * Filter purchases data based on date range
 */
export const filterPurchasesByDate = (purchases: Purchase[], option: DateFilterOption): Purchase[] => {
  if (option === 'all') {
    return purchases;
  }
  
  const range = getDateRange(option);
  if (!range) {
    return purchases;
  }
  
  return purchases.filter(purchase => {
    try {
      const purchaseDate = parseItemDate(purchase.date);
      return isDateInRange(purchaseDate, range);
    } catch (error) {
      console.warn('Error parsing purchase date:', purchase.date, error);
      return false;
    }
  });
};

/**
 * Get label for the current filter option
 */
export const getFilterLabel = (option: DateFilterOption): string => {
  const labels = {
    all: 'Semua Data',
    today: 'Hari Ini',
    yesterday: 'Kemarin',
    last7days: '7 Hari Terakhir',
    last2weeks: '2 Minggu Terakhir',
    last1month: '1 Bulan Terakhir',
    thisyear: 'Tahun Ini'
  };
  
  return labels[option] || 'Semua Data';
};

/**
 * Calculate metrics for filtered data
 */
export const calculateFilteredMetrics = (
  filteredSales: Sale[], 
  filteredPurchases: Purchase[],
  products: any[]
) => {
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const profit = totalRevenue - totalCost;
  
  // Calculate top products from filtered sales
  const productSales = filteredSales.reduce((acc, sale) => {
    acc[sale.product] = (acc[sale.product] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);
  
  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  // Calculate monthly sales for filtered data
  const monthlySales = filteredSales.reduce((acc, sale) => {
    try {
      const saleDate = parseItemDate(sale.date);
      const monthKey = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = saleDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthName, amount: 0 };
      }
      acc[monthKey].amount += sale.total;
    } catch (error) {
      console.warn('Error processing sale for monthly data:', sale.date, error);
    }
    return acc;
  }, {} as Record<string, { month: string; amount: number }>);
  
  const sortedMonthlySales = Object.values(monthlySales)
    .sort((a, b) => a.month.localeCompare(b.month));
  
  return {
    totalRevenue,
    totalCost,
    profit,
    totalSales: filteredSales.length,
    totalPurchases: filteredPurchases.length,
    topProducts,
    monthlySales: sortedMonthlySales,
    // Keep original metrics for non-date dependent data
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.stock < 10).length,
    totalCustomers: new Set(filteredSales.map(s => s.customer)).size
  };
};

/**
 * Get insights and analytics for the filtered data
 */
export const getDataInsights = (
  filteredSales: Sale[], 
  filteredPurchases: Purchase[]
) => {
  const insights = {
    salesTrend: '',
    profitMargin: 0,
    bestSellingHour: '',
    averageOrderValue: 0,
    totalTransactions: filteredSales.length,
    comparisonData: {
      salesGrowth: 0,
      purchaseGrowth: 0,
      profitGrowth: 0
    }
  };

  if (filteredSales.length === 0) {
    return insights;
  }

  // Calculate average order value
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  insights.averageOrderValue = totalRevenue / filteredSales.length;

  // Calculate profit margin
  const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  if (totalRevenue > 0) {
    insights.profitMargin = ((totalRevenue - totalCost) / totalRevenue) * 100;
  }

  // Determine sales trend
  if (filteredSales.length > 0) {
    const sortedSales = [...filteredSales].sort((a, b) => {
      try {
        const dateA = parseItemDate(a.date);
        const dateB = parseItemDate(b.date);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });

    const firstHalf = sortedSales.slice(0, Math.floor(sortedSales.length / 2));
    const secondHalf = sortedSales.slice(Math.floor(sortedSales.length / 2));

    const firstHalfRevenue = firstHalf.reduce((sum, sale) => sum + sale.total, 0);
    const secondHalfRevenue = secondHalf.reduce((sum, sale) => sum + sale.total, 0);

    if (secondHalfRevenue > firstHalfRevenue) {
      insights.salesTrend = 'Meningkat';
    } else if (secondHalfRevenue < firstHalfRevenue) {
      insights.salesTrend = 'Menurun';
    } else {
      insights.salesTrend = 'Stabil';
    }
  }

  // Find best selling hour (if time data is available)
  const hourlyData: Record<number, number> = {};
  filteredSales.forEach(sale => {
    try {
      const saleDate = parseItemDate(sale.date);
      const hour = saleDate.getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + sale.total;
    } catch {
      // Skip if date parsing fails
    }
  });

  if (Object.keys(hourlyData).length > 0) {
    const bestHour = Object.entries(hourlyData).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];
    insights.bestSellingHour = `${bestHour}:00`;
  }

  return insights;
};

/**
 * Get comparison data for performance analytics
 */
export const getPerformanceComparison = (
  currentData: { sales: Sale[]; purchases: Purchase[] },
  allData: { sales: Sale[]; purchases: Purchase[] },
  option: DateFilterOption
) => {
  // Calculate previous period data for comparison
  const currentRevenue = currentData.sales.reduce((sum, sale) => sum + sale.total, 0);
  const currentCost = currentData.purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  
  // Get previous period range
  const previousRange = getPreviousPeriodRange(option);
  
  if (!previousRange) {
    return {
      revenueGrowth: 0,
      salesGrowth: 0,
      profitGrowth: 0,
      hasPreviousData: false
    };
  }

  const previousSales = filterSalesByDateRange(allData.sales, previousRange);
  const previousPurchases = filterPurchasesByDateRange(allData.purchases, previousRange);
  
  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0);
  const previousCost = previousPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  
  const revenueGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
    
  const salesGrowth = previousSales.length > 0
    ? ((currentData.sales.length - previousSales.length) / previousSales.length) * 100
    : 0;
    
  const currentProfit = currentRevenue - currentCost;
  const previousProfit = previousRevenue - previousCost;
  const profitGrowth = previousProfit !== 0
    ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100
    : 0;

  return {
    revenueGrowth,
    salesGrowth,
    profitGrowth,
    hasPreviousData: previousSales.length > 0 || previousPurchases.length > 0,
    previousPeriodData: {
      revenue: previousRevenue,
      sales: previousSales.length,
      profit: previousProfit
    }
  };
};

/**
 * Get previous period range for comparison
 */
const getPreviousPeriodRange = (option: DateFilterOption): { start: Date; end: Date } | null => {
  const now = getCurrentWIBDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case 'today':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'yesterday':
      const dayBeforeYesterday = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
      return {
        start: dayBeforeYesterday,
        end: new Date(dayBeforeYesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'last7days':
      const previous7DaysStart = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      const previous7DaysEnd = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000 - 1);
      return {
        start: previous7DaysStart,
        end: previous7DaysEnd
      };
    
    case 'last2weeks':
      const previous2WeeksStart = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
      const previous2WeeksEnd = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000 - 1);
      return {
        start: previous2WeeksStart,
        end: previous2WeeksEnd
      };
    
    case 'last1month':
      const previous1MonthStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
      const previous1MonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - 1, 23, 59, 59, 999);
      return {
        start: previous1MonthStart,
        end: previous1MonthEnd
      };
    
    default:
      return null;
  }
};

/**
 * Filter sales by specific date range
 */
const filterSalesByDateRange = (sales: Sale[], range: { start: Date; end: Date }): Sale[] => {
  return sales.filter(sale => {
    try {
      const saleDate = parseItemDate(sale.date);
      return isDateInRange(saleDate, range);
    } catch (error) {
      console.warn('Error parsing sale date:', sale.date, error);
      return false;
    }
  });
};

/**
 * Filter purchases by specific date range
 */
const filterPurchasesByDateRange = (purchases: Purchase[], range: { start: Date; end: Date }): Purchase[] => {
  return purchases.filter(purchase => {
    try {
      const purchaseDate = parseItemDate(purchase.date);
      return isDateInRange(purchaseDate, range);
    } catch (error) {
      console.warn('Error parsing purchase date:', purchase.date, error);
      return false;
    }
  });
};
