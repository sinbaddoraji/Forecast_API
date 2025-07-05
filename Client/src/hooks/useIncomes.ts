import { useState, useEffect } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { apiService } from '../services/api';
import type { Income, CreateIncomeDto, UpdateIncomeDto, IncomeFilterDto } from '../types/api';

export function useIncomes(filter?: IncomeFilterDto) {
  const { currentSpace } = useSpace();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSpace?.spaceId) return;

    const fetchIncomes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getIncomes(currentSpace.spaceId, filter);
        setIncomes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch incomes');
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [currentSpace?.spaceId, filter]);

  const createIncome = async (income: CreateIncomeDto): Promise<Income> => {
    if (!currentSpace?.spaceId) throw new Error('No space selected');
    
    const createdIncome = await apiService.createIncome(currentSpace.spaceId, income);
    setIncomes(prev => [createdIncome, ...prev]);
    return createdIncome;
  };

  const updateIncome = async (incomeId: string, income: UpdateIncomeDto): Promise<void> => {
    if (!currentSpace?.spaceId) throw new Error('No space selected');
    
    await apiService.updateIncome(currentSpace.spaceId, incomeId, income);
    
    // Refresh the list
    const data = await apiService.getIncomes(currentSpace.spaceId, filter);
    setIncomes(data);
  };

  const deleteIncome = async (incomeId: string): Promise<void> => {
    if (!currentSpace?.spaceId) throw new Error('No space selected');
    
    await apiService.deleteIncome(currentSpace.spaceId, incomeId);
    setIncomes(prev => prev.filter(income => income.incomeId !== incomeId));
  };

  const refresh = async () => {
    if (!currentSpace?.spaceId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getIncomes(currentSpace.spaceId, filter);
      setIncomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh incomes');
    } finally {
      setLoading(false);
    }
  };

  return {
    incomes,
    loading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    refresh
  };
}

export function useIncome(incomeId: string) {
  const { currentSpace } = useSpace();
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSpace?.spaceId || !incomeId) return;

    const fetchIncome = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getIncome(currentSpace.spaceId, incomeId);
        setIncome(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch income');
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [currentSpace?.spaceId, incomeId]);

  return { income, loading, error };
}

export function useRecentIncomes(limit: number = 10) {
  const { currentSpace } = useSpace();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSpace?.spaceId) return;

    const fetchRecentIncomes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getRecentIncomes(currentSpace.spaceId, limit);
        setIncomes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent incomes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentIncomes();
  }, [currentSpace?.spaceId, limit]);

  return { incomes, loading, error };
}

export function useIncomeSummary(startDate?: Date, endDate?: Date, period: string = 'monthly') {
  const { currentSpace } = useSpace();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSpace?.spaceId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getIncomeSummary(currentSpace.spaceId, startDate, endDate, period);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch income summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [currentSpace?.spaceId, startDate, endDate, period]);

  return { summary, loading, error };
}

export function useIncomeForm(initialData?: Partial<CreateIncomeDto>) {
  const [formData, setFormData] = useState<CreateIncomeDto>({
    accountId: initialData?.accountId || '',
    title: initialData?.title || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date(),
    notes: initialData?.notes || ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateIncomeDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: keyof CreateIncomeDto, value: any): string | undefined => {
    switch (field) {
      case 'accountId':
        return !value ? 'Account is required' : undefined;
      case 'title':
        return !value.trim() ? 'Title is required' : 
               value.trim().length > 100 ? 'Title must be 100 characters or less' : undefined;
      case 'amount':
        return !value || value <= 0 ? 'Amount must be greater than 0' : undefined;
      case 'date':
        return !value ? 'Date is required' : undefined;
      case 'notes':
        return value && value.length > 500 ? 'Notes must be 500 characters or less' : undefined;
      default:
        return undefined;
    }
  };

  const updateField = (field: keyof CreateIncomeDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateIncomeDto, string>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof CreateIncomeDto>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const submitForm = async (onSubmit: (data: CreateIncomeDto) => Promise<void>) => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: initialData?.accountId || '',
      title: initialData?.title || '',
      amount: initialData?.amount || 0,
      date: initialData?.date || new Date(),
      notes: initialData?.notes || ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    submitForm,
    resetForm
  };
}