import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Users, ShoppingBag, Utensils, Car, Tv, Zap, Plane, GraduationCap, Heart } from 'lucide-react';
import { useExpenses, Expense } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment': Tv,
  'Bills & Utilities': Zap,
  'Healthcare': Heart,
  'Travel': Plane,
  'Education': GraduationCap,
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export function RecentActivity() {
  const { getRecentActivity } = useExpenses();
  const { profile } = useAuth();
  const currency = profile?.preferred_currency || 'INR';
  const recentExpenses = getRecentActivity(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">Recent Activity</h3>
        <a href="/expenses" className="text-sm text-primary hover:underline">
          View all
        </a>
      </div>

      <div className="space-y-1">
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense, index) => (
            <ActivityItem key={expense.id} expense={expense} index={index} currency={currency} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No expenses yet. Add your first expense!
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ActivityItem({ expense, index, currency }: { expense: Expense; index: number; currency: string }) {
  const Icon = categoryIcons[expense.category_name || ''] || ShoppingBag;
  const isOwed = expense.payment_status === 'you_are_owed';
  const youOwe = expense.payment_status === 'you_owe';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
      className="activity-item"
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        expense.type === 'group' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'
      )}>
        {expense.type === 'group' ? (
          <Users className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{expense.name}</p>
        <p className="text-sm text-muted-foreground">
          {expense.category_name || 'Others'} • {formatDate(expense.date)}
        </p>
      </div>

      <div className="text-right">
        <p className={cn(
          'font-semibold',
          isOwed ? 'text-success' : youOwe ? 'text-danger' : 'text-foreground'
        )}>
          {isOwed ? '+' : '-'}{formatCurrency(expense.amount, currency)}
        </p>
        {expense.payment_status !== 'paid' && (
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isOwed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}>
            {isOwed ? 'Owed to you' : 'You owe'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
