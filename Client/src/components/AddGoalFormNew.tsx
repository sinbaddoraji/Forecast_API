import { type FC, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface AddGoalFormNewProps {
  closeModal: () => void;
}

export const AddGoalFormNew: FC<AddGoalFormNewProps> = ({ closeModal }) => {
  const { currentSpace } = useSpace();
  const { refetch: refetchGoals } = useSavingsGoals();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!currentSpace) {
      alert("No space selected");
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        targetDate: new Date(formData.targetDate)
      };

      await apiService.createSavingsGoal(currentSpace.spaceId, goalData);
      await refetchGoals();
      closeModal();
    } catch (error) {
      console.error('Error creating savings goal:', error);
      alert('Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Goal Name *</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="e.g., Emergency Fund, Vacation"
          required 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Target Amount *</label>
        <input 
          type="number" 
          step="0.01" 
          value={formData.targetAmount} 
          onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="0.00"
          required 
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target Date *</label>
        <input 
          type="date" 
          value={formData.targetDate} 
          onChange={(e) => setFormData({...formData, targetDate: e.target.value})} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          required 
          disabled={loading}
          min={new Date().toISOString().split('T')[0]}
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
            'Create Goal'
          )}
        </button>
      </div>
    </div>
  );
};