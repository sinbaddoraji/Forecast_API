import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { 
  Account, Category, Expense, Income, Budget, SavingsGoal 
} from '../types/api';

export const useAccounts = () => {
  const { currentSpace } = useSpace();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getAccounts(currentSpace.spaceId);
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [currentSpace]);

  return { accounts, loading, error, refetch: fetchAccounts };
};

export const useCategories = () => {
  const { currentSpace } = useSpace();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getCategories(currentSpace.spaceId);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentSpace]);

  return { categories, loading, error, refetch: fetchCategories };
};

export const useTransactions = () => {
  const { currentSpace } = useSpace();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const [expenseData, incomeData] = await Promise.all([
        apiService.getExpenses(currentSpace.spaceId),
        apiService.getIncomes(currentSpace.spaceId)
      ]);
      setExpenses(expenseData);
      setIncomes(incomeData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentSpace]);

  return { expenses, incomes, loading, error, refetch: fetchTransactions };
};

export const useBudgets = () => {
  const { currentSpace } = useSpace();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getBudgets(currentSpace.spaceId);
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [currentSpace]);

  return { budgets, loading, error, refetch: fetchBudgets };
};

export const useSavingsGoals = () => {
  const { currentSpace } = useSpace();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getSavingsGoals(currentSpace.spaceId);
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [currentSpace]);

  return { goals, loading, error, refetch: fetchGoals };
};