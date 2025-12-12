import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExpenses } from '@/hooks/useExpenses';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonalExpenses() {
  const { expenses, deleteExpense, isLoading } = useExpenses();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'group'>('all');

  const filteredExpenses = expenses
    .filter(e => filter === 'all' || e.type === filter)
    .filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Personal Expenses</h1>
          <p className="text-muted-foreground">Track and manage all your expenses</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'personal', 'group'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-medium text-foreground">{expense.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">{expense.category_name || 'Others'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      expense.type === 'personal' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-info/10 text-info'
                    )}>
                      {expense.type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      expense.payment_status === 'paid' && 'bg-success/10 text-success',
                      expense.payment_status === 'you_owe' && 'bg-danger/10 text-danger',
                      expense.payment_status === 'you_are_owed' && 'bg-warning/10 text-warning'
                    )}>
                      {expense.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-foreground">
                      {expense.currency === 'INR' ? '₹' : expense.currency === 'USD' ? '$' : '€'}
                      {expense.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1.5 rounded-md hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No expenses found</p>
            </div>
          )}
        </div>
      </motion.div>

      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
