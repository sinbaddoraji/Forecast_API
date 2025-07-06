import React, { useEffect, useState } from 'react';
import {
  EllipsisVerticalIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { RecurringIncome } from '../types/api';
import RecurringIncomeForm from './RecurringIncomeForm';
import { Modal } from './Modal';
import { formatCurrencyCompact } from '../utils/currency';

const RecurringIncomesList: React.FC = () => {
  const { currentSpace } = useSpace();
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<RecurringIncome | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (currentSpace?.spaceId) {
      loadRecurringIncomes();
    }
  }, [currentSpace?.spaceId]);

  const loadRecurringIncomes = async () => {
    if (!currentSpace?.spaceId) return;

    try {
      setLoading(true);
      const incomes = await apiService.getRecurringIncomes(currentSpace.spaceId);
      setRecurringIncomes(incomes);
      setError(null);
    } catch (error) {
      console.error('Error loading recurring incomes:', error);
      setError('Failed to load recurring incomes');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuToggle = (incomeId: string) => {
    setOpenMenuId(openMenuId === incomeId ? null : incomeId);
  };

  const handleEdit = (income: RecurringIncome) => {
    setSelectedIncome(income);
    setShowEditForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (incomeId: string) => {
    if (!currentSpace?.spaceId) return;

    try {
      await apiService.deleteRecurringIncome(currentSpace.spaceId, incomeId);
      await loadRecurringIncomes();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting recurring income:', error);
      setError('Failed to delete recurring income');
    }
  };

  const handleGenerate = async (incomeId: string) => {
    if (!currentSpace?.spaceId) return;

    try {
      await apiService.generateRecurringIncome(currentSpace.spaceId, incomeId);
      await loadRecurringIncomes();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error generating income:', error);
      setError('Failed to generate income');
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      Daily: 'Daily',
      Weekly: 'Weekly', 
      Monthly: 'Monthly',
      Quarterly: 'Quarterly',
      Yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      Daily: 'bg-red-100 text-red-800',
      Weekly: 'bg-orange-100 text-orange-800',
      Monthly: 'bg-blue-100 text-blue-800',
      Quarterly: 'bg-cyan-100 text-cyan-800',
      Yearly: 'bg-green-100 text-green-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyCompact(amount, currentSpace?.currency || 'USD');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={loadRecurringIncomes} 
          className="ml-4 text-red-700 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (recurringIncomes.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded">
        No recurring incomes set up yet. Click "Add Recurring Income" to get started.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringIncomes.map((income) => (
          <div 
            key={income.recurringIncomeId} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">
                {income.title}
              </h3>
              <div className="relative">
                <button
                  onClick={() => handleMenuToggle(income.recurringIncomeId)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                </button>
                
                {openMenuId === income.recurringIncomeId && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                    <button 
                      onClick={() => handleEdit(income)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleGenerate(income.recurringIncomeId)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PlayIcon className="h-4 w-4" />
                      Generate Now
                    </button>
                    <button 
                      onClick={() => handleDelete(income.recurringIncomeId)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-2xl font-bold text-green-600 mb-3">
              {formatCurrency(income.amount)}
            </p>

            <div className="flex gap-2 mb-3 flex-wrap">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(income.frequency)}`}>
                {getFrequencyLabel(income.frequency)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                income.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {income.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>Account: {income.accountName}</p>
              
              <p className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Next Due: {formatDate(income.nextDueDate)}
              </p>
              
              {income.lastGeneratedDate && (
                <p>Last Generated: {formatDate(income.lastGeneratedDate)}</p>
              )}
            </div>

            {income.notes && (
              <p className="mt-3 text-sm text-gray-500 italic">
                {income.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      <Modal
        show={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedIncome(null);
        }}
        title="Edit Recurring Income"
      >
        {selectedIncome && (
          <RecurringIncomeForm
            income={selectedIncome}
            onSuccess={() => {
              setShowEditForm(false);
              setSelectedIncome(null);
              loadRecurringIncomes();
            }}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedIncome(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default RecurringIncomesList;