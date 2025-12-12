import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinanceStore } from '@/store/financeStore';
import { toast } from 'sonner';

export default function Groups() {
  const { groups, addGroup } = useFinanceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [members, setMembers] = useState<string[]>(['']);

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const validMembers = members.filter(m => m.trim());
    if (validMembers.length === 0) {
      toast.error('Please add at least one member');
      return;
    }

    addGroup({
      name: newGroupName,
      members: validMembers,
    });

    toast.success('Group created successfully!');
    setNewGroupName('');
    setMembers(['']);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Groups</h1>
          <p className="text-muted-foreground">Split expenses with friends and family</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Create Group Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold">Create New Group</h3>
            <button onClick={() => setIsCreating(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
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
              <Label>Members</Label>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Member ${index + 1} name`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                    />
                    {members.length > 1 && (
                      <button
                        onClick={() => handleRemoveMember(index)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddMember}
                className="text-sm text-primary hover:underline"
              >
                + Add another member
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateGroup}>
                Create Group
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="stat-card cursor-pointer hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.members.length + 1} members</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                <p className="font-semibold text-foreground">${group.totalExpenses.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Your Share</p>
                <p className="font-semibold text-primary">${group.yourShare.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {group.members.slice(0, 3).map((member, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {member}
                </span>
              ))}
              {group.members.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  +{group.members.length - 3} more
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {groups.length === 0 && !isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">Create a group to start splitting expenses</p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Group
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
