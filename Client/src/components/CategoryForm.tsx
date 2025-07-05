import React from 'react';
import { Loader2, X, Palette } from 'lucide-react';
import { useCategoryForm, CATEGORY_COLORS } from '../hooks/useCategories';
import type { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from '../types/api';

interface CategoryFormProps {
  category?: CategoryResponseDto;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const {
    formData,
    errors,
    updateField,
    validateForm
  } = useCategoryForm(category);

  const isEditing = !!category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleColorSelect = (color: string) => {
    updateField('color', color);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('color', e.target.value);
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter category name"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Palette className="w-4 h-4 inline mr-1" />
            Category Color
          </label>
          
          {/* Predefined Color Palette */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Choose a color:</p>
            <div className="grid grid-cols-10 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    formData.color === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Or enter a custom hex color:</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color || '#3B82F6'}
                onChange={handleColorInputChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => updateField('color', e.target.value)}
                placeholder="#FF5733"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.color ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formData.color && (
                <button
                  type="button"
                  onClick={() => updateField('color', '')}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color}</p>
            )}
          </div>

          {/* Color Preview */}
          {formData.color && (
            <div className="mt-3 p-3 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm font-medium">{formData.name || 'Category Name'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};