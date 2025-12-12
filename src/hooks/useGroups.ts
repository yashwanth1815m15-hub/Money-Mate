import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    display_name: string | null;
    email: string;
  };
}

export function useGroups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get groups where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
      
      if (memberError) throw memberError;
      
      const groupIds = memberData.map(m => m.group_id);
      
      if (groupIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Group[];
    },
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });
      
      if (memberError) throw memberError;
      
      // Create notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'group',
        title: 'Group Created',
        message: `You created the group "${name}"`
      });
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Group created');
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, email }: { groupId: string; email: string }) => {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!profile) throw new Error('User not found');
      
      // Add member
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: profile.user_id,
        });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('User is already a member');
        }
        throw error;
      }
      
      // Notify the added user
      await supabase.from('notifications').insert({
        user_id: profile.user_id,
        type: 'group',
        title: 'Added to Group',
        message: `You were added to a group`
      });
      
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Member added');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Member removed');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted');
    },
    onError: () => {
      toast.error('Failed to delete group');
    },
  });

  const getGroupExpenses = async (groupId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .eq('type', 'group')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  return {
    groups: groupsQuery.data || [],
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    createGroup: createGroupMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    getGroupExpenses,
    isCreating: createGroupMutation.isPending,
  };
}
