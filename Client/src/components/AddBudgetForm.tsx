import type { FC, Dispatch } from 'react';
import { useState } from 'react';
import type { AppAction } from '../types/budget';

interface AddBudgetFormProps {
  dispatch: Dispatch<AppAction>;
  closeModal: () => void;
}

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export const AddBudgetForm: FC<AddBudgetFormProps> = ({ dispatch, closeModal }) => {
  const [formData, setFormData] = useState({ category: '', limit: '' });

  const handleSubmit = () => {
    if (!formData.category || !formData.limit) {
      alert("Please fill all fields.");
      return;
    }
    dispatch({
      type: 'ADD_BUDGET',
      payload: {
        category: formData.category,
        limit: parseFloat(formData.limit),
        spent: 0,
        month: getCurrentMonth()
      }
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <input 
          type="text" 
          value={formData.category} 
          onChange={(e) => setFormData({...formData, category: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="e.g. Food, Transport" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Monthly Limit ($)</label>
        <input 
          type="number" 
          step="10" 
          value={formData.limit} 
          onChange={(e) => setFormData({...formData, limit: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="e.g. 400" 
          required 
        />
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
          className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Add Budget
        </button>
      </div>
    </div>
  );
};