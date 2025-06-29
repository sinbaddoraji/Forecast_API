import { type FC } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Target, PiggyBank, BarChart3, Loader2 } from 'lucide-react';
import { useAccounts, useTransactions, useBudgets, useSavingsGoals } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';

interface DashboardNewProps {
  showBalances: boolean;
  onAddTransaction: () => void;
  onAddBudget: () => void;
  onAddGoal: () => void;
  onNavigate: (view: string) => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export const DashboardNew: FC<DashboardNewProps> = ({ 
  showBalances,
  onAddTransaction,
  onAddBudget,
  onAddGoal,
  onNavigate
}) => {
  const { currentSpace } = useSpace();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { expenses, incomes, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useSavingsGoals();

  if (!currentSpace) {
    return <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">No space selected</p>
    </div>;
  }

  const loading = accountsLoading || transactionsLoading || budgetsLoading || goalsLoading;

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>;
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const currentMonthIncomes = incomes.filter(i => i.date.toString().startsWith(getCurrentMonth()));
  const currentMonthExpenses = expenses.filter(e => e.date.toString().startsWith(getCurrentMonth()));
  const monthlyIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const monthlyExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Combine and sort transactions
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...incomes.map(i => ({ ...i, type: 'income' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentTransactions = allTransactions.slice(0, 5);
    
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
            {showBalances ? `$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-green-100">Monthly Income</p>
            <ArrowUpRight size={32} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {showBalances ? `$${monthlyIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
          </p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-100">Monthly Expenses</p>
            <ArrowDownLeft size={32} className="text-red-200" />
          </div>
          <p className="text-3xl font-bold mt-2">
            {showBalances ? `$${monthlyExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '••••••'}
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
              <button onClick={onAddTransaction} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Plus className="text-blue-600 mb-2" size={24} />
                <span className="text-sm font-medium text-blue-700 text-center">Add Transaction</span>
              </button>
              <button onClick={onAddBudget} className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Target className="text-green-600 mb-2" size={24} />
                <span className="text-sm font-medium text-green-700 text-center">Set Budget</span>
              </button>
              <button onClick={onAddGoal} className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
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
              <button onClick={() => onNavigate('transactions')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                recentTransactions.map(t => (
                  <div key={t.type === 'expense' ? t.expenseId : t.incomeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownLeft size={16} className="text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-sm text-gray-500">
                          {t.type === 'expense' && 'category' in t && t.category?.name} • {new Date(t.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Side Column on Desktop */}
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <div className="space-y-4">
              {budgets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No budgets set</p>
              ) : (
                budgets.slice(0, 4).map(budget => {
                  const percentage = budget.spentAmount ? (budget.spentAmount / budget.amount) * 100 : 0;
                  return (
                    <div key={budget.budgetId}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{budget.category?.name || 'Uncategorized'}</span>
                        <span className="text-xs text-gray-500">
                          ${(budget.spentAmount || 0).toLocaleString()} / ${budget.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Savings Goals</h3>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No savings goals</p>
              ) : (
                goals.slice(0, 3).map(goal => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.goalId}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{goal.name}</span>
                        <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-purple-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};