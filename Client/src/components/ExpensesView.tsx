import React, { useState } from 'react';
import { ExpenseList } from './ExpenseList';
import { ExpenseForm } from './ExpenseForm';
import { Modal } from './Modal';
import { useExpenses } from '../hooks/useExpenses';
import type { ExpenseResponseDto, CreateExpenseDto, UpdateExpenseDto } from '../types/api';

export const ExpensesView: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createExpense, updateExpense, deleteExpense } = useExpenses();

  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowAddForm(true);
    setError(null);
  };

  const handleEditExpense = (expense: ExpenseResponseDto) => {
    setEditingExpense(expense);
    setShowAddForm(true);
    setError(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setError(null);
  };

  const handleSubmit = async (data: CreateExpenseDto | UpdateExpenseDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.expenseId, data as UpdateExpenseDto);
      } else {
        await createExpense(data as CreateExpenseDto);
      }
      handleCloseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(expenseId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <ExpenseList
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <Modal 
          show={showAddForm}
          onClose={handleCloseForm}
          title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        >
          <div className="w-full max-w-2xl">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <ExpenseForm
              expense={editingExpense || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isSubmitting={isSubmitting}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};