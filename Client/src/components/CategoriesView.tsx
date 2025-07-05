import React, { useState } from 'react';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { Modal } from './Modal';
import { useCategories } from '../hooks/useCategories';
import type { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from '../types/api';

export const CategoriesView: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createCategory, updateCategory, deleteCategory } = useCategories();

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: CategoryResponseDto) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleSubmitCategory = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, data as UpdateCategoryDto);
      } else {
        await createCategory(data as CreateCategoryDto);
      }
      setShowAddModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowAddModal(false);
      setEditingCategory(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryList
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          showActions={true}
        />
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        show={showAddModal}
        onClose={handleCloseModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={handleSubmitCategory}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};