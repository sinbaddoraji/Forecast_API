import { AuthService } from '../AuthService';
import type { 
  User, Space, SpaceMember, Account, Category, Expense, 
  Income, Budget, SavingsGoal 
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
    return response.json();
  }

  async getAccount(spaceId: string, accountId: string): Promise<Account> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}`);
    return response.json();
  }

  async createAccount(spaceId: string, account: Omit<Account, 'accountId' | 'spaceId' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts`, {
      method: 'POST',
      body: JSON.stringify(account),
    });
    return response.json();
  }

  async updateAccount(spaceId: string, account: Account): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${account.accountId}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  }

  async deleteAccount(spaceId: string, accountId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // Category endpoints
  async getCategories(spaceId: string): Promise<Category[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories`);
    return response.json();
  }

  async createCategory(spaceId: string, category: Omit<Category, 'categoryId' | 'spaceId'>): Promise<Category> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response.json();
  }

  async updateCategory(spaceId: string, category: Category): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${category.categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(spaceId: string, categoryId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Expense endpoints
  async getExpenses(spaceId: string): Promise<Expense[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses`);
    return response.json();
  }

  async getExpense(spaceId: string, expenseId: string): Promise<Expense> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`);
    return response.json();
  }

  async createExpense(spaceId: string, expense: Omit<Expense, 'expenseId' | 'spaceId' | 'addedByUserId'>): Promise<Expense> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return response.json();
  }

  async updateExpense(spaceId: string, expense: Expense): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expense.expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(spaceId: string, expenseId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  }

  // Income endpoints
  async getIncomes(spaceId: string): Promise<Income[]> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes`);
    return response.json();
  }

  async getIncome(spaceId: string, incomeId: string): Promise<Income> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`);
    return response.json();
  }

  async createIncome(spaceId: string, income: Omit<Income, 'incomeId' | 'spaceId' | 'addedByUserId'>): Promise<Income> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes`, {
      method: 'POST',
      body: JSON.stringify(income),
    });
    return response.json();
  }

  async updateIncome(spaceId: string, income: Income): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${income.incomeId}`, {
      method: 'PUT',
      body: JSON.stringify(income),
    });
  }

  async deleteIncome(spaceId: string, incomeId: string): Promise<void> {
    await this.fetchWithAuth(`${API_BASE_URL}/spaces/${spaceId}/incomes/${incomeId}`, {
      method: 'DELETE',
    });
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