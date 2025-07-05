import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, CreditCard, RefreshCw, Loader2, TrendingUp } from 'lucide-react';
import { IncomeCard } from './IncomeCard';
import { useAccounts } from '../hooks/useAccounts';
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

export function IncomeList({ 
  incomes, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onRefresh,
  filter = {},
  onFilterChange,
  deletingIds = []
}: IncomeListProps) {
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search incomes by title or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {getFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
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
                    <Select value={selectedAccount} onValueChange={handleAccountChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All accounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All accounts</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.accountId} value={account.accountId}>
                            {account.name} ({account.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onBlur={handleDateRangeChange}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onBlur={handleDateRangeChange}
                    />
                  </div>
                </div>

                {getFilterCount() > 0 && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {incomes.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Income Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Income List */}
      {loading && incomes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading incomes...</p>
          </CardContent>
        </Card>
      ) : incomes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incomes found</h3>
            <p className="text-gray-500 mb-4">
              {getFilterCount() > 0 
                ? "No incomes match your current filters. Try adjusting your search criteria."
                : "You haven't added any income entries yet. Start by adding your first income!"
              }
            </p>
            {getFilterCount() > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
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
            <Card>
              <CardContent className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Loading more incomes...</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}