import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useIncomeForm } from '../hooks/useIncomes';
import type { CreateIncomeDto, UpdateIncomeDto, Income } from '../types/api';

interface IncomeFormProps {
  onSubmit: (data: CreateIncomeDto | UpdateIncomeDto) => Promise<void>;
  onCancel: () => void;
  initialData?: Income;
  isEdit?: boolean;
}

export function IncomeForm({ onSubmit, onCancel, initialData, isEdit = false }: IncomeFormProps) {
  const { accounts, loading: accountsLoading } = useAccounts();
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    submitForm,
    resetForm
  } = useIncomeForm({
    accountId: initialData?.accountId || '',
    title: initialData?.title || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date(),
    notes: initialData?.notes || ''
  });

  // Reset form when initial data changes
  useEffect(() => {
    if (initialData) {
      updateField('accountId', initialData.accountId);
      updateField('title', initialData.title);
      updateField('amount', initialData.amount);
      updateField('date', initialData.date);
      updateField('notes', initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(onSubmit);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (value: string) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      updateField('date', date);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Account Selection */}
        <div className="space-y-2">
          <Label htmlFor="accountId" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Account *
          </Label>
          <Select 
            value={formData.accountId} 
            onValueChange={(value) => updateField('accountId', value)}
            disabled={accountsLoading}
          >
            <SelectTrigger className={errors.accountId ? 'border-red-500' : ''}>
              <SelectValue placeholder={accountsLoading ? "Loading accounts..." : "Select an account"} />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.accountId} value={account.accountId}>
                  <div className="flex items-center justify-between w-full">
                    <span>{account.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {account.type} • ${account.currentBalance.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-600">{errors.accountId}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g., Salary, Freelance payment, Investment return"
            className={errors.title ? 'border-red-500' : ''}
            maxLength={100}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Amount *
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={formatDateForInput(formData.date)}
            onChange={(e) => handleDateChange(e.target.value)}
            className={errors.date ? 'border-red-500' : ''}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes (optional)
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Add any additional details about this income..."
            className={`resize-none ${errors.notes ? 'border-red-500' : ''}`}
            rows={3}
            maxLength={500}
          />
          {errors.notes && (
            <p className="text-sm text-red-600">{errors.notes}</p>
          )}
          <p className="text-xs text-gray-500">
            {(formData.notes || '').length}/500 characters
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Update Income' : 'Add Income'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        {!isEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={isSubmitting}
            className="ml-auto"
          >
            Clear Form
          </Button>
        )}
      </div>
    </form>
  );
}