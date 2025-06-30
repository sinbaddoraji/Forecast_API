import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ActivityItem {
  type: 'Expense' | 'Income';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  spaceName: string;
}

interface UserActivityData {
  recentExpenses: ActivityItem[];
  recentIncomes: ActivityItem[];
  statistics: {
    totalSpaces: number;
    totalExpenses: number;
    totalIncomes: number;
  };
}

interface UserActivityProps {
  onClose: () => void;
}

export default function UserActivity({ onClose }: UserActivityProps) {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserActivity();
  }, []);

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserActivity();
      setActivityData(data);
    } catch (err: any) {
      setError('Failed to load user activity');
      console.error('Error loading user activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Activity</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {activityData && (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-4 0H3m2-16h14a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Spaces</p>
                    <p className="text-2xl font-bold text-blue-900">{activityData.statistics.totalSpaces}</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-900">{activityData.statistics.totalExpenses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-900">{activityData.statistics.totalIncomes}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Expenses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Expenses</h3>
                <div className="space-y-3">
                  {activityData.recentExpenses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent expenses</p>
                  ) : (
                    activityData.recentExpenses.map((expense, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{expense.description}</h4>
                            <p className="text-sm text-gray-600">
                              {expense.spaceName} • {formatDate(expense.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600">-{formatCurrency(expense.amount)}</p>
                            <p className="text-xs text-gray-500">{formatDate(expense.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Income */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Income</h3>
                <div className="space-y-3">
                  {activityData.recentIncomes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent income</p>
                  ) : (
                    activityData.recentIncomes.map((income, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{income.description}</h4>
                            <p className="text-sm text-gray-600">
                              {income.spaceName} • {formatDate(income.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">+{formatCurrency(income.amount)}</p>
                            <p className="text-xs text-gray-500">{formatDate(income.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Combined */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Recent Activity</h3>
              <div className="space-y-3">
                {[...activityData.recentExpenses, ...activityData.recentIncomes]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10)
                  .map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.type === 'Expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {item.type}
                            </span>
                            <h4 className="font-medium text-gray-900">{item.description}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.spaceName} • {formatDate(item.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${item.type === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                            {item.type === 'Expense' ? '-' : '+'}{formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}