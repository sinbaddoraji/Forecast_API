import React, { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentIcon,
  DocumentTextIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { Account, CategoryResponseDto } from '../types/api';

const DataExportForm: React.FC = () => {
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

  const [exportSettings, setExportSettings] = useState({
    exportType: 'transactions',
    format: 'csv',
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    endDate: new Date(),
    categoryId: '',
    accountId: '',
    // PDF Report specific settings
    title: `Financial Report - ${new Date().getFullYear()}`,
    includeCharts: true,
    includeBudgetAnalysis: true,
    includeCategoryBreakdown: true,
    includeNetWorthAnalysis: true
  });

  useEffect(() => {
    if (currentSpace?.spaceId) {
      loadData();
    }
  }, [currentSpace?.spaceId]);

  const loadData = async () => {
    if (!currentSpace?.spaceId) return;

    try {
      const [accountsData, categoriesData] = await Promise.all([
        apiService.getAccounts(currentSpace.spaceId),
        apiService.getCategories(currentSpace.spaceId)
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load accounts and categories');
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!currentSpace?.spaceId) return;

    setLoading(true);
    setError(null);

    try {
      let blob: Blob;
      let filename: string;

      const filter = {
        startDate: exportSettings.startDate,
        endDate: exportSettings.endDate,
        categoryId: exportSettings.categoryId || undefined,
        accountId: exportSettings.accountId || undefined,
        exportType: exportSettings.exportType
      };

      if (format === 'csv') {
        blob = await apiService.exportCsv(currentSpace.spaceId, filter);
        filename = `transactions_${currentSpace.spaceId}_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (format === 'excel') {
        blob = await apiService.exportCsv(currentSpace.spaceId, filter); // Backend returns CSV for Excel too
        filename = `transactions_${currentSpace.spaceId}_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (format === 'pdf') {
        const reportOptions = {
          startDate: exportSettings.startDate,
          endDate: exportSettings.endDate,
          title: exportSettings.title,
          includeCharts: exportSettings.includeCharts,
          includeBudgetAnalysis: exportSettings.includeBudgetAnalysis,
          includeCategoryBreakdown: exportSettings.includeCategoryBreakdown,
          includeNetWorthAnalysis: exportSettings.includeNetWorthAnalysis
        };
        blob = await apiService.exportPdfReport(currentSpace.spaceId, reportOptions);
        filename = `financial_report_${currentSpace.spaceId}_${new Date().toISOString().split('T')[0]}.json`;
      } else {
        throw new Error('Unsupported export format');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Export error:', error);
      setError(error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Export Financial Data
      </h2>
      
      <p className="text-sm text-gray-600 mb-6">
        Export your transaction data and financial reports in various formats for backup, analysis, or sharing.
      </p>

      {/* Export Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Export Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={exportSettings.startDate}
              onChange={(date) => setExportSettings(prev => ({ 
                ...prev, 
                startDate: date || new Date() 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="MM/dd/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={exportSettings.endDate}
              onChange={(date) => setExportSettings(prev => ({ 
                ...prev, 
                endDate: date || new Date() 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="MM/dd/yyyy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account (Optional)
            </label>
            <select
              value={exportSettings.accountId}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                accountId: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.accountId} value={account.accountId}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional)
            </label>
            <select
              value={exportSettings.categoryId}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                categoryId: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded mt-4">
          <p className="text-sm">
            Exporting data from {formatDate(exportSettings.startDate)} to {formatDate(exportSettings.endDate)}
            {exportSettings.accountId && ` • Account: ${accounts.find(a => a.accountId === exportSettings.accountId)?.name}`}
            {exportSettings.categoryId && ` • Category: ${categories.find(c => c.categoryId === exportSettings.categoryId)?.name}`}
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CSV Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <TableCellsIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            CSV Export
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Export transaction data in CSV format for spreadsheet analysis
          </p>
          <button
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Download CSV
          </button>
        </div>

        {/* Excel Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <DocumentTextIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Excel Export
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Export data in Excel-compatible format
          </p>
          <button
            onClick={() => handleExport('excel')}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Download Excel
          </button>
        </div>

        {/* PDF Report */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <DocumentIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            PDF Report
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate a comprehensive financial report
          </p>
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Generate Report
          </button>
        </div>
      </div>

      {/* PDF Report Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          PDF Report Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportSettings.includeCharts}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                includeCharts: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include Charts and Graphs</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportSettings.includeBudgetAnalysis}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                includeBudgetAnalysis: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include Budget Analysis</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportSettings.includeCategoryBreakdown}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                includeCategoryBreakdown: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include Category Breakdown</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exportSettings.includeNetWorthAnalysis}
              onChange={(e) => setExportSettings(prev => ({ 
                ...prev, 
                includeNetWorthAnalysis: e.target.checked 
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include Net Worth Analysis</span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default DataExportForm;