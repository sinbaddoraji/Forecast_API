import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { useAccounts, useCategories } from '../hooks/useApiData';
import { useExpenseForm } from '../hooks/useExpenses';
import type { ExpenseResponseDto, CreateExpenseDto, UpdateExpenseDto } from '../types/api';

interface ExpenseFormProps {
  expense?: ExpenseResponseDto;
  onSubmit: (data: CreateExpenseDto | UpdateExpenseDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm
  } = useExpenseForm(expense);

  const isEditing = !!expense;
  const loading = accountsLoading || categoriesLoading;

  useEffect(() => {
    // Set default account if none selected and accounts are loaded
    if (!formData.accountId && accounts.length > 0) {
      updateField('accountId', accounts[0].accountId);
    }
  }, [accounts, formData.accountId, updateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter expense title"
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              step="0.01"
              min="0.01"
              value={formData.amount || ''}
              onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={formatDateForInput(formData.date)}
            onChange={(e) => updateField('date', new Date(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Account */}
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
            Account *
          </label>
          <select
            id="accountId"
            value={formData.accountId}
            onChange={(e) => updateField('accountId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.accountId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.name} (${account.currentBalance.toFixed(2)})
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => updateField('categoryId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.categoryId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};