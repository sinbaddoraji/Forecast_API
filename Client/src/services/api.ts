import { AuthService } from '../AuthService';
import type { 
  User, Space, SpaceMember, Account, Category,
  Income, Budget, SavingsGoal, ExpenseResponseDto,
  CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto,
  CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto,
  CategoryUsageStatsDto, IncomeResponseDto, CreateIncomeDto,
  UpdateIncomeDto, IncomeFilterDto
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5128/api';

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
    
    // Transform the backend response to match our Space interface (backend uses PascalCase)
    return spacesData.map((space: any) => ({
      spaceId: space.SpaceId || space.spaceId,
      name: space.Name || space.name,
      ownerId: space.OwnerId || space.ownerId,
      createdAt: new Date(space.CreatedAt || space.createdAt),
      updatedAt: new Date(space.UpdatedAt || space.updatedAt)
    }));
  }

  async getSpace(spaceId: string): Promise<Space> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}`);
    const spaceData = await response.json();
    
    // Transform the response to match our Space interface (backend uses PascalCase)
    return {
      spaceId: spaceData.SpaceId || spaceData.spaceId,
      name: spaceData.Name || spaceData.name,
      ownerId: spaceData.OwnerId || spaceData.ownerId,
      createdAt: new Date(spaceData.CreatedAt || spaceData.createdAt),
      updatedAt: new Date(spaceData.UpdatedAt || spaceData.updatedAt)
    };
  }

  async createSpace(space: Omit<Space, 'spaceId' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Space> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces`, {
      method: 'POST',
      body: JSON.stringify({ name: space.name }),
    });
    const createdSpace = await response.json();
    
    // Transform the response to match our Space interface (backend uses PascalCase)
    return {
      spaceId: createdSpace.SpaceId || createdSpace.spaceId,
      name: createdSpace.Name || createdSpace.name,
      ownerId: createdSpace.OwnerId || createdSpace.ownerId,
      createdAt: new Date(createdSpace.CreatedAt || createdSpace.createdAt),
      updatedAt: new Date(createdSpace.UpdatedAt || createdSpace.updatedAt)
    };
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
    
    // Transform the backend response to match our Account interface (backend uses PascalCase)
    return accountsData.map((account: any) => ({
      accountId: account.AccountId || account.accountId,
      spaceId: account.SpaceId || account.spaceId,
      name: account.Name || account.name,
      type: account.Type || account.type,
      startingBalance: account.StartingBalance || account.startingBalance,
      currentBalance: account.CurrentBalance || account.currentBalance,
      createdAt: new Date(account.CreatedAt || account.createdAt),
      updatedAt: new Date(account.UpdatedAt || account.updatedAt)
    }));
  }

  async getAccount(spaceId: string, accountId: string): Promise<Account> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}`);
    const accountData = await response.json();
    
    // Transform the response to match our Account interface (backend uses PascalCase)
    return {
      accountId: accountData.AccountId || accountData.accountId,
      spaceId: accountData.SpaceId || accountData.spaceId,
      name: accountData.Name || accountData.name,
      type: accountData.Type || accountData.type,
      startingBalance: accountData.StartingBalance || accountData.startingBalance,
      currentBalance: accountData.CurrentBalance || accountData.currentBalance,
      createdAt: new Date(accountData.CreatedAt || accountData.createdAt),
      updatedAt: new Date(accountData.UpdatedAt || accountData.updatedAt)
    };
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
    
    // Transform the response to match our Account interface (backend uses PascalCase)
    return {
      accountId: createdAccount.AccountId || createdAccount.accountId,
      spaceId: createdAccount.SpaceId || createdAccount.spaceId,
      name: createdAccount.Name || createdAccount.name,
      type: createdAccount.Type || createdAccount.type,
      startingBalance: createdAccount.StartingBalance || createdAccount.startingBalance,
      currentBalance: createdAccount.CurrentBalance || createdAccount.currentBalance,
      createdAt: new Date(createdAccount.CreatedAt || createdAccount.createdAt),
      updatedAt: new Date(createdAccount.UpdatedAt || createdAccount.updatedAt)
    };
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
    
    return categoriesData.map((category: any) => ({
      categoryId: category.categoryId,
      spaceId: category.spaceId,
      name: category.name,
      color: category.color,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
      expenseCount: category.expenseCount || 0,
      totalExpenses: category.totalExpenses || 0,
      hasBudgets: category.hasBudgets || false
    }));
  }

  async getCategory(spaceId: string, categoryId: string): Promise<CategoryResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${categoryId}`);
    const category = await response.json();
    
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

  async createCategory(spaceId: string, category: CreateCategoryDto): Promise<CategoryResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    const createdCategory = await response.json();
    
    return {
      categoryId: createdCategory.categoryId,
      spaceId: createdCategory.spaceId,
      name: createdCategory.name,
      color: createdCategory.color,
      createdAt: new Date(createdCategory.createdAt),
      updatedAt: new Date(createdCategory.updatedAt),
      expenseCount: createdCategory.expenseCount || 0,
      totalExpenses: createdCategory.totalExpenses || 0,
      hasBudgets: createdCategory.hasBudgets || false
    };
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
    let url = `${API_BASE_URL}/spaces/${spaceId}/categories/usage-stats`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
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
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/expense-totals?${params}`);
    return response.json();
  }

  // Expense endpoints
  async getExpenses(spaceId: string, filter?: ExpenseFilterDto): Promise<ExpenseResponseDto[]> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/expenses`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.categoryId) params.append('categoryId', filter.categoryId);
      if (filter.accountId) params.append('accountId', filter.accountId);
      if (filter.limit) params.append('limit', filter.limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    const expensesData = await response.json();
    
    return expensesData.map((expense: any) => ({
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
    }));
  }

  async getExpense(spaceId: string, expenseId: string): Promise<ExpenseResponseDto> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`);
    const expense = await response.json();
    
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

  async createExpense(spaceId: string, expense: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const createDto = {
      accountId: expense.accountId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString(),
      categoryId: expense.categoryId,
      notes: expense.notes
    };
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    
    const createdExpense = await response.json();
    return {
      expenseId: createdExpense.expenseId,
      spaceId: createdExpense.spaceId,
      accountId: createdExpense.accountId,
      accountName: createdExpense.accountName,
      title: createdExpense.title,
      amount: createdExpense.amount,
      date: new Date(createdExpense.date),
      addedByUserId: createdExpense.addedByUserId,
      addedByUserName: createdExpense.addedByUserName,
      categoryId: createdExpense.categoryId,
      categoryName: createdExpense.categoryName,
      notes: createdExpense.notes,
      createdAt: new Date(createdExpense.createdAt),
      updatedAt: new Date(createdExpense.updatedAt)
    };
  }

  async updateExpense(spaceId: string, expenseId: string, expense: UpdateExpenseDto): Promise<void> {
    const updateDto = {
      accountId: expense.accountId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString(),
      categoryId: expense.categoryId,
      notes: expense.notes
    };
    
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
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/summary/by-category?${params}`);
    return response.json();
  }

  async getTotalExpenses(spaceId: string, startDate: Date, endDate: Date): Promise<number> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/total?${params}`);
    return response.json();
  }

  async getRecentExpenses(spaceId: string, count: number = 10): Promise<ExpenseResponseDto[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/recent?count=${count}`);
    const expensesData = await response.json();
    
    return expensesData.map((expense: any) => ({
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
    }));
  }

  // Income endpoints
  async getIncomes(spaceId: string, filter?: IncomeFilterDto): Promise<Income[]> {
    let url = `${API_BASE_URL}/spaces/${spaceId}/incomes`;
    
    if (filter) {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.accountId) params.append('accountId', filter.accountId);
      if (filter.search) params.append('search', filter.search);
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.fetchWithAuth(url);
    const incomesData = await response.json();
    
    return incomesData.map((income: any) => ({
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
    }));
  }

  async getIncome(spaceId: string, incomeId: string): Promise<Income> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`);
    const income = await response.json();
    
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

  async createIncome(spaceId: string, income: CreateIncomeDto): Promise<Income> {
    const createDto = {
      accountId: income.accountId,
      title: income.title,
      amount: income.amount,
      date: income.date.toISOString(),
      notes: income.notes
    };
    
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes`, {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    
    const createdIncome = await response.json();
    return {
      incomeId: createdIncome.incomeId,
      spaceId: createdIncome.spaceId,
      accountId: createdIncome.accountId,
      title: createdIncome.title,
      amount: createdIncome.amount,
      date: new Date(createdIncome.date),
      addedByUserId: createdIncome.addedByUserId,
      notes: createdIncome.notes,
      createdAt: new Date(createdIncome.createdAt),
      updatedAt: new Date(createdIncome.updatedAt),
      account: createdIncome.account,
      addedByUser: createdIncome.addedByUser
    };
  }

  async updateIncome(spaceId: string, incomeId: string, income: UpdateIncomeDto): Promise<void> {
    const updateDto = {
      accountId: income.accountId,
      title: income.title,
      amount: income.amount,
      date: income.date.toISOString(),
      notes: income.notes
    };
    
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
    let url = `${API_BASE_URL}/spaces/${spaceId}/incomes/summary`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (period) params.append('period', period);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async getRecentIncomes(spaceId: string, limit: number = 10): Promise<Income[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/recent?limit=${limit}`);
    const incomesData = await response.json();
    
    return incomesData.map((income: any) => ({
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
    }));
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
}

export const apiService = new ApiService();