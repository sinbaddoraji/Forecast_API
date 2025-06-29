import { useState, useReducer } from 'react';
import type { AppState, AppAction, Transaction } from '../types/budget';
import { useAuth } from '../AuthContext';
import { Modal } from './Modal';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Dashboard } from './Dashboard';
import { TransactionsView } from './TransactionsView';
import { BudgetsView } from './BudgetsView';
import { GoalsView } from './GoalsView';
import { AddTransactionForm } from './AddTransactionForm';
import { AddBudgetForm } from './AddBudgetForm';
import { AddGoalForm } from './AddGoalForm';

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const getInitialState = (user: any): AppState => ({
  user: {
    name: user?.profile?.name || user?.profile?.preferred_username || 'User',
    email: user?.profile?.email || '',
    isAuthenticated: true
  },
  wallets: [
    { id: 1, name: 'Main Checking', type: 'bank', balance: 2450.75, currency: 'USD' },
    { id: 2, name: 'Savings Account', type: 'savings', balance: 15800.00, currency: 'USD' },
    { id: 3, name: 'Cash Wallet', type: 'cash', balance: 185.50, currency: 'USD' }
  ],
  transactions: [
    { id: 1, type: 'expense', amount: 45.20, category: 'Food', description: 'Grocery shopping', date: '2025-06-28', walletId: 1 },
    { id: 2, type: 'income', amount: 3200.00, category: 'Salary', description: 'Monthly salary', date: '2025-06-25', walletId: 1 },
    { id: 3, type: 'expense', amount: 1200.00, category: 'Housing', description: 'Rent payment', date: '2025-06-01', walletId: 1 },
    { id: 4, type: 'expense', amount: 28.50, category: 'Transport', description: 'Gas station', date: '2025-06-27', walletId: 1 },
    { id: 5, type: 'expense', amount: 89.99, category: 'Shopping', description: 'Online purchase', date: '2025-06-26', walletId: 2 }
  ],
  budgets: [
    { id: 1, category: 'Food', limit: 400, spent: 245.20, month: '2025-06' },
    { id: 2, category: 'Transport', limit: 200, spent: 128.50, month: '2025-06' },
    { id: 3, category: 'Entertainment', limit: 150, spent: 45.00, month: '2025-06' },
    { id: 4, category: 'Shopping', limit: 300, spent: 189.99, month: '2025-06' }
  ],
  savingsGoals: [
    { id: 1, name: 'Emergency Fund', target: 10000, current: 5500, deadline: '2025-12-31' },
    { id: 2, name: 'Vacation', target: 3000, current: 1200, deadline: '2025-08-15' },
    { id: 3, name: 'New Laptop', target: 1500, current: 850, deadline: '2025-07-30' }
  ],
  currentView: 'dashboard',
  showBalances: true
});

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'TOGGLE_BALANCES':
      return { ...state, showBalances: !state.showBalances };
    case 'ADD_TRANSACTION': {
      const newTransaction: Transaction = {
        id: Date.now(),
        ...action.payload,
        date: new Date().toISOString().split('T')[0]
      };
      
      const updatedWallets = state.wallets.map(wallet => {
        if (wallet.id === newTransaction.walletId) {
          const balanceChange = newTransaction.type === 'income' 
            ? newTransaction.amount 
            : -newTransaction.amount;
          return { ...wallet, balance: wallet.balance + balanceChange };
        }
        return wallet;
      });

      let updatedBudgets = state.budgets;
      if (newTransaction.type === 'expense') {
          updatedBudgets = state.budgets.map(budget => {
              if (budget.category === newTransaction.category && budget.month === getCurrentMonth()) {
                  return {...budget, spent: budget.spent + newTransaction.amount};
              }
              return budget;
          });
      }

      return {
        ...state,
        transactions: [newTransaction, ...state.transactions],
        wallets: updatedWallets,
        budgets: updatedBudgets
      };
    }
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [...state.budgets, { id: Date.now(), ...action.payload }]
      };
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, { id: Date.now(), ...action.payload }]
      };
    default:
      return state;
  }
}

export default function BudgetingPWA() {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(appReducer, getInitialState(user));
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (state.currentView) {
      case 'transactions':
        return <TransactionsView transactions={state.transactions} />;
      case 'budgets':
        return <BudgetsView budgets={state.budgets} onAddBudget={() => setShowAddBudget(true)} />;
      case 'goals':
        return <GoalsView goals={state.savingsGoals} onAddGoal={() => setShowAddGoal(true)} />;
      default:
        return (
          <Dashboard 
            state={state} 
            dispatch={dispatch} 
            setShowAddTransaction={setShowAddTransaction}
            setShowAddBudget={setShowAddBudget}
            setShowAddGoal={setShowAddGoal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="flex">
        <Sidebar state={state} dispatch={dispatch} />
        
        {sidebarOpen && (
            <>
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed top-0 left-0 bottom-0 z-50 md:hidden">
                    <Sidebar state={state} dispatch={dispatch} />
                </div>
            </>
        )}

        <main className="flex-1 min-w-0">
          <Header state={state} dispatch={dispatch} setSidebarOpen={setSidebarOpen} />
          <div className="p-4 md:p-6 pb-24 md:pb-6">
            {renderView()}
          </div>
        </main>
      </div>

      <MobileNav state={state} dispatch={dispatch} onAddClick={() => setShowAddTransaction(true)}/>

      <Modal show={showAddTransaction} onClose={() => setShowAddTransaction(false)} title="Add New Transaction">
        <AddTransactionForm state={state} dispatch={dispatch} closeModal={() => setShowAddTransaction(false)} />
      </Modal>
      <Modal show={showAddBudget} onClose={() => setShowAddBudget(false)} title="Add New Budget">
        <AddBudgetForm dispatch={dispatch} closeModal={() => setShowAddBudget(false)} />
      </Modal>
      <Modal show={showAddGoal} onClose={() => setShowAddGoal(false)} title="Add New Savings Goal">
        <AddGoalForm dispatch={dispatch} closeModal={() => setShowAddGoal(false)} />
      </Modal>
    </div>
  );
}