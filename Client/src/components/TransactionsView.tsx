import { type FC, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Loader2, Trash2, Filter } from 'lucide-react';
import { useTransactions, useAccounts, useCategories } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface TransactionsViewNewProps {
  onAddTransaction: () => void;
}

export const TransactionsView: FC<TransactionsViewProps> = ({ onAddTransaction }) => {
  const { currentSpace } = useSpace();
  const { expenses, incomes, loading, refetch } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
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

  // Combine and sort transactions
  const allTransactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...incomes.map(i => ({ ...i, type: 'income' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions
  const filteredTransactions = allTransactions.filter(t => 
    filter === 'all' || t.type === filter
  );

  const handleDelete = async (transaction: typeof allTransactions[0]) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    const id = transaction.type === 'expense' ? transaction.expenseId : transaction.incomeId;
    setDeleting(id);
    
    try {
      if (transaction.type === 'expense') {
        await apiService.deleteExpense(currentSpace.spaceId, id);
      } else {
        await apiService.deleteIncome(currentSpace.spaceId, id);
      }
      await refetch();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeleting(null);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.accountId === accountId);
    return account?.name || 'Unknown Account';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All Transactions</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button 
            onClick={onAddTransaction}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {filter === 'all' ? 'No transactions yet' : `No ${filter}s yet`}
          </p>
        ) : (
          filteredTransactions.map(t => {
            const id = t.type === 'expense' ? t.expenseId : t.incomeId;
            const isDeleting = deleting === id;
            
            return (
              <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownLeft size={16} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-sm text-gray-500">
                      {t.type === 'expense' && getCategoryName('categoryId' in t ? t.categoryId : undefined)} • {getAccountName(t.accountId)} • {new Date(t.date).toLocaleDateString()}
                    </p>
                    {t.type === 'expense' && 'notes' in t && t.notes && (
                      <p className="text-xs text-gray-400 mt-1">{t.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </span>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};