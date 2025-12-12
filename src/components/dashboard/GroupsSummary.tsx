import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';

export function GroupsSummary() {
  const { groups, isLoading } = useGroups();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Groups</h3>
        <a href="/groups" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="space-y-3">
        {groups.slice(0, 3).map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{group.name}</p>
              <p className="text-sm text-muted-foreground">
                {group.description || 'No description'}
              </p>
            </div>
          </motion.div>
        ))}

        {groups.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No groups yet</p>
            <a href="/groups" className="text-sm text-primary hover:underline mt-2 inline-block">
              Create a group
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
