import { motion } from 'framer-motion';
import { Target, Plus } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

export function SavingsWidget() {
  const { goals: savingsGoals, isLoading } = useSavingsGoals();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Savings Goals</h3>
        <a href="/savings" className="text-sm text-primary hover:underline">
          Manage
        </a>
      </div>

      <div className="space-y-4">
        {savingsGoals.slice(0, 2).map((goal, index) => {
          const progress = goal.target_amount > 0 
            ? (goal.current_amount / goal.target_amount) * 100 
            : 0;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 + index * 0.05 }}
              className="p-4 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{goal.current_amount.toLocaleString()} of ₹{goal.target_amount.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--gradient-primary)' }}
                />
              </div>
            </motion.div>
          );
        })}

        {savingsGoals.length === 0 && !isLoading && (
          <div className="text-center py-6">
            <Target className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No savings goals yet</p>
          </div>
        )}

        <a
          href="/savings"
          className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Goal</span>
        </a>
      </div>
    </motion.div>
  );
}
