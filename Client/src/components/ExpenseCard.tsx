import React, { useState } from 'react';
import { Calendar, User, Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { ExpenseResponseDto } from '../types/api';
import { useSpace } from '../contexts/SpaceContext';
import { formatCurrencyCompact } from '../utils/currency';

interface ExpenseCardProps {
  expense: ExpenseResponseDto;
  onEdit?: (expense: ExpenseResponseDto) => void;
  onDelete?: (expenseId: string) => void;
  showActions?: boolean;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const { currentSpace } = useSpace();
  const currency = currentSpace?.currency || 'USD';
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{expense.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formatDate(expense.date)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-red-600">
            -{formatCurrencyCompact(expense.amount, currency)}
          </span>
          
          {showActions && (onEdit || onDelete) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(expense);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(expense.expenseId);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Category:</span>
          <span className="font-medium">{expense.categoryName}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Account:</span>
          <span className="font-medium">{expense.accountName}</span>
        </div>
        
        {expense.notes && (
          <div className="text-sm">
            <span className="text-gray-500">Notes:</span>
            <p className="text-gray-700 mt-1">{expense.notes}</p>
          </div>
        )}
        
        <div className="flex items-center text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          <User className="w-3 h-3 mr-1" />
          <span>Added by {expense.addedByUserName}</span>
        </div>
      </div>
    </div>
  );
};