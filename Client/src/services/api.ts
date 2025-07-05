import { AuthService } from '../AuthService';
import type { 
  User, Space, SpaceMember, Account,
  Income, Budget, SavingsGoal, ExpenseResponseDto,
  CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto,
  CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto,
  CategoryUsageStatsDto, CreateIncomeDto,
  UpdateIncomeDto, IncomeFilterDto
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128/api';

// Utility functions for data transformation and URL building
class ApiHelpers {
  static transformPascalToCamel<T>(obj: any): T {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.transformPascalToCamel(item)) as T;
    }
    
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      transformed[camelKey] = value;
    }
    return transformed as T;
  }

  static transformSpace(space: any): Space {
    return {
      spaceId: space.SpaceId || space.spaceId,
      name: space.Name || space.name,
      ownerId: space.OwnerId || space.ownerId,
      createdAt: new Date(space.CreatedAt || space.createdAt),
      updatedAt: new Date(space.UpdatedAt || space.updatedAt)
    };
  }

  static transformAccount(account: any): Account {
    return {
      accountId: account.AccountId || account.accountId,
      spaceId: account.SpaceId || account.spaceId,
      name: account.Name || account.name,
      type: account.Type || account.type,
      startingBalance: account.StartingBalance || account.startingBalance,
      currentBalance: account.CurrentBalance || account.currentBalance,
      createdAt: new Date(account.CreatedAt || account.createdAt),
      updatedAt: new Date(account.UpdatedAt || account.updatedAt)
    };
  }

  static transformCategoryResponse(category: any): CategoryResponseDto {
    return {
      categoryId: category.categoryId,
      spaceId: category.spaceId,
      name: category.name,
      color: category.color,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
      expenseCount: category.expenseCount || 0,
      totalExpenses: category.totalExpenses || 0,
      hasBudgets: category.hasBudgets || false
    };
  }

  static transformExpenseResponse(expense: any): ExpenseResponseDto {
    return {
      expenseId: expense.expenseId,
      spaceId: expense.spaceId,
      accountId: expense.accountId,
      accountName: expense.accountName,
      title: expense.title,
      amount: expense.amount,
      date: new Date(expense.date),
      addedByUserId: expense.addedByUserId,
      addedByUserName: expense.addedByUserName,
      categoryId: expense.categoryId,
      categoryName: expense.categoryName,
      notes: expense.notes,
      createdAt: new Date(expense.createdAt),
      updatedAt: new Date(expense.updatedAt)
    };
  }

  static transformIncome(income: any): Income {
    return {
      incomeId: income.incomeId,
      spaceId: income.spaceId,
      accountId: income.accountId,
      title: income.title,
      amount: income.amount,
      date: new Date(income.date),
      addedByUserId: income.addedByUserId,
      notes: income.notes,
      createdAt: new Date(income.createdAt),
      updatedAt: new Date(income.updatedAt),
      account: income.account,
      addedByUser: income.addedByUser
    };
  }

  static buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          urlParams.append(key, value.toISOString());
        } else {
          urlParams.append(key, value.toString());
        }
      }
    });
    
    return urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;
  }

  static createExpenseDto(expense: CreateExpenseDto) {
    return {
      accountId: expense.accountId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString(),
      categoryId: expense.categoryId,
      notes: expense.notes
    };
  }

  static createIncomeDto(income: CreateIncomeDto) {
    return {
      accountId: income.accountId,
      title: income.title,
      amount: income.amount,
      date: income.date.toISOString(),
      notes: income.notes
    };
  }

  static updateExpenseDto(expense: UpdateExpenseDto) {
    return {
      accountId: expense.accountId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString(),
      categoryId: expense.categoryId,
      notes: expense.notes
    };
  }

  static updateIncomeDto(income: UpdateIncomeDto) {
    return {
      accountId: income.accountId,
      title: income.title,
      amount: income.amount,
      date: income.date.toISOString(),
      notes: income.notes
    };
  }
}

class ApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await AuthService.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          console.error('API Error Details:', errorBody);
          errorMessage += ` - ${errorBody}`;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    return response;
  }

  // Auth endpoints
  async register(): Promise<User> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
    });
    return response.json();
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/me`);
    return response.json();
  }

  async updateUserProfile(profile: { firstName?: string; lastName?: string; email?: string }): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getUserSpacesDetailed(): Promise<any[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/me/spaces`);
    return response.json();
  }

  async searchUsers(email: string): Promise<any[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/search?email=${encodeURIComponent(email)}`);
    return response.json();
  }

  async deleteUserAccount(): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
    });
  }

  async getUserActivity(): Promise<any> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/users/me/activity`);
    return response.json();
  }

  // Space endpoints  
  async getUserSpaces(): Promise<Space[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces`);
    const spacesData = await response.json();
    return spacesData.map(ApiHelpers.transformSpace);
  }

  async getSpace(spaceId: string): Promise<Space> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}`);
    const spaceData = await response.json();
    return ApiHelpers.transformSpace(spaceData);
  }

  async createSpace(space: Omit<Space, 'spaceId' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Space> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces`, {
      method: 'POST',
      body: JSON.stringify({ name: space.name }),
    });
    const createdSpace = await response.json();
    return ApiHelpers.transformSpace(createdSpace);
  }

  async updateSpace(spaceId: string, space: Partial<Space>): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: 'PUT',
      body: JSON.stringify(space),
    });
  }

  async deleteSpace(spaceId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: 'DELETE',
    });
  }

  // Space member endpoints
  async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/members`);
    return response.json();
  }

  async addSpaceMember(spaceId: string, email: string, role: 'Member' | 'Owner'): Promise<SpaceMember> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    return response.json();
  }

  async updateSpaceMember(spaceId: string, userId: string, role: 'Member' | 'Owner'): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeSpaceMember(spaceId: string, userId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Account endpoints
  async getAccounts(spaceId: string): Promise<Account[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts`);
    const accountsData = await response.json();
    return accountsData.map(ApiHelpers.transformAccount);
  }

  async getAccount(spaceId: string, accountId: string): Promise<Account> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}`);
    const accountData = await response.json();
    return ApiHelpers.transformAccount(accountData);
  }

  async createAccount(spaceId: string, account: Omit<Account, 'accountId' | 'spaceId' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const createDto = {
      name: account.name,
      type: account.type,
      startingBalance: account.startingBalance
    };
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    const createdAccount = await response.json();
    return ApiHelpers.transformAccount(createdAccount);
  }

  async updateAccount(spaceId: string, account: Account): Promise<void> {
    const updateDto = {
      name: account.name,
      type: account.type,
      currentBalance: account.currentBalance
    };
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${account.accountId}`, {
      method: 'PUT',
      body: JSON.stringify(updateDto),
    });
  }

  async deleteAccount(spaceId: string, accountId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  async getAccountBalance(spaceId: string, accountId: string): Promise<{
    accountId: string;
    name: string;
    currentBalance: number;
    startingBalance: number;
    lastUpdated: string;
  }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}/balance`);
    return response.json();
  }

  async getAccountTransactions(spaceId: string, accountId: string, page: number = 1, pageSize: number = 50): Promise<{
    accountId: string;
    accountName: string;
    transactions: Array<{
      id: string;
      type: 'Expense' | 'Income';
      title: string;
      amount: number;
      date: string;
      categoryId?: string;
      notes?: string;
    }>;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}/transactions?page=${page}&pageSize=${pageSize}`);
    return response.json();
  }

  // Category endpoints
  async getCategories(spaceId: string): Promise<CategoryResponseDto[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories`);
    const categoriesData = await response.json();
    return categoriesData.map(ApiHelpers.transformCategoryResponse);
  }

  async getCategory(spaceId: string, categoryId: string): Promise<CategoryResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${categoryId}`);
    const category = await response.json();
    return ApiHelpers.transformCategoryResponse(category);
  }

  async createCategory(spaceId: string, category: CreateCategoryDto): Promise<CategoryResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    const createdCategory = await response.json();
    return ApiHelpers.transformCategoryResponse(createdCategory);
  }

  async updateCategory(spaceId: string, categoryId: string, category: UpdateCategoryDto): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(spaceId: string, categoryId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async getCategoryUsageStats(spaceId: string, startDate?: Date, endDate?: Date): Promise<CategoryUsageStatsDto[]> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/categories/usage-stats`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { startDate, endDate });
    
    const response = await this.fetchWithAuth(url);
    const statsData = await response.json();
    
    return statsData.map((stat: any) => ({
      categoryId: stat.categoryId,
      name: stat.name,
      color: stat.color,
      expenseCount: stat.expenseCount,
      totalExpenses: stat.totalExpenses,
      currentMonthExpenses: stat.currentMonthExpenses,
      hasBudgets: stat.hasBudgets,
      budgetAmount: stat.budgetAmount,
      budgetRemaining: stat.budgetRemaining
    }));
  }

  async getCategoryExpenseTotals(spaceId: string, startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/categories/expense-totals`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { startDate, endDate });
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  // Expense endpoints
  async getExpenses(spaceId: string, filter?: ExpenseFilterDto): Promise<ExpenseResponseDto[]> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/expenses`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    const expensesData = await response.json();
    return expensesData.map(ApiHelpers.transformExpenseResponse);
  }

  async getExpense(spaceId: string, expenseId: string): Promise<ExpenseResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`);
    const expense = await response.json();
    return ApiHelpers.transformExpenseResponse(expense);
  }

  async createExpense(spaceId: string, expense: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const createDto = ApiHelpers.createExpenseDto(expense);
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    
    const createdExpense = await response.json();
    return ApiHelpers.transformExpenseResponse(createdExpense);
  }

  async updateExpense(spaceId: string, expenseId: string, expense: UpdateExpenseDto): Promise<void> {
    const updateDto = ApiHelpers.updateExpenseDto(expense);
    
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updateDto),
    });
  }

  async deleteExpense(spaceId: string, expenseId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  async getExpensesSummaryByCategory(spaceId: string, startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/expenses/summary/by-category`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { startDate, endDate });
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getTotalExpenses(spaceId: string, startDate: Date, endDate: Date): Promise<number> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/expenses/total`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { startDate, endDate });
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getRecentExpenses(spaceId: string, count: number = 10): Promise<ExpenseResponseDto[]> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/expenses/recent`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { count });
    
    const response = await this.fetchWithAuth(url);
    const expensesData = await response.json();
    return expensesData.map(ApiHelpers.transformExpenseResponse);
  }

  // Income endpoints
  async getIncomes(spaceId: string, filter?: IncomeFilterDto): Promise<Income[]> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/incomes`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    const incomesData = await response.json();
    return incomesData.map(ApiHelpers.transformIncome);
  }

  async getIncome(spaceId: string, incomeId: string): Promise<Income> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`);
    const income = await response.json();
    return ApiHelpers.transformIncome(income);
  }

  async createIncome(spaceId: string, income: CreateIncomeDto): Promise<Income> {
    const createDto = ApiHelpers.createIncomeDto(income);
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes`, {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    
    const createdIncome = await response.json();
    return ApiHelpers.transformIncome(createdIncome);
  }

  async updateIncome(spaceId: string, incomeId: string, income: UpdateIncomeDto): Promise<void> {
    const updateDto = ApiHelpers.updateIncomeDto(income);
    
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateDto),
    });
  }

  async deleteIncome(spaceId: string, incomeId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`, {
      method: 'DELETE',
    });
  }

  async getIncomeSummary(spaceId: string, startDate?: Date, endDate?: Date, period: string = 'monthly'): Promise<any> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/incomes/summary`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { startDate, endDate, period });
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getRecentIncomes(spaceId: string, limit: number = 10): Promise<Income[]> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/incomes/recent`;
    const url = ApiHelpers.buildUrlWithParams(baseUrl, { limit });
    
    const response = await this.fetchWithAuth(url);
    const incomesData = await response.json();
    return incomesData.map(ApiHelpers.transformIncome);
  }

  // Budget endpoints
  async getBudgets(spaceId: string): Promise<Budget[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/budgets`);
    return response.json();
  }

  async getBudget(spaceId: string, budgetId: string): Promise<Budget> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/budgets/${budgetId}`);
    return response.json();
  }

  async createBudget(spaceId: string, budget: Omit<Budget, 'budgetId' | 'spaceId'>): Promise<Budget> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/budgets`, {
      method: 'POST',
      body: JSON.stringify(budget),
    });
    return response.json();
  }

  async updateBudget(spaceId: string, budget: Budget): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/budgets/${budget.budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  async deleteBudget(spaceId: string, budgetId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/budgets/${budgetId}`, {
      method: 'DELETE',
    });
  }

  // Savings Goal endpoints
  async getSavingsGoals(spaceId: string): Promise<SavingsGoal[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals`);
    return response.json();
  }

  async getSavingsGoal(spaceId: string, goalId: string): Promise<SavingsGoal> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals/${goalId}`);
    return response.json();
  }

  async createSavingsGoal(spaceId: string, goal: Omit<SavingsGoal, 'goalId' | 'spaceId' | 'createdAt' | 'updatedAt'>): Promise<SavingsGoal> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals`, {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return response.json();
  }

  async updateSavingsGoal(spaceId: string, goal: SavingsGoal): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals/${goal.goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  async deleteSavingsGoal(spaceId: string, goalId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals/${goalId}`, {
      method: 'DELETE',
    });
  }

  async contributeSavingsGoal(spaceId: string, goalId: string, amount: number): Promise<{ message: string; currentAmount: number }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/savingsgoals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify(amount),
    });
    return response.json();
  }

  // Analytics endpoints
  async getSpendingTrends(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
    period?: string;
    categoryId?: string;
    accountId?: string;
  }): Promise<Array<{ date: string; amount: number }>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/analytics/spending-trends`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getIncomeTrends(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
    period?: string;
    categoryId?: string;
    accountId?: string;
  }): Promise<Array<{ date: string; amount: number }>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/analytics/income-trends`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getCashFlow(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
    period?: string;
  }): Promise<Array<{ date: string; income: number; expenses: number; netFlow: number }>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/analytics/cash-flow`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getCategoryBreakdown(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    percentage: number;
  }>> {
    const baseUrl = `${API_BASE_URL}/spaces/${spaceId}/analytics/category-breakdown`;
    const url = filter ? ApiHelpers.buildUrlWithParams(baseUrl, filter) : baseUrl;
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getMonthlySummary(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{
    year: number;
    month: number;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    savingsRate: number;
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      amount: number;
      percentage: number;
    }>;
  }>> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/analytics/monthly-summary`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getBudgetPerformance(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{
    budgetId: string;
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualSpent: number;
    remaining: number;
    percentageUsed: number;
    isOverBudget: boolean;
    startDate: string;
    endDate: string;
  }>> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/analytics/budget-performance`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getNetWorth(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<Array<{
    date: string;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  }>> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/analytics/net-worth`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getFinancialProjections(spaceId: string): Promise<Array<{
    date: string;
    projectedIncome: number;
    projectedExpenses: number;
    projectedSavings: number;
    projectedNetWorth: number;
  }>> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/analytics/projections`);
    return response.json();
  }

  // Import/Export endpoints
  async importCsv(spaceId: string, file: File, options?: {
    skipFirstRow?: boolean;
    dateFormat?: string;
    columnMapping?: {
      dateColumn: number;
      descriptionColumn: number;
      amountColumn: number;
      categoryColumn: number;
      accountColumn?: number;
      notesColumn?: number;
    };
  }): Promise<{
    totalRows: number;
    successfulImports: number;
    failedImports: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.skipFirstRow !== undefined) {
      formData.append('skipFirstRow', options.skipFirstRow.toString());
    }
    
    if (options?.dateFormat) {
      formData.append('dateFormat', options.dateFormat);
    }
    
    if (options?.columnMapping) {
      Object.entries(options.columnMapping).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`columnMapping.${key}`, value.toString());
        }
      });
    }

    const token = await AuthService.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}/importexport/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async exportCsv(spaceId: string, filter?: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    accountId?: string;
    exportType?: string;
  }): Promise<Blob> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/importexport/export/csv`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.categoryId) params.append('categoryId', filter.categoryId);
      if (filter.accountId) params.append('accountId', filter.accountId);
      if (filter.exportType) params.append('exportType', filter.exportType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    return response.blob();
  }

  async exportPdfReport(spaceId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    title?: string;
    includeCharts?: boolean;
    includeBudgetAnalysis?: boolean;
    includeCategoryBreakdown?: boolean;
    includeNetWorthAnalysis?: boolean;
  }): Promise<Blob> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/importexport/export/pdf-report`;
    
    if (options) {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      if (options.title) params.append('title', options.title);
      if (options.includeCharts !== undefined) params.append('includeCharts', options.includeCharts.toString());
      if (options.includeBudgetAnalysis !== undefined) params.append('includeBudgetAnalysis', options.includeBudgetAnalysis.toString());
      if (options.includeCategoryBreakdown !== undefined) params.append('includeCategoryBreakdown', options.includeCategoryBreakdown.toString());
      if (options.includeNetWorthAnalysis !== undefined) params.append('includeNetWorthAnalysis', options.includeNetWorthAnalysis.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    return response.blob();
  }
}

export const apiService = new ApiService();