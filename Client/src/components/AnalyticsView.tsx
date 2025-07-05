import { type FC, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Download,
  Upload,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface AnalyticsViewProps {
  showBalances: boolean;
}

type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

interface AnalyticsData {
  spendingTrends: Array<{ date: string; amount: number }>;
  incomeTrends: Array<{ date: string; amount: number }>;
  cashFlow: Array<{ date: string; income: number; expenses: number; netFlow: number }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    percentage: number;
  }>;
  monthlySummary: Array<{
    year: number;
    month: number;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;
  }>;
  budgetPerformance: Array<{
    budgetId: string;
    categoryName: string;
    budgetAmount: number;
    actualSpent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
  }>;
  netWorth: Array<{
    date: string;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }>;
  projections: Array<{
    date: string;
    projectedIncome: number;
    projectedExpenses: number;
    projectedSavings: number;
    projectedNetWorth: number;
  }>;
}

export const AnalyticsView: FC<AnalyticsViewProps> = ({ showBalances }) => {
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [data, setData] = useState<AnalyticsData | null>(null);

  const getDateRange = (period: TimePeriod) => {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate: now };
  };

  const loadAnalyticsData = async () => {
    if (!currentSpace) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { startDate, endDate } = getDateRange(timePeriod);
      const filter = { 
        startDate, 
        endDate, 
        period: timePeriod === 'week' ? 'daily' : 'monthly' 
      };

      const [
        spendingTrends,
        incomeTrends,
        cashFlow,
        categoryBreakdown,
        monthlySummary,
        budgetPerformance,
        netWorth,
        projections
      ] = await Promise.all([
        apiService.getSpendingTrends(currentSpace.spaceId, filter),
        apiService.getIncomeTrends(currentSpace.spaceId, filter),
        apiService.getCashFlow(currentSpace.spaceId, filter),
        apiService.getCategoryBreakdown(currentSpace.spaceId, { startDate, endDate }),
        apiService.getMonthlySummary(currentSpace.spaceId, { startDate, endDate }),
        apiService.getBudgetPerformance(currentSpace.spaceId, { startDate, endDate }),
        apiService.getNetWorth(currentSpace.spaceId, { startDate, endDate }),
        apiService.getFinancialProjections(currentSpace.spaceId)
      ]);

      setData({
        spendingTrends,
        incomeTrends,
        cashFlow,
        categoryBreakdown,
        monthlySummary,
        budgetPerformance,
        netWorth,
        projections
      });
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [currentSpace, timePeriod]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!currentSpace) return;
    
    try {
      const { startDate, endDate } = getDateRange(timePeriod);
      
      if (format === 'csv') {
        const blob = await apiService.exportCsv(currentSpace.spaceId, { startDate, endDate });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-data-${currentSpace.name}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = await apiService.exportPdfReport(currentSpace.spaceId, {
          startDate,
          endDate,
          title: `Financial Report - ${currentSpace.name}`,
          includeCharts: true,
          includeBudgetAnalysis: true,
          includeCategoryBreakdown: true,
          includeNetWorthAnalysis: true
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${currentSpace.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (!currentSpace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No space selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadAnalyticsData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const currentMonthSummary = data.monthlySummary[data.monthlySummary.length - 1];
  const overBudgetCount = data.budgetPerformance.filter(bp => bp.isOverBudget).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600">Comprehensive financial analysis for {currentSpace.name}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Time Period Selector */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          {/* Export Buttons */}
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Download size={16} />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances && currentMonthSummary ? 
                  `$${currentMonthSummary.netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}` : 
                  '••••••'
                }
              </p>
            </div>
            <div className={`p-3 rounded-full ${currentMonthSummary?.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${currentMonthSummary?.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalances && currentMonthSummary ? 
                  `${currentMonthSummary.savingsRate.toFixed(1)}%` : 
                  '••••••'
                }
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{data.categoryBreakdown.length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-2xl font-bold text-gray-900">{overBudgetCount}</p>
            </div>
            <div className={`p-3 rounded-full ${overBudgetCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <TrendingDown className={`h-6 w-6 ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {data.categoryBreakdown.slice(0, 8).map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.categoryColor || '#6B7280' }}
                  />
                  <span className="font-medium">{category.categoryName}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {showBalances ? `$${category.amount.toLocaleString()}` : '••••••'}
                  </p>
                  <p className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Budget Performance</h3>
          <div className="space-y-4">
            {data.budgetPerformance.slice(0, 6).map((budget) => (
              <div key={budget.budgetId}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{budget.categoryName}</span>
                  <span className={`text-sm ${budget.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {showBalances ? 
                      `$${budget.actualSpent.toLocaleString()} / $${budget.budgetAmount.toLocaleString()}` : 
                      '••••••'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${budget.isOverBudget ? 'bg-red-500' : budget.percentageUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Trends</h3>
          <div className="space-y-3">
            {data.cashFlow.slice(-6).map((flow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{new Date(flow.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    Income: {showBalances ? `$${flow.income.toLocaleString()}` : '••••••'} • 
                    Expenses: {showBalances ? `$${flow.expenses.toLocaleString()}` : '••••••'}
                  </p>
                </div>
                <span className={`font-semibold ${flow.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {flow.netFlow >= 0 ? '+' : ''}
                  {showBalances ? `$${flow.netFlow.toLocaleString()}` : '••••••'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Projections */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Financial Projections</h3>
          <div className="space-y-3">
            {data.projections.slice(0, 6).map((projection, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{new Date(projection.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">
                    Projected Savings: {showBalances ? `$${projection.projectedSavings.toLocaleString()}` : '••••••'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {showBalances ? `$${projection.projectedNetWorth.toLocaleString()}` : '••••••'}
                  </p>
                  <p className="text-xs text-gray-500">Net Worth</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Import/Export Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Import Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Import transactions from CSV files or bank statements
            </p>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload size={16} />
              <span>Import CSV</span>
            </button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Export Data</h4>
            <p className="text-sm text-gray-600 mb-4">
              Export your financial data and generate reports
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download size={16} />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};