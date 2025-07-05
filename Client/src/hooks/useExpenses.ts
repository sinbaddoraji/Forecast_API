import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { 
  ExpenseResponseDto, CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto 
} from '../types/api';

export const useExpenses = (filter?: ExpenseFilterDto) => {
  const { currentSpace } = useSpace();
  const [expenses, setExpenses] = useState<ExpenseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getExpenses(currentSpace.spaceId, filter);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, filter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (expense: CreateExpenseDto): Promise<ExpenseResponseDto | null> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      const created = await apiService.createExpense(currentSpace.spaceId, expense);
      await fetchExpenses(); // Refresh the list
      return created;
    } catch (err) {
      throw err;
    }
  };

  const updateExpense = async (expenseId: string, expense: UpdateExpenseDto): Promise<void> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      await apiService.updateExpense(currentSpace.spaceId, expenseId, expense);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const deleteExpense = async (expenseId: string): Promise<void> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      await apiService.deleteExpense(currentSpace.spaceId, expenseId);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  return { 
    expenses, 
    loading, 
    error, 
    refetch: fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  };
};

export const useExpense = (expenseId: string | null) => {
  const { currentSpace } = useSpace();
  const [expense, setExpense] = useState<ExpenseResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpense = useCallback(async () => {
    if (!currentSpace || !expenseId) {
      setExpense(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiService.getExpense(currentSpace.spaceId, expenseId);
      setExpense(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expense');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, expenseId]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  return { expense, loading, error, refetch: fetchExpense };
};

export const useRecentExpenses = (count: number = 10) => {
  const { currentSpace } = useSpace();
  const [expenses, setExpenses] = useState<ExpenseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentExpenses = useCallback(async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getRecentExpenses(currentSpace.spaceId, count);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent expenses');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, count]);

  useEffect(() => {
    fetchRecentExpenses();
  }, [fetchRecentExpenses]);

  return { expenses, loading, error, refetch: fetchRecentExpenses };
};

export const useExpensesSummary = (startDate: Date, endDate: Date) => {
  const { currentSpace } = useSpace();
  const [summaryByCategory, setSummaryByCategory] = useState<Record<string, number>>({});
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const [categoryData, totalData] = await Promise.all([
        apiService.getExpensesSummaryByCategory(currentSpace.spaceId, startDate, endDate),
        apiService.getTotalExpenses(currentSpace.spaceId, startDate, endDate)
      ]);
      setSummaryByCategory(categoryData);
      setTotalExpenses(totalData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses summary');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, startDate, endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summaryByCategory, totalExpenses, loading, error, refetch: fetchSummary };
};

export const useExpenseForm = (initialExpense?: ExpenseResponseDto) => {
  const [formData, setFormData] = useState<CreateExpenseDto>({
    accountId: initialExpense?.accountId || '',
    title: initialExpense?.title || '',
    amount: initialExpense?.amount || 0,
    date: initialExpense?.date || new Date(),
    categoryId: initialExpense?.categoryId || '',
    notes: initialExpense?.notes || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateExpenseDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof CreateExpenseDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CreateExpenseDto, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      accountId: '',
      title: '',
      amount: 0,
      date: new Date(),
      categoryId: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm
  };
};