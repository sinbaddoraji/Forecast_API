import type { ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export interface Wallet {
  id: number;
  name: string;
  type: 'bank' | 'savings' | 'cash';
  balance: number;
  currency: string;
}

export interface Transaction {
  id: number;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
  walletId: number;
}

export interface Budget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface AppState {
  user: User;
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  currentView: string;
  showBalances: boolean;
}

export type AppAction = 
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'TOGGLE_BALANCES' }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'date'> }
  | { type: 'ADD_BUDGET'; payload: Omit<Budget, 'id'> }
  | { type: 'ADD_SAVINGS_GOAL'; payload: Omit<SavingsGoal, 'id'> };

export interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}