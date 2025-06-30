import React from 'react';
import { CreditCard, Wallet, PiggyBank, Banknote, TrendingUp, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import type { Account } from '../types/api';

interface AccountCardProps {
  account: Account;
  showBalance: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onViewTransactions: (account: Account) => void;
}

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'CreditCard':
      return CreditCard;
    case 'Savings':
      return PiggyBank;
    case 'Cash':
      return Banknote;
    case 'Investment':
      return TrendingUp;
    default:
      return Wallet;
  }
};

const getAccountTypeLabel = (type: string) => {
  switch (type) {
    case 'CreditCard':
      return 'Credit Card';
    case 'Savings':
      return 'Savings';
    case 'Cash':
      return 'Cash';
    case 'Investment':
      return 'Investment';
    case 'Checking':
      return 'Checking';
    default:
      return 'Other';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  showBalance,
  onEdit,
  onDelete,
  onViewTransactions
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const IconComponent = getAccountIcon(account.type);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(account);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(account);
  };

  const handleViewTransactions = () => {
    setShowMenu(false);
    onViewTransactions(account);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{account.name}</h3>
            <p className="text-sm text-gray-500">{getAccountTypeLabel(account.type)}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]">
                <button
                  onClick={handleViewTransactions}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Transactions</span>
                </button>
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Current Balance</span>
          <span className="font-semibold text-lg">
            {showBalance ? formatCurrency(account.currentBalance) : '****'}
          </span>
        </div>
        
        {account.startingBalance !== account.currentBalance && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Starting Balance</span>
            <span className="text-sm text-gray-600">
              {showBalance ? formatCurrency(account.startingBalance) : '****'}
            </span>
          </div>
        )}

        {account.startingBalance !== account.currentBalance && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Change</span>
            <span className={`text-sm font-medium ${
              account.currentBalance >= account.startingBalance ? 'text-green-600' : 'text-red-600'
            }`}>
              {showBalance && (
                <>
                  {account.currentBalance >= account.startingBalance ? '+' : ''}
                  {formatCurrency(account.currentBalance - account.startingBalance)}
                </>
              )}
              {!showBalance && '****'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Last updated {new Date(account.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};