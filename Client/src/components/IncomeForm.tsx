import React, { useEffect } from 'react';
import { Loader2, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import { useAccounts } from '../hooks/useApiData';
import { useIncomeForm } from '../hooks/useIncomes';
import type { CreateIncomeDto, UpdateIncomeDto, Income } from '../types/api';

interface IncomeFormProps {
  onSubmit: (data: CreateIncomeDto | UpdateIncomeDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Income;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEdit = false,
  isSubmitting = false 
}) => {
  const { accounts, loading: accountsLoading } = useAccounts();
  const {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm
  } = useIncomeForm(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      updateField('date', date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Account Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CreditCard className="h-4 w-4" />
            Account *
          </label>
          <select
            value={formData.accountId}
            onChange={(e) => updateField('accountId', e.target.value)}
            disabled={accountsLoading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.accountId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">
              {accountsLoading ? "Loading accounts..." : "Select an account"}
            </option>
            {accounts.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.name} ({account.type}) • ${account.currentBalance.toFixed(2)}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="text-sm text-red-600">{errors.accountId}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileText className="h-4 w-4" />
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., Salary, Freelance payment, Investment return"
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <DollarSign className="h-4 w-4" />
            Amount *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4 w-4" />
            Date *
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.date)}
            onChange={(e) => handleDateChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Add any additional details about this income..."
            rows={3}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.notes ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes}</p>
          )}
          <p className="text-xs text-gray-500">
            {(formData.notes || '').length}/500 characters
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Income' : 'Add Income'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        {!isEdit && (
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="ml-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Clear Form
          </button>
        )}
      </div>
    </form>
  );
};