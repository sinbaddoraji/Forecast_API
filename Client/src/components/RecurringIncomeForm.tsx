import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { 
  RecurringIncome, 
  CreateRecurringIncomeDto, 
  UpdateRecurringIncomeDto,
  RecurrenceFrequency,
  Account
} from '../types/api';

interface RecurringIncomeFormProps {
  income?: RecurringIncome;
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

const RecurringIncomeForm: React.FC<RecurringIncomeFormProps> = ({
  income,
  onSuccess,
  onCancel
}) => {
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    accountId: income?.accountId || '',
    title: income?.title || '',
    amount: income?.amount || 0,
    notes: income?.notes || '',
    frequency: income?.frequency || 'Monthly' as RecurrenceFrequency,
    startDate: income ? new Date(income.startDate) : new Date(),
    endDate: income?.endDate ? new Date(income.endDate) : null,
    isActive: income?.isActive ?? true
  });

  useEffect(() => {
    if (currentSpace?.spaceId) {
      loadAccounts();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace?.spaceId) return;

    setLoading(true);
    setError(null);

    try {
      if (income) {
        // Update existing recurring income
        const updateData: UpdateRecurringIncomeDto = {
          title: formData.title,
          amount: formData.amount,
          notes: formData.notes || undefined,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          isActive: formData.isActive
        };

        await apiService.updateRecurringIncome(
          currentSpace.spaceId,
          income.recurringIncomeId,
          updateData
        );
      } else {
        // Create new recurring income
        const createData: CreateRecurringIncomeDto = {
          accountId: formData.accountId,
          title: formData.title,
          amount: formData.amount,
          notes: formData.notes || undefined,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined
        };

        await apiService.createRecurringIncome(currentSpace.spaceId, createData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving recurring income:', error);
      setError('Failed to save recurring income');
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
            placeholder="e.g., Salary, Freelance Income"
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
            disabled={loading || Boolean(income)}
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

        <div>
          <div className="text-sm text-gray-600 mt-2">
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
            placeholder="Additional details about this income source"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {income && (
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
            {loading ? 'Saving...' : income ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RecurringIncomeForm;