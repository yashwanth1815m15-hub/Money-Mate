import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Budget {
  id: string;
  user_id: string;
  monthly_budget: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryBudget {
  id: string;
  user_id: string;
  category_id: string | null;
  category_name: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export function useBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const budgetQuery = useQuery({
    queryKey: ['budget', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Budget | null;
    },
    enabled: !!user,
  });

  const categoryBudgetsQuery = useQuery({
    queryKey: ['category-budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .order('category_name');
      
      if (error) throw error;
      return data as CategoryBudget[];
    },
    enabled: !!user,
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ monthlyBudget, alertThreshold }: { monthlyBudget: number; alertThreshold?: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          monthly_budget: monthlyBudget,
          alert_threshold: alertThreshold || 80,
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      toast.success('Budget updated');
    },
    onError: () => {
      toast.error('Failed to update budget');
    },
  });

  const setCategoryBudgetMutation = useMutation({
    mutationFn: async ({ categoryName, limit }: { categoryName: string; limit: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if exists
      const { data: existing } = await supabase
        .from('category_budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_name', categoryName)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from('category_budgets')
          .update({ limit_amount: limit })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('category_budgets')
          .insert({
            user_id: user.id,
            category_name: categoryName,
            limit_amount: limit,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-budgets'] });
      toast.success('Category budget set');
    },
    onError: () => {
      toast.error('Failed to set category budget');
    },
  });

  const deleteCategoryBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('category_budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category-budgets'] });
      toast.success('Category budget removed');
    },
    onError: () => {
      toast.error('Failed to remove category budget');
    },
  });

  return {
    budget: budgetQuery.data,
    categoryBudgets: categoryBudgetsQuery.data || [],
    isLoading: budgetQuery.isLoading || categoryBudgetsQuery.isLoading,
    updateBudget: updateBudgetMutation.mutate,
    setCategoryBudget: setCategoryBudgetMutation.mutate,
    deleteCategoryBudget: deleteCategoryBudgetMutation.mutate,
  };
}
