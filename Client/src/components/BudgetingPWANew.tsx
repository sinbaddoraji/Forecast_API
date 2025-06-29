import React, { useState } from 'react';
import { SpaceProvider, useSpace } from '../contexts/SpaceContext';
import { Modal } from './Modal';
import { Sidebar } from './Sidebar';
import { HeaderNew } from './HeaderNew';
import { MobileNav } from './MobileNav';
import { DashboardNew } from './DashboardNew';
import { TransactionsViewNew } from './TransactionsViewNew';
import { BudgetsViewNew } from './BudgetsViewNew';
import { GoalsViewNew } from './GoalsViewNew';
import { AddTransactionFormNew } from './AddTransactionFormNew';
import { AddBudgetFormNew } from './AddBudgetFormNew';
import { AddGoalFormNew } from './AddGoalFormNew';
import { Loader2 } from 'lucide-react';

interface BudgetingPWAContentProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  showBalances: boolean;
  setShowBalances: (show: boolean) => void;
}

const BudgetingPWAContent: React.FC<BudgetingPWAContentProps> = ({
  currentView,
  setCurrentView,
  showBalances,
  setShowBalances
}) => {
  const { currentSpace, loading, error } = useSpace();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No budget space available. Please contact support.</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'transactions':
        return <TransactionsViewNew onAddTransaction={() => setShowAddTransaction(true)} />;
      case 'budgets':
        return <BudgetsViewNew onAddBudget={() => setShowAddBudget(true)} />;
      case 'goals':
        return <GoalsViewNew onAddGoal={() => setShowAddGoal(true)} />;
      default:
        return (
          <DashboardNew 
            showBalances={showBalances}
            onAddTransaction={() => setShowAddTransaction(true)}
            onAddBudget={() => setShowAddBudget(true)}
            onAddGoal={() => setShowAddGoal(true)}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  // Mock state object for compatibility with existing components
  const mockState = {
    currentView,
    showBalances,
    user: {
      name: currentSpace.name,
      email: '',
      isAuthenticated: true
    },
    wallets: [],
    transactions: [],
    budgets: [],
    savingsGoals: []
  };

  const mockDispatch = (action: any) => {
    switch (action.type) {
      case 'SET_VIEW':
        setCurrentView(action.payload);
        break;
      case 'TOGGLE_BALANCES':
        setShowBalances(!showBalances);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex">
        <Sidebar state={mockState} dispatch={mockDispatch} />
        
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed top-0 left-0 bottom-0 z-50 md:hidden">
              <Sidebar state={mockState} dispatch={mockDispatch} />
            </div>
          </>
        )}

        <main className="flex-1 min-w-0">
          <HeaderNew 
            currentView={currentView}
            showBalances={showBalances}
            onToggleBalances={() => setShowBalances(!showBalances)}
            setSidebarOpen={setSidebarOpen}
          />
          <div className="p-4 md:p-6 pb-24 md:pb-6">
            {renderView()}
          </div>
        </main>
      </div>

      <MobileNav 
        state={mockState} 
        dispatch={mockDispatch} 
        onAddClick={() => setShowAddTransaction(true)}
      />

      <Modal show={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add New Transaction">
        <AddTransactionFormNew closeModal={() => setShowAddTransaction(false)} />
      </Modal>
      
      <Modal show={showAddBudget} onClose={() => setShowAddBudget(false)} title="Add New Budget">
        <AddBudgetFormNew closeModal={() => setShowAddBudget(false)} />
      </Modal>
      
      <Modal show={showAddGoal} onClose={() => setShowAddGoal(false)} title="Add New Savings Goal">
        <AddGoalFormNew closeModal={() => setShowAddGoal(false)} />
      </Modal>
    </div>
  );
};

export default function BudgetingPWANew() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showBalances, setShowBalances] = useState(true);

  return (
    <SpaceProvider>
      <BudgetingPWAContent 
        currentView={currentView}
        setCurrentView={setCurrentView}
        showBalances={showBalances}
        setShowBalances={setShowBalances}
      />
    </SpaceProvider>
  );
}