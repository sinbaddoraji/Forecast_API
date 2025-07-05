import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';
import type { 
  CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto, 
  CategoryUsageStatsDto 
} from '../types/api';

export const useCategories = () => {
  const { currentSpace } = useSpace();
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
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
  }, [currentSpace]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: CreateCategoryDto): Promise<CategoryResponseDto | null> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      const created = await apiService.createCategory(currentSpace.spaceId, category);
      await fetchCategories(); // Refresh the list
      return created;
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (categoryId: string, category: UpdateCategoryDto): Promise<void> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      await apiService.updateCategory(currentSpace.spaceId, categoryId, category);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    if (!currentSpace) throw new Error('No space selected');
    
    try {
      await apiService.deleteCategory(currentSpace.spaceId, categoryId);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      throw err;
    }
  };

  return { 
    categories, 
    loading, 
    error, 
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export const useCategory = (categoryId: string | null) => {
  const { currentSpace } = useSpace();
  const [category, setCategory] = useState<CategoryResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!currentSpace || !categoryId) {
      setCategory(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiService.getCategory(currentSpace.spaceId, categoryId);
      setCategory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, categoryId]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return { category, loading, error, refetch: fetchCategory };
};

export const useCategoryUsageStats = (startDate?: Date, endDate?: Date) => {
  const { currentSpace } = useSpace();
  const [stats, setStats] = useState<CategoryUsageStatsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!currentSpace) return;
    
    try {
      setLoading(true);
      const data = await apiService.getCategoryUsageStats(currentSpace.spaceId, startDate, endDate);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category usage stats');
    } finally {
      setLoading(false);
    }
  }, [currentSpace, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useCategoryForm = (initialCategory?: CategoryResponseDto) => {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: initialCategory?.name || '',
    color: initialCategory?.color || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCategoryDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof CreateCategoryDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CreateCategoryDto, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Color must be a valid hex color (e.g., #FF5733)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      color: ''
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

// Predefined color palette for categories
export const CATEGORY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FECA57', // Yellow
  '#FF9FF3', // Pink
  '#54A0FF', // Light Blue
  '#5F27CD', // Purple
  '#00D2D3', // Cyan
  '#FF9F43', // Orange
  '#10AC84', // Emerald
  '#EE5A24', // Dark Orange
  '#0ABDE3', // Sky Blue
  '#FD79A8', // Rose
  '#FDCB6E', // Peach
  '#6C5CE7', // Violet
  '#A29BFE', // Lavender
  '#F39C12', // Amber
  '#E84393', // Magenta
  '#00B894'  // Mint
];

export const getRandomCategoryColor = (): string => {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
};