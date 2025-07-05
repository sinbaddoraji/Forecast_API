import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, DollarSign, TrendingUp } from 'lucide-react';
import type { CategoryResponseDto } from '../types/api';

interface CategoryCardProps {
  category: CategoryResponseDto;
  onEdit?: (category: CategoryResponseDto) => void;
  onDelete?: (categoryId: string) => void;
  showActions?: boolean;
  showStats?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  showActions = true,
  showStats = true
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getColorStyles = (color?: string) => {
    if (!color) {
      return {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB'
      };
    }
    
    // Convert hex to RGB for opacity
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
      borderColor: color,
      borderLeftColor: color,
      borderLeftWidth: '4px'
    };
  };

  return (
    <div 
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow relative"
      style={getColorStyles(category.color)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Color indicator */}
          {category.color && (
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
            {showStats && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {category.expenseCount} expenses
                </span>
                {category.hasBudgets && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Budgeted
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
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
                      onEdit(category);
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
                      onDelete(category.categoryId);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    disabled={category.expenseCount > 0 || category.hasBudgets}
                    title={category.expenseCount > 0 || category.hasBudgets ? 'Cannot delete category with expenses or budgets' : 'Delete category'}
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

      {showStats && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Spent:</span>
            <span className="font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(category.totalExpenses)}
            </span>
          </div>
          
          {category.expenseCount > 0 && (
            <div className="text-xs text-gray-400">
              Avg per expense: {formatCurrency(category.totalExpenses / category.expenseCount)}
            </div>
          )}
        </div>
      )}
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowMenu(false);
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}
    </div>
  );
};