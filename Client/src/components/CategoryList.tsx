import React, { useState } from 'react';
import { Search, Plus, Loader2, BarChart3, Grid, List } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { useCategories } from '../hooks/useCategories';
import type { CategoryResponseDto } from '../types/api';

interface CategoryListProps {
  onAddCategory?: () => void;
  onEditCategory?: (category: CategoryResponseDto) => void;
  onDeleteCategory?: (categoryId: string) => void;
  showActions?: boolean;
  viewMode?: 'grid' | 'list';
}

export const CategoryList: React.FC<CategoryListProps> = ({
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  showActions = true,
  viewMode = 'grid'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'expenses' | 'total'>('name');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  
  const { categories, loading, error, refetch } = useCategories();

  const filteredAndSortedCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'expenses':
          return b.expenseCount - a.expenseCount;
        case 'total':
          return b.totalExpenses - a.totalExpenses;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading categories: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const totalExpenses = categories.reduce((sum, cat) => sum + cat.totalExpenses, 0);
  const totalCategoriesWithExpenses = categories.filter(cat => cat.expenseCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 text-sm mt-1">
            {categories.length} categories • {totalCategoriesWithExpenses} with expenses
          </p>
        </div>
        {onAddCategory && (
          <button
            onClick={onAddCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {categories.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Category Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Total Spent:</span>
              <p className="font-bold text-lg text-blue-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(totalExpenses)}
              </p>
            </div>
            <div>
              <span className="text-blue-600">Active Categories:</span>
              <p className="font-bold text-lg text-blue-900">{totalCategoriesWithExpenses}</p>
            </div>
            <div>
              <span className="text-blue-600">Avg per Category:</span>
              <p className="font-bold text-lg text-blue-900">
                {totalCategoriesWithExpenses > 0 
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(totalExpenses / totalCategoriesWithExpenses)
                  : '$0.00'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'expenses' | 'total')}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="expenses">Number of Expenses</option>
              <option value="total">Total Amount</option>
            </select>
          </div>

          <div className="flex items-center gap-1 border border-gray-300 rounded">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={`p-2 ${currentViewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={`p-2 ${currentViewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading categories...
          </div>
        ) : (
          `${filteredAndSortedCategories.length} categor${filteredAndSortedCategories.length !== 1 ? 'ies' : 'y'} found`
        )}
      </div>

      {/* Category List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredAndSortedCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm 
              ? 'No categories match your search criteria' 
              : 'No categories found'
            }
          </p>
          {onAddCategory && !searchTerm && (
            <button
              onClick={onAddCategory}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Create your first category
            </button>
          )}
        </div>
      ) : (
        <div className={
          currentViewMode === 'grid' 
            ? 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'space-y-2'
        }>
          {filteredAndSortedCategories.map((category) => (
            <CategoryCard
              key={category.categoryId}
              category={category}
              onEdit={onEditCategory}
              onDelete={onDeleteCategory}
              showActions={showActions}
              showStats={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};