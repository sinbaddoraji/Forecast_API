import React, { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { IncomeForm } from './IncomeForm';
import { IncomeList } from './IncomeList';
import { Modal } from './Modal';
import { useIncomes } from '../hooks/useIncomes';
import type { Income, CreateIncomeDto, UpdateIncomeDto, IncomeFilterDto } from '../types/api';

export const IncomeView: React.FC = () => {
  const [filter, setFilter] = useState<IncomeFilterDto>({});
  const { incomes, loading, error, createIncome, updateIncome, deleteIncome, refresh } = useIncomes(filter);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateIncome = async (data: CreateIncomeDto) => {
    try {
      setIsSubmitting(true);
      await createIncome(data);
      setShowAddForm(false);
      // Could add a toast notification here if available
    } catch (error) {
      console.error('Failed to create income:', error);
      // Could show error notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIncome = async (data: UpdateIncomeDto) => {
    if (!editingIncome) return;
    
    try {
      setIsSubmitting(true);
      await updateIncome(editingIncome.incomeId, data);
      setEditingIncome(null);
    } catch (error) {
      console.error('Failed to update income:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      setDeletingIds(prev => [...prev, incomeId]);
      await deleteIncome(incomeId);
    } catch (error) {
      console.error('Failed to delete income:', error);
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== incomeId));
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
  };

  const handleFilterChange = (newFilter: IncomeFilterDto) => {
    setFilter(newFilter);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Income Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your income sources
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </button>
      </div>

      {/* Quick Stats */}
      {incomes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-green-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-700 mb-2">Total Income</h3>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(calculateTotalIncome())}
            </div>
          </div>
          
          <div className="bg-white border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Income Entries</h3>
            <div className="text-2xl font-bold text-blue-800">
              {incomes.length}
            </div>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-purple-700 mb-2">Average Income</h3>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(incomes.length > 0 ? calculateTotalIncome() / incomes.length : 0)}
            </div>
          </div>
        </div>
      )}

      {/* Income List */}
      <IncomeList
        incomes={incomes}
        loading={loading}
        error={error}
        onEdit={handleEditIncome}
        onDelete={handleDeleteIncome}
        onRefresh={refresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        deletingIds={deletingIds}
      />

      {/* Add Income Modal */}
      <Modal 
        show={showAddForm} 
        onClose={() => setShowAddForm(false)} 
        title="Add New Income"
      >
        <IncomeForm
          onSubmit={handleCreateIncome}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Income Modal */}
      <Modal 
        show={!!editingIncome} 
        onClose={() => setEditingIncome(null)} 
        title="Edit Income"
      >
        {editingIncome && (
          <IncomeForm
            onSubmit={handleUpdateIncome}
            onCancel={() => setEditingIncome(null)}
            initialData={editingIncome}
            isEdit={true}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
};