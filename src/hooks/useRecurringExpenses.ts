import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  category_id: string | null;
  category_name: string | null;
  frequency: 'weekly' | 'monthly';
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useRecurringExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const recurringQuery = useQuery({
    queryKey: ['recurring-expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .order('next_due_date');
      
      if (error) throw error;
      return data as RecurringExpense[];
    },
    enabled: !!user,
  });

  const addRecurringMutation = useMutation({
    mutationFn: async ({ 
      name, 
      amount, 
      currency,
      categoryName, 
      frequency, 
      nextDueDate 
    }: { 
      name: string; 
      amount: number;
      currency?: string;
      categoryName?: string; 
      frequency: 'weekly' | 'monthly'; 
      nextDueDate: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert({
          user_id: user.id,
          name,
          amount,
          currency: currency || 'INR',
          category_name: categoryName,
          frequency,
          next_due_date: nextDueDate,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      toast.success('Recurring expense added');
    },
    onError: () => {
      toast.error('Failed to add recurring expense');
    },
  });

  const updateRecurringMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringExpense> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      toast.success('Recurring expense updated');
    },
    onError: () => {
      toast.error('Failed to update recurring expense');
    },
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      toast.success('Recurring expense deleted');
    },
    onError: () => {
      toast.error('Failed to delete recurring expense');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
      toast.success(data.is_active ? 'Recurring expense activated' : 'Recurring expense paused');
    },
    onError: () => {
      toast.error('Failed to update recurring expense');
    },
  });

  return {
    recurringExpenses: recurringQuery.data || [],
    isLoading: recurringQuery.isLoading,
    error: recurringQuery.error,
    addRecurring: addRecurringMutation.mutate,
    updateRecurring: updateRecurringMutation.mutate,
    deleteRecurring: deleteRecurringMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
  };
}
