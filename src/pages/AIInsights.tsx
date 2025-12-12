import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, PiggyBank, AlertCircle, Lightbulb } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

export default function AIInsights() {
  const { profile } = useAuth();
  const { expenses, getMonthlyStats, getCategorySpending, isLoading: expensesLoading } = useExpenses();
  const { budget, isLoading: budgetLoading } = useBudget();
  const { goals: savingsGoals, isLoading: savingsLoading } = useSavingsGoals();

  const currency = profile?.preferred_currency || 'INR';
  const symbol = getCurrencySymbol(currency);
  const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'there';
  
  const { totalSpent } = getMonthlyStats();
  const monthlyBudget = budget?.monthly_budget || 50000;
  const categorySpending = getCategorySpending();
  const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  // Generate insights
  const topCategory = categorySpending[0];
  const potentialSavings = totalSpent * 0.1; // 10% potential savings
  const averageDaily = totalSpent / 30;

  const isLoading = expensesLoading || budgetLoading || savingsLoading;

  const insights = [
    {
      icon: TrendingUp,
      title: 'Top Spending Category',
      description: topCategory 
        ? `You spent ${formatCurrency(topCategory.amount, currency)} on ${topCategory.category} this month, which is ${topCategory.percentage.toFixed(0)}% of your total spending.`
        : 'Start tracking expenses to see your spending patterns.',
      type: 'info' as const,
    },
    {
      icon: AlertCircle,
      title: 'Budget Alert',
      description: percentageUsed > 80 
        ? `You've used ${percentageUsed.toFixed(0)}% of your monthly budget. Consider reducing non-essential spending.`
        : `You're doing great! You've only used ${percentageUsed.toFixed(0)}% of your budget.`,
      type: percentageUsed > 80 ? 'warning' as const : 'success' as const,
    },
    {
      icon: PiggyBank,
      title: 'Savings Opportunity',
      description: `Based on your spending patterns, you could potentially save an extra ${formatCurrency(potentialSavings, currency)} by reducing discretionary spending by 10%.`,
      type: 'tip' as const,
    },
    {
      icon: TrendingDown,
      title: 'Daily Average',
      description: `Your average daily spending is ${formatCurrency(averageDaily, currency)}. To stay within budget, try to keep it under ${formatCurrency(monthlyBudget / 30, currency)}.`,
      type: 'info' as const,
    },
    {
      icon: Lightbulb,
      title: 'Smart Tip',
      description: categorySpending.length > 0 
        ? `Consider setting a budget limit for ${categorySpending[0]?.category || 'your top category'} to better control your spending.`
        : 'Start categorizing your expenses to get personalized recommendations.',
      type: 'tip' as const,
    },
  ];

  const typeStyles = {
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
    tip: 'bg-primary/10 text-primary border-primary/20',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">AI Insights</h1>
          <p className="text-muted-foreground">Smart recommendations for {displayName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Monthly Spending</p>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSpent, currency)}</p>
          <p className="text-sm text-muted-foreground mt-1">of {formatCurrency(monthlyBudget, currency)} budget</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="stat-card text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
          <p className="text-3xl font-bold text-foreground">{expenses.length}</p>
          <p className="text-sm text-muted-foreground mt-1">this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Savings Goals</p>
          <p className="text-3xl font-bold text-foreground">{savingsGoals.length}</p>
          <p className="text-sm text-muted-foreground mt-1">active goals</p>
        </motion.div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-semibold">Personalized Insights</h2>
        
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-xl border ${typeStyles[insight.type]}`}
            >
              <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{insight.title}</h3>
                <p className="text-sm opacity-80">{insight.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      {categorySpending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stat-card"
        >
          <h2 className="text-lg font-heading font-semibold mb-4">Spending Distribution</h2>
          <div className="space-y-3">
            {categorySpending.slice(0, 5).map((cat, index) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{cat.category}</span>
                  <span className="text-sm text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: 'var(--gradient-primary)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
