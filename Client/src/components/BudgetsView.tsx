import type { FC } from 'react';
import { Plus } from 'lucide-react';
import type { Budget } from '../types/budget';

interface BudgetsViewProps {
  budgets: Budget[];
  onAddBudget: () => void;
}

export const BudgetsView: FC<BudgetsViewProps> = ({ budgets, onAddBudget }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budget Management</h2>
        <button onClick={onAddBudget} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Budget</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map(b => {
          const percentage = (b.spent / b.limit) * 100;
          const remaining = b.limit - b.spent;
          return (
            <div key={b.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">{b.category}</h3>
                <div className="text-right">
                  <p className="font-semibold">${b.spent.toLocaleString()} / ${b.limit.toLocaleString()}</p>
                  <p className={`text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'remaining' : 'over'}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 90 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{percentage.toFixed(1)}% of budget used</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};