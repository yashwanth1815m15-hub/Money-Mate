import { motion } from 'framer-motion';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';

export function MonthlyOverview() {
  const { getMonthlyStats } = useExpenses();
  const { budget } = useBudget();

  const { totalSpent } = getMonthlyStats();
  const monthlyBudget = budget?.monthly_budget || 50000;
  const remaining = monthlyBudget - totalSpent;
  const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const isOverBudget = percentageUsed > 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="stat-card"
    >
      <h3 className="text-lg font-heading font-semibold mb-6">Monthly Overview</h3>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Budget Used</span>
            <span className="text-sm font-semibold text-foreground">
              {Math.min(percentageUsed, 100).toFixed(0)}%
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              className="progress-bar-fill"
              style={{
                background: isOverBudget 
                  ? 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(350 80% 55%) 100%)'
                  : undefined
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Budget</p>
            <p className="text-lg font-semibold text-foreground">₹{monthlyBudget.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <p className="text-lg font-semibold text-foreground">₹{totalSpent.toFixed(0)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className={`text-lg font-semibold ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
              ₹{Math.abs(remaining).toFixed(0)}
            </p>
          </div>
        </div>

        {isOverBudget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-danger/10 border border-danger/20"
          >
            <p className="text-sm text-danger font-medium">
              ⚠️ You've exceeded your monthly budget by ₹{(totalSpent - monthlyBudget).toFixed(2)}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
