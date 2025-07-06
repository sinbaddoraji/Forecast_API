import React, { useState } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { Modal } from './Modal';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Dashboard } from './Dashboard';
import { AccountsView } from './AccountsView';
import { TransactionsView } from './TransactionsView';
import { ExpensesView } from './ExpensesView';
import { IncomeView } from './IncomeView';
import { CategoriesView } from './CategoriesView';
import { BudgetsView } from './BudgetsView';
import { GoalsView } from './GoalsView';
import { AnalyticsView } from './AnalyticsView';
import ImportExportView from './ImportExportView';
import SettingsView from './SettingsView';
import { AddTransactionForm } from './AddTransactionForm';
import { AddBudgetForm } from './AddBudgetForm';
import { AddGoalForm } from './AddGoalForm';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      case 'accounts':
        return <AccountsView showBalances={showBalances} />;
      case 'transactions':
        return <TransactionsView onAddTransaction={() => setShowAddTransaction(true)} />;
      case 'expenses':
        return <ExpensesView />;
      case 'income':
        return <IncomeView />;
      case 'categories':
        return <CategoriesView />;
      case 'budgets':
        return <BudgetsView onAddBudget={() => setShowAddBudget(true)} />;
      case 'goals':
        return <GoalsView onAddGoal={() => setShowAddGoal(true)} />;
      case 'import-export':
        return <ImportExportView />;
      case 'settings':
        return <SettingsView />;
      case 'reports':
        return <AnalyticsView showBalances={showBalances} />;
      default:
        return (
          <Dashboard 
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
      <div className="flex h-screen">
        <Sidebar state={mockState} dispatch={mockDispatch} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed top-0 left-0 bottom-0 z-50 md:hidden">
              <Sidebar state={mockState} dispatch={mockDispatch} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            </div>
          </>
        )}

        <main className="flex-1 min-w-0">
          <Header 
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
        <AddTransactionForm closeModal={() => setShowAddTransaction(false)} />
      </Modal>
      
      <Modal show={showAddBudget} onClose={() => setShowAddBudget(false)} title="Add New Budget">
        <AddBudgetForm closeModal={() => setShowAddBudget(false)} />
      </Modal>
      
      <Modal show={showAddGoal} onClose={() => setShowAddGoal(false)} title="Add New Savings Goal">
        <AddGoalForm closeModal={() => setShowAddGoal(false)} />
      </Modal>
    </div>
  );
};

export default function BudgetingPWA() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showBalances, setShowBalances] = useState(true);

  return (
    <BudgetingPWAContent 
      currentView={currentView}
      setCurrentView={setCurrentView}
      showBalances={showBalances}
      setShowBalances={setShowBalances}
    />
  );
}