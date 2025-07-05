import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CreditCard, RefreshCw, Loader2, TrendingUp } from 'lucide-react';
import { IncomeCard } from './IncomeCard';
import { useAccounts } from '../hooks/useApiData';
import type { Income, IncomeFilterDto } from '../types/api';

interface IncomeListProps {
  incomes: Income[];
  loading: boolean;
  error: string | null;
  onEdit: (income: Income) => void;
  onDelete: (incomeId: string) => void;
  onRefresh: () => void;
  filter?: IncomeFilterDto;
  onFilterChange?: (filter: IncomeFilterDto) => void;
  deletingIds?: string[];
}

export const IncomeList: React.FC<IncomeListProps> = ({ 
  incomes, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onRefresh,
  filter = {},
  onFilterChange,
  deletingIds = []
}) => {
  const { accounts } = useAccounts();
  const [searchTerm, setSearchTerm] = useState(filter.search || '');
  const [selectedAccount, setSelectedAccount] = useState(filter.accountId || '');
  const [startDate, setStartDate] = useState(
    filter.startDate ? filter.startDate.toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    filter.endDate ? filter.endDate.toISOString().split('T')[0] : ''
  );
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          ...filter,
          search: searchTerm || undefined
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(accountId);
    if (onFilterChange) {
      onFilterChange({
        ...filter,
        accountId: accountId || undefined
      });
    }
  };

  const handleDateRangeChange = () => {
    if (onFilterChange) {
      onFilterChange({
        ...filter,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAccount('');
    setStartDate('');
    setEndDate('');
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const getFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.accountId) count++;
    if (filter.startDate || filter.endDate) count++;
    return count;
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search incomes by title or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getFilterCount() > 0 && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs ml-1">
                  {getFilterCount()}
                </span>
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Account Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Account
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All accounts</option>
                    {accounts.map((account) => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={handleDateRangeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={handleDateRangeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {getFilterCount() > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      {incomes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="flex items-center gap-2 text-green-800 font-semibold mb-4">
            <TrendingUp className="h-5 w-5" />
            Income Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700">Total Income</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(calculateTotalIncome())}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Number of Entries</p>
              <p className="text-2xl font-bold text-green-800">
                {incomes.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Income List */}
      {loading && incomes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading incomes...</p>
        </div>
      ) : incomes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No incomes found</h3>
          <p className="text-gray-500 mb-4">
            {getFilterCount() > 0 
              ? "No incomes match your current filters. Try adjusting your search criteria."
              : "You haven't added any income entries yet. Start by adding your first income!"
            }
          </p>
          {getFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {incomes.map((income) => (
            <IncomeCard
              key={income.incomeId}
              income={income}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingIds.includes(income.incomeId)}
            />
          ))}
          
          {loading && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Loading more incomes...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};