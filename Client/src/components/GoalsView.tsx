import { type FC, useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, PiggyBank, TrendingUp, TrendingDown, History, Award, Target } from 'lucide-react';
import { useSavingsGoals } from '../hooks/useApiData';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';

interface GoalsViewProps {
  onAddGoal: () => void;
}

export const GoalsView: FC<GoalsViewProps> = ({ onAddGoal }) => {
  const { currentSpace } = useSpace();
  const { goals, loading, refetch } = useSavingsGoals();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [contributing, setContributing] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<{ [key: string]: string }>({});
  const [withdrawalAmount, setWithdrawalAmount] = useState<{ [key: string]: string }>({});
  const [showHistory, setShowHistory] = useState<{ [key: string]: boolean }>({});
  const [goalHistory, setGoalHistory] = useState<{ [key: string]: any[] }>({});
  const [goalsSummary, setGoalsSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState<{ [key: string]: boolean }>({});

  if (!currentSpace) {
    return <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">No space selected</p>
    </div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>;
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    
    setDeleting(goalId);
    try {
      await apiService.deleteSavingsGoal(currentSpace.spaceId, goalId);
      await refetch();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete savings goal');
    } finally {
      setDeleting(null);
    }
  };

  const handleContribute = async (goalId: string) => {
    const amount = parseFloat(contributionAmount[goalId] || '0');
    if (amount <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }

    setContributing(goalId);
    try {
      await apiService.contributeSavingsGoal(currentSpace.spaceId, goalId, amount);
      await refetch();
      setContributionAmount({ ...contributionAmount, [goalId]: '' });
      // Refresh history if it's showing
      if (showHistory[goalId]) {
        await loadGoalHistory(goalId);
      }
    } catch (error) {
      console.error('Error contributing to goal:', error);
      alert('Failed to add contribution');
    } finally {
      setContributing(null);
    }
  };

  const handleWithdraw = async (goalId: string) => {
    const amount = parseFloat(withdrawalAmount[goalId] || '0');
    if (amount <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    const goal = goals.find(g => g.goalId === goalId);
    if (!goal || amount > goal.currentAmount) {
      alert('Insufficient funds for withdrawal');
      return;
    }

    setWithdrawing(goalId);
    try {
      await apiService.withdrawSavingsGoal(currentSpace.spaceId, goalId, amount);
      await refetch();
      setWithdrawalAmount({ ...withdrawalAmount, [goalId]: '' });
      // Refresh history if it's showing
      if (showHistory[goalId]) {
        await loadGoalHistory(goalId);
      }
    } catch (error) {
      console.error('Error withdrawing from goal:', error);
      alert('Failed to process withdrawal');
    } finally {
      setWithdrawing(null);
    }
  };

  const loadGoalHistory = async (goalId: string) => {
    setLoadingHistory({ ...loadingHistory, [goalId]: true });
    try {
      const history = await apiService.getSavingsGoalHistory(currentSpace.spaceId, goalId);
      setGoalHistory({ ...goalHistory, [goalId]: history });
    } catch (error) {
      console.error('Error loading goal history:', error);
    } finally {
      setLoadingHistory({ ...loadingHistory, [goalId]: false });
    }
  };

  const toggleHistory = async (goalId: string) => {
    const isCurrentlyShowing = showHistory[goalId];
    setShowHistory({ ...showHistory, [goalId]: !isCurrentlyShowing });
    
    if (!isCurrentlyShowing && !goalHistory[goalId]) {
      await loadGoalHistory(goalId);
    }
  };

  const loadGoalsSummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await apiService.getSavingsGoalsSummary(currentSpace.spaceId);
      setGoalsSummary(summary);
    } catch (error) {
      console.error('Error loading goals summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (currentSpace && goals.length > 0) {
      loadGoalsSummary();
    }
  }, [currentSpace, goals.length]);

  const getDaysUntilTarget = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        <button 
          onClick={onAddGoal}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Goal
        </button>
      </div>

      {/* Goals Summary Dashboard */}
      {goalsSummary && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="mr-2" size={20} />
            Goals Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{goalsSummary.totalGoals}</div>
              <div className="text-sm text-gray-600">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{goalsSummary.activeGoals}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{goalsSummary.completedGoals}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{goalsSummary.overallProgress}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Total Saved: <span className="font-semibold text-gray-900">${goalsSummary.totalCurrentAmount?.toLocaleString()}</span>
            </span>
            <span className="text-gray-600">
              Target: <span className="font-semibold text-gray-900">${goalsSummary.totalTargetAmount?.toLocaleString()}</span>
            </span>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
          <p className="text-gray-500 mb-6">Set savings targets to help you reach your financial goals.</p>
          <button 
            onClick={onAddGoal}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = percentage >= 100;
            const daysUntilTarget = getDaysUntilTarget(goal.targetDate);
            const isOverdue = daysUntilTarget < 0;
            const isDeleting = deleting === goal.goalId;
            const isContributing = contributing === goal.goalId;
            const isWithdrawing = withdrawing === goal.goalId;
            const isLoadingHistory = loadingHistory[goal.goalId];
            const history = goalHistory[goal.goalId] || [];
            const showingHistory = showHistory[goal.goalId];

            return (
              <div key={goal.goalId} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {goal.name}
                    </h3>
                    <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                      {isOverdue ? 
                        `Overdue by ${Math.abs(daysUntilTarget)} days` : 
                        `${daysUntilTarget} days remaining`
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompleted && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Completed! 🎉
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(goal.goalId)}
                      disabled={isDeleting}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Progress</span>
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">
                        ${goal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-600">
                        ${goal.targetAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Target</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-600">
                        ${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Remaining</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    {/* Contribution Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Contribution</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.01"
                          value={contributionAmount[goal.goalId] || ''}
                          onChange={(e) => setContributionAmount({ 
                            ...contributionAmount, 
                            [goal.goalId]: e.target.value 
                          })}
                          placeholder="Amount"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={isContributing}
                        />
                        <button
                          onClick={() => handleContribute(goal.goalId)}
                          disabled={isContributing || !contributionAmount[goal.goalId]}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center text-sm font-medium"
                        >
                          {isContributing ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <TrendingUp size={16} className="mr-1" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Withdrawal Section */}
                    {goal.currentAmount > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Withdraw Funds</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            max={goal.currentAmount}
                            value={withdrawalAmount[goal.goalId] || ''}
                            onChange={(e) => setWithdrawalAmount({ 
                              ...withdrawalAmount, 
                              [goal.goalId]: e.target.value 
                            })}
                            placeholder="Amount"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={isWithdrawing}
                          />
                          <button
                            onClick={() => handleWithdraw(goal.goalId)}
                            disabled={isWithdrawing || !withdrawalAmount[goal.goalId]}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center text-sm font-medium"
                          >
                            {isWithdrawing ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <TrendingDown size={16} className="mr-1" />
                                Withdraw
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Available: ${goal.currentAmount.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* History Toggle */}
                    <div>
                      <button
                        onClick={() => toggleHistory(goal.goalId)}
                        className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <History size={16} className="mr-2" />
                        {showingHistory ? 'Hide History' : 'Show History'}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>

                  {/* Transaction History */}
                  {showingHistory && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction History</h4>
                      {isLoadingHistory ? (
                        <div className="flex justify-center py-4">
                          <Loader2 size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No transactions yet</p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {history.map((transaction: any) => (
                            <div key={transaction.transactionId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                {transaction.type === 'Contribution' ? (
                                  <TrendingUp size={16} className="text-green-600" />
                                ) : (
                                  <TrendingDown size={16} className="text-red-600" />
                                )}
                                <span className="text-sm font-medium">
                                  {transaction.type === 'Contribution' ? '+' : '-'}${transaction.amount.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};