import type { FC, Dispatch } from 'react';
import { useState } from 'react';
import type { AppAction } from '../types/budget';

interface AddGoalFormProps {
  dispatch: Dispatch<AppAction>;
  closeModal: () => void;
}

export const AddGoalForm: FC<AddGoalFormProps> = ({ dispatch, closeModal }) => {
  const [formData, setFormData] = useState({ name: '', target: '', deadline: '' });

  const handleSubmit = () => {
    if (!formData.name || !formData.target || !formData.deadline) {
      alert("Please fill all fields.");
      return;
    }
    dispatch({
      type: 'ADD_SAVINGS_GOAL',
      payload: {
        name: formData.name,
        target: parseFloat(formData.target),
        current: 0,
        deadline: formData.deadline
      }
    });
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Goal Name</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="e.g. New Car, Vacation" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Target Amount ($)</label>
        <input 
          type="number" 
          step="100" 
          value={formData.target} 
          onChange={(e) => setFormData({...formData, target: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="e.g. 20000" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Deadline</label>
        <input 
          type="date" 
          value={formData.deadline} 
          onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
          className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
        >
          Add Goal
        </button>
      </div>
    </div>
  );
};