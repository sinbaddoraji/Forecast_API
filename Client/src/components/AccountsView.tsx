import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import { AccountCard } from './AccountCard';
import { AccountForm } from './AccountForm';
import { Modal } from './Modal';
import type { Account } from '../types/api';
import { formatCurrencyCompact } from '../utils/currency';

interface AccountsViewProps {
  showBalances: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ showBalances }) => {
  const { currentSpace } = useSpace();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);
  const [selectedAccountTransactions, setSelectedAccountTransactions] = useState<Account | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!currentSpace) return;

    try {
      setLoading(true);
      setError(null);
      const accountsData = await apiService.getAccounts(currentSpace.spaceId);
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [currentSpace]);

  useEffect(() => {
    loadAccounts();
  }, [currentSpace, loadAccounts]);

  const handleAddAccount = () => {
    setShowAddForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
  };

  const handleDeleteAccount = (account: Account) => {
    setDeleteConfirm(account);
  };

  const handleViewTransactions = (account: Account) => {
    setSelectedAccountTransactions(account);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm || !currentSpace) return;

    try {
      await apiService.deleteAccount(currentSpace.spaceId, deleteConfirm.accountId);
      setAccounts(accounts.filter(a => a.accountId !== deleteConfirm.accountId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    loadAccounts();
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.currentBalance, 0);
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyCompact(amount, currentSpace?.currency || 'USD');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600">Manage your financial accounts</p>
        </div>
        <button
          onClick={handleAddAccount}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Total Balance Summary */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Wallet className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Total Balance</h2>
          </div>
          <p className="text-3xl font-bold">
            {showBalances ? formatCurrency(calculateTotalBalance()) : '****'}
          </p>
          <p className="text-blue-100 mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-600 mb-4">Create your first account to start tracking your finances</p>
          <button
            onClick={handleAddAccount}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.accountId}
              account={account}
              showBalance={showBalances}
              onEdit={handleEditAccount}
              onDelete={handleDeleteAccount}
              onViewTransactions={handleViewTransactions}
            />
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal 
        show={showAddForm} 
        onClose={() => setShowAddForm(false)} 
        title="Add New Account"
      >
        <AccountForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Edit Account Modal */}
      <Modal 
        show={!!editingAccount} 
        onClose={() => setEditingAccount(null)} 
        title="Edit Account"
      >
        {editingAccount && (
          <AccountForm
            account={editingAccount}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditingAccount(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Delete Account"
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? 
              This action cannot be undone and will remove all associated transactions.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Account Transactions Modal - Placeholder for now */}
      <Modal 
        show={!!selectedAccountTransactions} 
        onClose={() => setSelectedAccountTransactions(null)} 
        title={`${selectedAccountTransactions?.name} Transactions`}
      >
        {selectedAccountTransactions && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Transaction history for <strong>{selectedAccountTransactions.name}</strong> will be displayed here.
            </p>
            <p className="text-sm text-gray-500">
              This feature will be implemented when transaction management is added.
            </p>
            <button
              onClick={() => setSelectedAccountTransactions(null)}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};