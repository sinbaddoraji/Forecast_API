import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { 
  RecurringExpense, 
  CreateRecurringExpenseDto, 
  UpdateRecurringExpenseDto,
  RecurrenceFrequency,
  Account,
  CategoryResponseDto
} from '../types/api';

interface RecurringExpenseFormProps {
  expense?: RecurringExpense;
  onSuccess: () => void;
  onCancel: () => void;
}

const frequencyOptions = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' }
];

const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({
  expense,
  onSuccess,
  onCancel
}) => {
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);

  const [formData, setFormData] = useState({
    accountId: expense?.accountId || '',
    title: expense?.title || '',
    amount: expense?.amount || 0,
    categoryId: expense?.categoryId || '',
    notes: expense?.notes || '',
    frequency: expense?.frequency || 'Monthly' as RecurrenceFrequency,
    startDate: expense ? new Date(expense.startDate) : new Date(),
    endDate: expense?.endDate ? new Date(expense.endDate) : null,
    isActive: expense?.isActive ?? true
  });

  useEffect(() => {
    if (currentSpace?.spaceId) {
      loadAccounts();
      loadCategories();
    }
  }, [currentSpace?.spaceId]);

  const loadAccounts = async () => {
    if (!currentSpace?.spaceId) return;

    try {
      const accountsData = await apiService.getAccounts(currentSpace.spaceId);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setError('Failed to load accounts');
    }
  };

  const loadCategories = async () => {
    if (!currentSpace?.spaceId) return;

    try {
      const categoriesData = await apiService.getCategories(currentSpace.spaceId);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace?.spaceId) return;

    setLoading(true);
    setError(null);

    try {
      if (expense) {
        // Update existing recurring expense
        const updateData: UpdateRecurringExpenseDto = {
          title: formData.title,
          amount: formData.amount,
          categoryId: formData.categoryId || undefined,
          notes: formData.notes || undefined,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          isActive: formData.isActive
        };

        await apiService.updateRecurringExpense(
          currentSpace.spaceId,
          expense.recurringExpenseId,
          updateData
        );
      } else {
        // Create new recurring expense
        const createData: CreateRecurringExpenseDto = {
          accountId: formData.accountId,
          title: formData.title,
          amount: formData.amount,
          categoryId: formData.categoryId || undefined,
          notes: formData.notes || undefined,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined
        };

        await apiService.createRecurringExpense(currentSpace.spaceId, createData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving recurring expense:', error);
      setError('Failed to save recurring expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFrequencyDescription = (frequency: RecurrenceFrequency) => {
    const descriptions: { [key: string]: string } = {
      Daily: 'Every day',
      Weekly: 'Every week',
      Monthly: 'Every month',
      Quarterly: 'Every 3 months',
      Yearly: 'Every year'
    };
    return descriptions[frequency] || frequency;
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            required
            disabled={loading}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
            Account *
          </label>
          <select
            id="accountId"
            value={formData.accountId}
            onChange={(e) => handleChange('accountId', e.target.value)}
            required
            disabled={loading || Boolean(expense)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency *
          </label>
          <select
            id="frequency"
            value={formData.frequency}
            onChange={(e) => handleChange('frequency', e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="text-sm text-gray-600 mb-4">
            Schedule: {getFrequencyDescription(formData.frequency)}
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <div className="relative">
            <input
              id="startDate"
              type="date"
              value={formData.startDate.toISOString().split('T')[0]}
              onChange={(e) => handleChange('startDate', new Date(e.target.value))}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <div className="relative">
            <input
              id="endDate"
              type="date"
              value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : null)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={loading}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {expense && (
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                disabled={loading}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        )}

        <div className="md:col-span-2 flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : expense ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RecurringExpenseForm;