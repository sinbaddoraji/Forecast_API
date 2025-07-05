import React, { useState } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { ExpenseCard } from './ExpenseCard';
import { useExpenses } from '../hooks/useExpenses';
import { useAccounts, useCategories } from '../hooks/useApiData';
import type { ExpenseResponseDto, ExpenseFilterDto } from '../types/api';

interface ExpenseListProps {
  onAddExpense?: () => void;
  onEditExpense?: (expense: ExpenseResponseDto) => void;
  onDeleteExpense?: (expenseId: string) => void;
  showActions?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  showActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilterDto>({});
  
  const { expenses, loading, error, refetch } = useExpenses(filters);
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const filteredExpenses = expenses.filter(expense =>
    expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFilterChange = (newFilters: Partial<ExpenseFilterDto>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading expenses: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
        {onAddExpense && (
          <button
            onClick={onAddExpense}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          
          {(filters.startDate || filters.endDate || filters.categoryId || filters.accountId) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(filters.startDate)}
                  onChange={(e) => handleFilterChange({ 
                    startDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(filters.endDate)}
                  onChange={(e) => handleFilterChange({ 
                    endDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange({ 
                    categoryId: e.target.value || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account
                </label>
                <select
                  value={filters.accountId || ''}
                  onChange={(e) => handleFilterChange({ 
                    accountId: e.target.value || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All accounts</option>
                  {accounts.map((account) => (
                    <option key={account.accountId} value={account.accountId}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading expenses...
          </div>
        ) : (
          `${filteredExpenses.length} expense${filteredExpenses.length !== 1 ? 's' : ''} found`
        )}
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'No expenses match your search criteria' 
              : 'No expenses found'
            }
          </p>
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Add your first expense
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.expenseId}
              expense={expense}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};