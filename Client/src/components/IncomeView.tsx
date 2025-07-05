import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, TrendingUp, Loader2 } from 'lucide-react';
import { IncomeForm } from './IncomeForm';
import { IncomeList } from './IncomeList';
import { useIncomes } from '../hooks/useIncomes';
import { useToast } from '../hooks/use-toast';
import type { Income, CreateIncomeDto, UpdateIncomeDto, IncomeFilterDto } from '../types/api';

export function IncomeView() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<IncomeFilterDto>({});
  const { incomes, loading, error, createIncome, updateIncome, deleteIncome, refresh } = useIncomes(filter);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleCreateIncome = async (data: CreateIncomeDto) => {
    try {
      await createIncome(data);
      setShowAddForm(false);
      toast({
        title: "Income Added",
        description: `Successfully added ${data.title} for $${data.amount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add income",
        variant: "destructive",
      });
    }
  };

  const handleUpdateIncome = async (data: UpdateIncomeDto) => {
    if (!editingIncome) return;
    
    try {
      await updateIncome(editingIncome.incomeId, data);
      setEditingIncome(null);
      toast({
        title: "Income Updated",
        description: `Successfully updated ${data.title}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update income",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    const income = incomes.find(i => i.incomeId === incomeId);
    if (!income) return;

    try {
      setDeletingIds(prev => [...prev, incomeId]);
      await deleteIncome(incomeId);
      toast({
        title: "Income Deleted",
        description: `Successfully deleted ${income.title}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete income",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== incomeId));
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
  };

  const handleFilterChange = (newFilter: IncomeFilterDto) => {
    setFilter(newFilter);
  };

  const calculateTotalIncome = () => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Income Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your income sources
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {/* Quick Stats */}
      {incomes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {formatCurrency(calculateTotalIncome())}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Income Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">
                {incomes.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Average Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {formatCurrency(incomes.length > 0 ? calculateTotalIncome() / incomes.length : 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income List */}
      <IncomeList
        incomes={incomes}
        loading={loading}
        error={error}
        onEdit={handleEditIncome}
        onDelete={handleDeleteIncome}
        onRefresh={refresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        deletingIds={deletingIds}
      />

      {/* Add Income Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add New Income
            </DialogTitle>
          </DialogHeader>
          <IncomeForm
            onSubmit={handleCreateIncome}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Income Dialog */}
      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Edit Income
            </DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <IncomeForm
              onSubmit={handleUpdateIncome}
              onCancel={() => setEditingIncome(null)}
              initialData={editingIncome}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}