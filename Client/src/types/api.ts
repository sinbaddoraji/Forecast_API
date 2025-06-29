export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Space {
  spaceId: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpaceMember {
  userId: string;
  spaceId: string;
  role: 'Member' | 'Owner';
  joinedAt: Date;
}

export const AccountType = {
  Checking: 'Checking',
  Savings: 'Savings',
  CreditCard: 'CreditCard',
  Cash: 'Cash',
  Investment: 'Investment',
  Other: 'Other'
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export interface Account {
  accountId: string;
  spaceId: string;
  name: string;
  type: AccountType;
  startingBalance: number;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  categoryId: string;
  spaceId: string;
  name: string;
  icon?: string;
}

export interface Expense {
  expenseId: string;
  spaceId: string;
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  categoryId?: string;
  notes?: string;
  account?: Account;
  category?: Category;
  addedByUser?: User;
}

export interface Income {
  incomeId: string;
  spaceId: string;
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  account?: Account;
  addedByUser?: User;
}

export interface Budget {
  budgetId: string;
  spaceId: string;
  categoryId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  category?: Category;
  spentAmount?: number;
}

export interface SavingsGoal {
  goalId: string;
  spaceId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}