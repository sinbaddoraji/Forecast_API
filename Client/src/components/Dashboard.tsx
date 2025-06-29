import type { FC, Dispatch, SetStateAction } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Target, PiggyBank, BarChart3 } from 'lucide-react';
import type { AppState, AppAction } from '../types/budget';

interface DashboardProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  setShowAddTransaction: Dispatch<SetStateAction<boolean>>;
  setShowAddBudget: Dispatch<SetStateAction<boolean>>;
  setShowAddGoal: Dispatch<SetStateAction<boolean>>;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export const Dashboard: FC<DashboardProps> = ({ 
  state, 
  dispatch, 
  setShowAddTransaction, 
  setShowAddBudget, 
  setShowAddGoal 
}) => {
  const totalBalance = state.wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const monthlyIncome = state.transactions
    .filter(t => t.type === 'income' && t.date.startsWith(getCurrentMonth()))
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(getCurrentMonth()))
    .reduce((sum, t) => sum + t.amount, 0);
    
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-blue-100">Total Balance</p>
            <Wallet size={32} className="text-blue-200" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {state.showBalances ? `$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-green-100">Monthly Income</p>
            <ArrowUpRight size={32} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {state.showBalances ? `$${monthlyIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-100">Monthly Expenses</p>
            <ArrowDownLeft size={32} className="text-red-200" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {state.showBalances ? `$${monthlyExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
          </p>
        </div>
      </div>

      {/* Main Content Grid for Desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => setShowAddTransaction(true)} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus className="text-blue-600 mb-2" size={24} />
                <span className="text-sm font-medium text-blue-700 text-center">Add Transaction</span>
              </button>
              <button onClick={() => setShowAddBudget(true)} className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Target className="text-green-600 mb-2" size={24} />
                <span className="text-sm font-medium text-green-700 text-center">Set Budget</span>
              </button>
              <button onClick={() => setShowAddGoal(true)} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <PiggyBank className="text-purple-600 mb-2" size={24} />
                <span className="text-sm font-medium text-purple-700 text-center">Add Goal</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <BarChart3 className="text-gray-600 mb-2" size={24} />
                <span className="text-sm font-medium text-gray-700 text-center">View Reports</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'transactions' })} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {state.transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownLeft size={16} className="text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Side Column on Desktop */}
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <div className="space-y-4">
              {state.budgets.slice(0, 4).map(budget => {
                const percentage = (budget.spent / budget.limit) * 100;
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{budget.category}</span>
                      <span className="text-xs text-gray-500">${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Savings Goals</h3>
            <div className="space-y-4">
              {state.savingsGoals.slice(0, 3).map(goal => {
                const percentage = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{goal.name}</span>
                      <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-purple-500" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};