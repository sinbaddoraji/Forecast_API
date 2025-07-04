import { type FC, useState } from 'react';
import { Plus, Loader2, Trash2, Target } from 'lucide-react';
import { useBudgets, useCategories } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface BudgetsViewNewProps {
  onAddBudget: () => void;
}

export const BudgetsView: FC<BudgetsViewProps> = ({ onAddBudget }) => {
  const { currentSpace } = useSpace();
  const { budgets, loading, refetch } = useBudgets();
  const { categories } = useCategories();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!currentSpace) {
    return <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">No space selected</p>
    </div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>;
  }

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    setDeleting(budgetId);
    try {
      await apiService.deleteBudget(currentSpace.spaceId, budgetId);
      await refetch();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    } finally {
      setDeleting(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        <button 
          onClick={onAddBudget}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-500 mb-6">Set spending limits for different categories to track your expenses.</p>
          <button 
            onClick={onAddBudget}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => {
            const spentAmount = budget.spentAmount || 0;
            const percentage = (spentAmount / budget.amount) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;
            const isDeleting = deleting === budget.budgetId;

            return (
              <div key={budget.budgetId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {getCategoryName(budget.categoryId)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.budgetId)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 
                        isNearLimit ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        ${spentAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        ${budget.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Budget</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${(budget.amount - spentAmount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(budget.amount - spentAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(budget.amount - spentAmount) >= 0 ? 'Remaining' : 'Over'}
                      </p>
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 font-medium">
                        ⚠️ Over budget by ${(spentAmount - budget.amount).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {isNearLimit && !isOverBudget && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 font-medium">
                        ⚡ Near budget limit
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};