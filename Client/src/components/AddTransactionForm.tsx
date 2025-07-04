import { type FC, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAccounts, useCategories, useTransactions } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface AddTransactionFormNewProps {
  closeModal: () => void;
}

export const AddTransactionForm: FC<AddTransactionFormProps> = ({ closeModal }) => {
  const { currentSpace } = useSpace();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { refetch: refetchTransactions } = useTransactions();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    category: '',
    title: '',
    accountId: accounts[0]?.accountId || '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.title || !formData.accountId) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!currentSpace) {
      alert("No space selected");
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        accountId: formData.accountId,
        date: new Date(),
        ...(formData.type === 'expense' && {
          categoryId: formData.category || undefined,
          notes: formData.notes || undefined
        })
      };

      if (formData.type === 'expense') {
        await apiService.createExpense(currentSpace.spaceId, transactionData);
      } else {
        await apiService.createIncome(currentSpace.spaceId, transactionData);
      }

      await refetchTransactions();
      closeModal();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (accountId: string) => {
    setFormData({...formData, accountId});
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData({...formData, category: categoryId});
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <select 
          value={formData.type} 
          onChange={(e) => setFormData({...formData, type: e.target.value as 'expense' | 'income'})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="Enter transaction title"
          required 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Amount *</label>
        <input 
          type="number" 
          step="0.01" 
          value={formData.amount} 
          onChange={(e) => setFormData({...formData, amount: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="0.00"
          required 
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Account *</label>
        <select 
          value={formData.accountId} 
          onChange={(e) => handleAccountChange(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={loading}
        >
          <option value="">Select an account</option>
          {accounts.map(account => (
            <option key={account.accountId} value={account.accountId}>
              {account.name} (${account.currentBalance.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {formData.type === 'expense' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => handleCategoryChange(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Select a category (optional)</option>
              {categories.map(category => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Additional notes (optional)"
              rows={3}
              disabled={loading}
            />
          </div>
        </>
      )}

      <div className="flex space-x-3 pt-2">
        <button 
          type="button" 
          onClick={closeModal} 
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSubmit} 
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Adding...
            </>
          ) : (
            'Add Transaction'
          )}
        </button>
      </div>
    </div>
  );
};