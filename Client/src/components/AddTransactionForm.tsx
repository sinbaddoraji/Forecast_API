import type { FC, Dispatch } from 'react';
import { useState } from 'react';
import type { AppState, AppAction } from '../types/budget';

interface AddTransactionFormProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  closeModal: () => void;
}

export const AddTransactionForm: FC<AddTransactionFormProps> = ({ state, dispatch, closeModal }) => {
  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    category: '',
    description: '',
    walletId: state.wallets[0]?.id || 1
  });

  const handleSubmit = () => {
    if (!formData.amount || !formData.category || !formData.description) {
      alert("Please fill all fields.");
      return;
    }
    dispatch({ 
      type: 'ADD_TRANSACTION', 
      payload: { 
        ...formData, 
        amount: parseFloat(formData.amount) 
      } 
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <select 
          value={formData.type} 
          onChange={(e) => setFormData({...formData, type: e.target.value as 'expense' | 'income'})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input 
          type="number" 
          step="0.01" 
          value={formData.amount} 
          onChange={(e) => setFormData({...formData, amount: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <input 
          type="text" 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input 
          type="text" 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Wallet</label>
        <select 
          value={formData.walletId} 
          onChange={(e) => setFormData({...formData, walletId: parseInt(e.target.value)})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {state.wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} (${wallet.balance.toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-3 pt-2">
        <button 
          type="button" 
          onClick={closeModal} 
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSubmit} 
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Add Transaction
        </button>
      </div>
    </div>
  );
};