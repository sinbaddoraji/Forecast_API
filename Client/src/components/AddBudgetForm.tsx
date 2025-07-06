import { type FC, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useCategories, useBudgets } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface AddBudgetFormProps {
  closeModal: () => void;
}

export const AddBudgetForm: FC<AddBudgetFormProps> = ({ closeModal }) => {
  const { currentSpace } = useSpace();
  const { categories } = useCategories();
  const { refetch: refetchBudgets } = useBudgets();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.categoryId || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!currentSpace) {
      alert("No space selected");
      return;
    }

    setLoading(true);
    try {
      const budgetData = {
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      await apiService.createBudget(currentSpace.spaceId, budgetData);
      await refetchBudgets();
      closeModal();
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select 
          value={formData.categoryId} 
          onChange={(e) => setFormData({...formData, categoryId: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={loading}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Budget Amount *</label>
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
        <label className="block text-sm font-medium mb-2">Start Date *</label>
        <input 
          type="date" 
          value={formData.startDate} 
          onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">End Date *</label>
        <input 
          type="date" 
          value={formData.endDate} 
          onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
          disabled={loading}
        />
      </div>

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
              Creating...
            </>
          ) : (
            'Create Budget'
          )}
        </button>
      </div>
    </div>
  );
};