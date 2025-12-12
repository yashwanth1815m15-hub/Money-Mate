import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceStore } from '@/store/financeStore';
import { toast } from 'sonner';

export default function RecurringExpenses() {
  const { recurringExpenses, categories, addRecurringExpense } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');

  const handleSubmit = () => {
    if (!name || !amount || !category || !nextDueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    addRecurringExpense({
      name,
      amount: parseFloat(amount),
      category,
      frequency,
      nextDueDate,
    });

    toast.success('Recurring expense added!');
    setName('');
    setAmount('');
    setCategory('');
    setNextDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Recurring Expenses</h1>
          <p className="text-muted-foreground">Manage your regular payments</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Recurring
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold">Add Recurring Expense</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Netflix, Rent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dueDate">Next Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Add Recurring Expense
            </Button>
          </div>
        </motion.div>
      )}

      {/* Recurring Expenses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurringExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold">{expense.name}</h3>
                <p className="text-sm text-muted-foreground">{expense.category}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{expense.frequency === 'monthly' ? 'Monthly' : 'Weekly'}</span>
              </div>
              <span className="font-semibold text-foreground">${expense.amount.toFixed(2)}</span>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Next due: {new Date(expense.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </motion.div>
        ))}

        {recurringExpenses.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <RefreshCw className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No recurring expenses</h3>
            <p className="text-muted-foreground mb-4">Add your regular payments to track them automatically</p>
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Recurring Expense
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
