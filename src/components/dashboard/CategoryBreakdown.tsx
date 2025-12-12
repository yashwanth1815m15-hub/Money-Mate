import { motion } from 'framer-motion';
import { useExpenses } from '@/hooks/useExpenses';

const categoryColors = [
  'hsl(160, 84%, 39%)',
  'hsl(200, 80%, 50%)',
  'hsl(45, 93%, 58%)',
  'hsl(280, 70%, 55%)',
  'hsl(340, 75%, 55%)',
  'hsl(120, 60%, 45%)',
];

export function CategoryBreakdown() {
  const { getCategorySpending } = useExpenses();
  const categories = getCategorySpending().slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Spending by Category</h3>
        <a href="/category-budgets" className="text-sm text-primary hover:underline">
          Manage
        </a>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                />
                <span className="text-sm font-medium text-foreground">{category.category}</span>
              </div>
              <span className="text-sm text-muted-foreground">₹{category.amount.toFixed(2)}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${category.percentage}%` }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
                className="h-full rounded-full"
                style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
              />
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No spending data yet
          </p>
        )}
      </div>
    </motion.div>
  );
}
