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
  currency: string;
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
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponseDto {
  categoryId: string;
  spaceId: string;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  expenseCount: number;
  totalExpenses: number;
  hasBudgets: boolean;
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name: string;
  color?: string;
}

export interface CategoryUsageStatsDto {
  categoryId: string;
  name: string;
  color?: string;
  expenseCount: number;
  totalExpenses: number;
  currentMonthExpenses: number;
  hasBudgets: boolean;
  budgetAmount?: number;
  budgetRemaining?: number;
}

export interface Expense {
  expenseId: string;
  spaceId: string;
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  categoryId: string;
  notes?: string;
  account?: Account;
  category?: Category;
  addedByUser?: User;
}

export interface ExpenseResponseDto {
  expenseId: string;
  spaceId: string;
  accountId: string;
  accountName: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  addedByUserName: string;
  categoryId: string;
  categoryName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDto {
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  notes?: string;
}

export interface UpdateExpenseDto {
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string;
  notes?: string;
}

export interface ExpenseFilterDto {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  accountId?: string;
  limit?: number;
}

export interface Income {
  incomeId: string;
  spaceId: string;
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  account?: Account;
  addedByUser?: User;
}

export interface IncomeResponseDto {
  incomeId: string;
  spaceId: string;
  accountId: string;
  accountName: string;
  title: string;
  amount: number;
  date: Date;
  addedByUserId: string;
  addedByUserName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeDto {
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface UpdateIncomeDto {
  accountId: string;
  title: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface IncomeFilterDto {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
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

export const RecurrenceFrequency = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
  Quarterly: 'Quarterly',
  Yearly: 'Yearly'
} as const;

export type RecurrenceFrequency = typeof RecurrenceFrequency[keyof typeof RecurrenceFrequency];

export interface RecurringExpense {
  recurringExpenseId: string;
  spaceId: string;
  accountId: string;
  accountName: string;
  title: string;
  amount: number;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  lastGeneratedDate?: Date;
  isActive: boolean;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringIncome {
  recurringIncomeId: string;
  spaceId: string;
  accountId: string;
  accountName: string;
  title: string;
  amount: number;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  lastGeneratedDate?: Date;
  isActive: boolean;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRecurringExpenseDto {
  accountId: string;
  title: string;
  amount: number;
  categoryId?: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateRecurringExpenseDto {
  title: string;
  amount: number;
  categoryId?: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface CreateRecurringIncomeDto {
  accountId: string;
  title: string;
  amount: number;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateRecurringIncomeDto {
  title: string;
  amount: number;
  notes?: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface CreateSpaceDto {
  name: string;
  currency: string;
}

export interface UpdateSpaceDto {
  name: string;
  currency: string;
}

export interface DueRecurringExpense {
  recurringExpenseId: string;
  title: string;
  amount: number;
  accountName: string;
  categoryName?: string;
  nextDueDate: Date;
  frequency: RecurrenceFrequency;
}

export interface DueRecurringIncome {
  recurringIncomeId: string;
  title: string;
  amount: number;
  accountName: string;
  nextDueDate: Date;
  frequency: RecurrenceFrequency;
}