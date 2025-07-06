import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, CreditCard, Calendar, FileText, DollarSign, User } from 'lucide-react';
import type { Income } from '../types/api';
import { useSpace } from '../contexts/SpaceContext';
import { formatCurrencyCompact } from '../utils/currency';

interface IncomeCardProps {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (incomeId: string) => void;
  isDeleting?: boolean;
}

export const IncomeCard: React.FC<IncomeCardProps> = ({ income, onEdit, onDelete, isDeleting = false }) => {
  const { currentSpace } = useSpace();
  const currency = currentSpace?.currency || 'USD';
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleDelete = () => {
    onDelete(income.incomeId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="group bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and Amount */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {income.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrencyCompact(income.amount, currency)}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100"
                    disabled={isDeleting}
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          onEdit(income);
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteDialog(true);
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Income Details */}
              <div className="space-y-2">
                {/* Account */}
                {income.account && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>{income.account.name}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {income.account.type}
                    </span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(income.date)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{getRelativeDate(income.date)}</span>
                </div>

                {/* Added By */}
                {income.addedByUser && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Added by {income.addedByUser.firstName} {income.addedByUser.lastName}</span>
                  </div>
                )}

                {/* Notes */}
                {income.notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p className="break-words">{income.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Created/Updated timestamp */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {income.updatedAt && new Date(income.updatedAt).getTime() !== new Date(income.createdAt).getTime() ? (
                <>Updated {getRelativeDate(income.updatedAt)}</>
              ) : (
                <>Added {getRelativeDate(income.createdAt)}</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Income</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{income.title}"? This will remove the income record 
              and adjust your account balance. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
}