import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, X, DollarSign, UserPlus, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';

interface GroupMemberWithProfile {
  id: string;
  user_id: string;
  joined_at: string;
  profile: {
    display_name: string | null;
    email: string;
  } | null;
}

interface GroupExpense {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: string;
  user_id: string;
}

interface ExpenseSplit {
  id: string;
  user_id: string;
  amount_owed: number;
  is_paid: boolean;
}

export default function Groups() {
  const { user, profile } = useAuth();
  const { groups, createGroup, addMember, isLoading, isCreating } = useGroups();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<Record<string, GroupMemberWithProfile[]>>({});
  const [groupExpenses, setGroupExpenses] = useState<Record<string, GroupExpense[]>>({});
  const [expenseSplits, setExpenseSplits] = useState<Record<string, ExpenseSplit[]>>({});
  const [isAddingMember, setIsAddingMember] = useState(false);

  const currency = profile?.preferred_currency || 'INR';

  // Fetch group members and expenses when a group is expanded
  useEffect(() => {
    if (expandedGroupId) {
      fetchGroupDetails(expandedGroupId);
    }
  }, [expandedGroupId]);

  const fetchGroupDetails = async (groupId: string) => {
    try {
      // Fetch members with profiles
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, user_id, joined_at')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch profiles for members
      if (members && members.length > 0) {
        const userIds = members.map(m => m.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const membersWithProfiles = members.map(member => ({
          ...member,
          profile: profiles?.find(p => p.user_id === member.user_id) || null
        }));

        setGroupMembers(prev => ({ ...prev, [groupId]: membersWithProfiles }));
      }

      // Fetch group expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id, name, amount, currency, date, user_id')
        .eq('group_id', groupId)
        .eq('type', 'group')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;
      setGroupExpenses(prev => ({ ...prev, [groupId]: expenses || [] }));

      // Fetch expense splits
      if (expenses && expenses.length > 0) {
        const expenseIds = expenses.map(e => e.id);
        const { data: splits, error: splitsError } = await supabase
          .from('group_expense_splits')
          .select('id, expense_id, user_id, amount_owed, is_paid')
          .in('expense_id', expenseIds);

        if (splitsError) throw splitsError;
        
        // Flatten all splits with expense_id for reference
        const allSplits = splits?.map(s => ({
          ...s,
          id: s.id
        })) || [];
        
        setExpenseSplits(prev => ({ ...prev, [groupId]: allSplits }));
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    createGroup({
      name: newGroupName,
      description: description || undefined,
    });

    setNewGroupName('');
    setDescription('');
    setIsCreatingGroup(false);
  };

  const handleAddMember = async (groupId: string) => {
    if (!memberEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setIsAddingMember(true);
    try {
      addMember({ groupId, email: memberEmail.toLowerCase().trim() });
      setMemberEmail('');
      setSelectedGroupId(null);
      // Refresh group details after adding
      setTimeout(() => fetchGroupDetails(groupId), 500);
    } finally {
      setIsAddingMember(false);
    }
  };

  const calculateGroupStats = (groupId: string) => {
    const expenses = groupExpenses[groupId] || [];
    const members = groupMembers[groupId] || [];
    const splits = expenseSplits[groupId] || [];

    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const memberCount = members.length;
    
    // Calculate what current user owes and is owed
    let youOwe = 0;
    let youAreOwed = 0;

    splits.forEach(split => {
      if (split.user_id === user?.id && !split.is_paid) {
        youOwe += Number(split.amount_owed);
      }
    });

    // Calculate what others owe you (expenses you created)
    expenses.forEach(expense => {
      if (expense.user_id === user?.id) {
        const expenseSplitsForThis = splits.filter(s => 
          groupExpenses[groupId]?.find(e => e.id === s.id) && s.user_id !== user?.id && !s.is_paid
        );
        youAreOwed += expenseSplitsForThis.reduce((sum, s) => sum + Number(s.amount_owed), 0);
      }
    });

    return { totalSpent, memberCount, youOwe, youAreOwed };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Groups</h1>
          <p className="text-muted-foreground">Split expenses with friends and family</p>
        </div>
        <Button onClick={() => setIsCreatingGroup(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Create Group Form */}
      {isCreatingGroup && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold">Create New Group</h3>
            <button onClick={() => setIsCreatingGroup(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., Roommates, Trip to Paris"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What's this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreatingGroup(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateGroup} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group, index) => {
          const isExpanded = expandedGroupId === group.id;
          const stats = calculateGroupStats(group.id);
          const members = groupMembers[group.id] || [];
          const expenses = groupExpenses[group.id] || [];

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="stat-card"
            >
              {/* Group Header */}
              <div 
                className="flex items-center gap-4 mb-4 cursor-pointer"
                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
              >
                <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.description || 'No description'}</p>
                </div>
                <ArrowRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(stats.totalSpent, currency)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Members</p>
                  <p className="text-lg font-semibold text-foreground">{stats.memberCount}</p>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-xs text-danger">You Owe</p>
                  <p className="text-lg font-semibold text-danger">
                    {formatCurrency(stats.youOwe, currency)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-xs text-success">You Are Owed</p>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrency(stats.youAreOwed, currency)}
                  </p>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-border pt-4 space-y-4"
                >
                  {/* Members List */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Members ({members.length})
                    </h4>
                    <div className="space-y-2">
                      {members.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {(member.profile?.display_name || member.profile?.email || 'U')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.profile?.display_name || member.profile?.email?.split('@')[0] || 'Unknown'}
                              {member.user_id === user?.id && <span className="text-muted-foreground ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{member.profile?.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Expenses */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Recent Expenses ({expenses.length})
                    </h4>
                    {expenses.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {expenses.slice(0, 5).map(expense => (
                          <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                            <div>
                              <p className="text-sm font-medium">{expense.name}</p>
                              <p className="text-xs text-muted-foreground">{expense.date}</p>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatCurrency(expense.amount, expense.currency || currency)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No expenses yet. Add a group expense to start splitting.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Add Member Form */}
              {selectedGroupId === group.id ? (
                <div className="space-y-3 border-t border-border pt-4 mt-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add member by email
                    </Label>
                    <Input
                      placeholder="Enter registered user's email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMember(group.id)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Note: User must have a registered account
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedGroupId(null);
                        setMemberEmail('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddMember(group.id)}
                      disabled={isAddingMember}
                    >
                      {isAddingMember ? 'Adding...' : 'Add Member'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              )}
            </motion.div>
          );
        })}

        {groups.length === 0 && !isCreatingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">Create a group to start splitting expenses</p>
            <Button onClick={() => setIsCreatingGroup(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Group
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
