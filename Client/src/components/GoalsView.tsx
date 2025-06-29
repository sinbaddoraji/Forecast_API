import type { FC } from 'react';
import { Plus } from 'lucide-react';
import type { SavingsGoal } from '../types/budget';

interface GoalsViewProps {
  goals: SavingsGoal[];
  onAddGoal: () => void;
}

export const GoalsView: FC<GoalsViewProps> = ({ goals, onAddGoal }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Savings Goals</h2>
        <button onClick={onAddGoal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Goal</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(g => {
          const percentage = (g.current / g.target) * 100;
          const remaining = g.target - g.current;
          return (
            <div key={g.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{g.name}</h3>
                  <p className="text-sm text-gray-600">Due: {new Date(g.deadline).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${g.current.toLocaleString()} / ${g.target.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="h-3 rounded-full bg-purple-500" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-600">{percentage.toFixed(1)}% complete</p>
                <p className="text-sm font-medium text-purple-600">${remaining.toLocaleString()} to go</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};