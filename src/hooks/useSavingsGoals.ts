import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export function useSavingsGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  const addGoalMutation = useMutation({
    mutationFn: async ({ name, targetAmount, deadline }: { name: string; targetAmount: number; deadline?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          name,
          target_amount: targetAmount,
          current_amount: 0,
          deadline,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast.success('Savings goal created');
    },
    onError: () => {
      toast.error('Failed to create savings goal');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast.success('Savings goal updated');
    },
    onError: () => {
      toast.error('Failed to update savings goal');
    },
  });

  const addToGoalMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const goal = goalsQuery.data?.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');
      
      const newAmount = goal.current_amount + amount;
      
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      if (data.current_amount >= data.target_amount) {
        toast.success('Congratulations! You reached your savings goal!');
      } else {
        toast.success('Amount added to savings goal');
      }
    },
    onError: () => {
      toast.error('Failed to add to savings goal');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast.success('Savings goal deleted');
    },
    onError: () => {
      toast.error('Failed to delete savings goal');
    },
  });

  const getTotalSavings = () => {
    if (!goalsQuery.data) return 0;
    return goalsQuery.data.reduce((sum, g) => sum + g.current_amount, 0);
  };

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    addGoal: addGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    addToGoal: addToGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    getTotalSavings,
  };
}
