import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useExpenses';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryBudgets() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { categoryBudgets, setCategoryBudget, isLoading: budgetsLoading } = useBudget();
  const { getCategorySpending, isLoading: expensesLoading } = useExpenses();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState('');

  const categorySpending = getCategorySpending();

  const handleSetLimit = (categoryName: string) => {
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) {
      return;
    }

    setCategoryBudget({ categoryName, limit });
    setEditingCategory(null);
    setNewLimit('');
  };

  const getCategoryBudget = (categoryName: string) => {
    return categoryBudgets.find(b => b.category_name === categoryName);
  };

  const getCategorySpent = (categoryName: string) => {
    return categorySpending.find(c => c.category === categoryName)?.amount || 0;
  };

  const isLoading = categoriesLoading || budgetsLoading || expensesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Category Budgets</h1>
        <p className="text-muted-foreground">Set spending limits for each category</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const budget = getCategoryBudget(category.name);
          const spent = getCategorySpent(category.name);
          const isEditing = editingCategory === category.name;
          const percentage = budget ? (spent / budget.limit_amount) * 100 : 0;
          const isOverBudget = percentage > 100;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="stat-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: category.color ? `${category.color}20` : 'hsl(var(--primary) / 0.1)',
                    color: category.color || 'hsl(var(--primary))'
                  }}
                >
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  {budget && (
                    <p className="text-sm text-muted-foreground">
                      ₹{spent.toFixed(0)} / ₹{budget.limit_amount.toFixed(0)}
                    </p>
                  )}
                </div>
                {isOverBudget && (
                  <AlertTriangle className="w-5 h-5 text-danger" />
                )}
              </div>

              {budget && (
                <div className="mb-4">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{
                        background: isOverBudget 
                          ? 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(350 80% 55%) 100%)'
                          : percentage > 80
                            ? 'linear-gradient(135deg, hsl(45 93% 58%) 0%, hsl(35 95% 55%) 100%)'
                            : 'var(--gradient-primary)'
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="Enter limit"
                      className="pl-8"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingCategory(null);
                        setNewLimit('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSetLimit(category.name)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEditingCategory(category.name);
                    setNewLimit(budget?.limit_amount.toString() || '');
                  }}
                >
                  {budget ? 'Edit Limit' : 'Set Limit'}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
