import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroups } from '@/hooks/useGroups';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Groups() {
  const { groups, createGroup, addMember, isLoading, isCreating } = useGroups();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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

  const handleAddMember = (groupId: string) => {
    if (!memberEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    addMember({ groupId, email: memberEmail });
    setMemberEmail('');
    setSelectedGroupId(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-lg">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.description || 'No description'}</p>
              </div>
            </div>

            {selectedGroupId === group.id ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Add member by email</Label>
                  <Input
                    placeholder="Enter email address"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedGroupId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddMember(group.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedGroupId(group.id)}
              >
                Add Member
              </Button>
            )}
          </motion.div>
        ))}

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
