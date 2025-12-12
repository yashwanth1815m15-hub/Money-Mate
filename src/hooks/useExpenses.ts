import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  converted_amount: number | null;
  category_id: string | null;
  category_name: string | null;
  subcategory: string | null;
  date: string;
  type: 'personal' | 'group';
  group_id: string | null;
  payment_status: 'paid' | 'you_owe' | 'you_are_owed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  name: string;
  amount: number;
  currency?: string;
  category_name?: string;
  subcategory?: string;
  date: string;
  type: 'personal' | 'group';
  group_id?: string;
  payment_status: 'paid' | 'you_owe' | 'you_are_owed';
  notes?: string;
}

export function useExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: CreateExpenseInput) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          user_id: user.id,
          currency: expense.currency || 'INR',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'expense',
        title: 'Expense Added',
        message: `Added ${expense.name} - ${expense.currency || 'INR'} ${expense.amount}`
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Expense added successfully');
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated');
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted');
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    },
  });

  const searchExpenses = (query: string) => {
    if (!expensesQuery.data) return [];
    const lowerQuery = query.toLowerCase();
    return expensesQuery.data.filter(e => 
      e.name.toLowerCase().includes(lowerQuery) ||
      e.category_name?.toLowerCase().includes(lowerQuery) ||
      e.notes?.toLowerCase().includes(lowerQuery)
    );
  };

  const getMonthlyStats = () => {
    if (!expensesQuery.data) return { totalSpent: 0, amountOwed: 0, amountYouOwe: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = expensesQuery.data.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    const totalSpent = monthlyExpenses
      .filter(e => e.payment_status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const amountOwed = monthlyExpenses
      .filter(e => e.payment_status === 'you_are_owed')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const amountYouOwe = monthlyExpenses
      .filter(e => e.payment_status === 'you_owe')
      .reduce((sum, e) => sum + e.amount, 0);
    
    return { totalSpent, amountOwed, amountYouOwe };
  };

  const getCategorySpending = () => {
    if (!expensesQuery.data) return [];
    
    const categoryMap = new Map<string, number>();
    
    expensesQuery.data
      .filter(e => e.payment_status === 'paid')
      .forEach(e => {
        const category = e.category_name || 'Others';
        categoryMap.set(category, (categoryMap.get(category) || 0) + e.amount);
      });
    
    const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getRecentActivity = (limit = 5) => {
    if (!expensesQuery.data) return [];
    return expensesQuery.data.slice(0, limit);
  };

  return {
    expenses: expensesQuery.data || [],
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    addExpense: addExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    isAdding: addExpenseMutation.isPending,
    searchExpenses,
    getMonthlyStats,
    getCategorySpending,
    getRecentActivity,
  };
}
