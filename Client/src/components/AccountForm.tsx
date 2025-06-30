import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { Account, AccountType } from '../types/api';
import { AccountType as AccountTypeEnum } from '../types/api';

interface AccountFormProps {
  account?: Account;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSuccess,
  onCancel
}) => {
  const { currentSpace } = useSpace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || AccountTypeEnum.Checking,
    currentBalance: account?.currentBalance || 0,
    startingBalance: account?.startingBalance || 0
  });

  const isEditing = !!account;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSpace) {
      setError('No space selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiService.updateAccount(currentSpace.spaceId, {
          ...account,
          name: formData.name,
          type: formData.type,
          currentBalance: formData.currentBalance
        });
      } else {
        await apiService.createAccount(currentSpace.spaceId, {
          name: formData.name,
          type: formData.type,
          startingBalance: formData.startingBalance,
          currentBalance: formData.startingBalance
        });
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Account Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter account name"
          required
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Account Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value={AccountTypeEnum.Checking}>Checking Account</option>
          <option value={AccountTypeEnum.Savings}>Savings Account</option>
          <option value={AccountTypeEnum.CreditCard}>Credit Card</option>
          <option value={AccountTypeEnum.Cash}>Cash</option>
          <option value={AccountTypeEnum.Investment}>Investment Account</option>
          <option value={AccountTypeEnum.Other}>Other</option>
        </select>
      </div>

      {isEditing ? (
        <div>
          <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 mb-1">
            Current Balance
          </label>
          <input
            type="number"
            id="currentBalance"
            value={formData.currentBalance}
            onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.01"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Starting Balance: ${account?.startingBalance?.toFixed(2)}
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="startingBalance" className="block text-sm font-medium text-gray-700 mb-1">
            Starting Balance
          </label>
          <input
            type="number"
            id="startingBalance"
            value={formData.startingBalance}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setFormData({ 
                ...formData, 
                startingBalance: value,
                currentBalance: value 
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            step="0.01"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            This will also be set as your current balance
          </p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Account' : 'Create Account')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};