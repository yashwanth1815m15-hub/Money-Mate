import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, X, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavingsGoals() {
  const { goals: savingsGoals, addGoal, addToGoal, deleteGoal, isLoading } = useSavingsGoals();
  const { profile } = useAuth();
  const currency = profile?.preferred_currency || 'INR';
  const symbol = getCurrencySymbol(currency);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = () => {
    if (!name || !targetAmount) {
      toast.error('Please fill in required fields');
      return;
    }

    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || undefined,
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setIsAdding(false);
  };

  const handleAddFunds = (goalId: string) => {
    const amount = prompt('How much would you like to add?');
    if (amount && !isNaN(parseFloat(amount))) {
      addToGoal({ id: goalId, amount: parseFloat(amount) });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
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
          <h1 className="text-2xl font-heading font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track your progress towards financial goals</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
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
            <h3 className="text-lg font-heading font-semibold">Create New Goal</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name *</Label>
              <Input
                id="goalName"
                placeholder="e.g., Emergency Fund, Vacation"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{symbol}</span>
                <Input
                  id="target"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deadline">Target Date (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Create Goal
            </Button>
          </div>
        </motion.div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingsGoals.map((goal, index) => {
          const progress = goal.target_amount > 0 
            ? (goal.current_amount / goal.target_amount) * 100 
            : 0;
          const remaining = goal.target_amount - goal.current_amount;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg">{goal.name}</h3>
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Target: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className="text-2xl font-bold text-primary">{progress.toFixed(0)}%</span>
              </div>

              <div className="progress-bar h-3 mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="progress-bar-fill"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Saved</p>
                  <p className="font-semibold text-foreground">{formatCurrency(goal.current_amount, currency)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Target</p>
                  <p className="font-semibold text-foreground">{formatCurrency(goal.target_amount, currency)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                  <p className="font-semibold text-primary">{formatCurrency(Math.max(remaining, 0), currency)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => handleAddFunds(goal.id)}
                >
                  <Plus className="w-4 h-4" />
                  Add Funds
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => deleteGoal(goal.id)}
                  className="text-muted-foreground hover:text-danger hover:border-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}

        {savingsGoals.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16"
          >
            <Target className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No savings goals yet</h3>
            <p className="text-muted-foreground mb-4">Start saving towards your dreams</p>
            <Button onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
