import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetSettings() {
  const { budget, updateBudget, isLoading: budgetLoading } = useBudget();
  const { getMonthlyStats, isLoading: expensesLoading } = useExpenses();
  const { profile } = useAuth();

  const currency = profile?.preferred_currency || 'INR';
  const symbol = getCurrencySymbol(currency);
  const monthlyBudget = budget?.monthly_budget || 50000;
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const { totalSpent } = getMonthlyStats();
  const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  useEffect(() => {
    if (budget?.monthly_budget) {
      setBudgetInput(budget.monthly_budget.toString());
    }
  }, [budget?.monthly_budget]);

  const handleSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    updateBudget({ monthlyBudget: newBudget });
  };

  if (budgetLoading || expensesLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Budget Settings</h1>
        <p className="text-muted-foreground">Configure your monthly spending limits</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
        <h3 className="text-lg font-heading font-semibold mb-4">Current Month Status</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Budget</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyBudget, currency)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Spent</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent, currency)}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className={`text-2xl font-bold ${monthlyBudget - totalSpent >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(Math.abs(monthlyBudget - totalSpent), currency)}
            </p>
          </div>
        </div>
        <div className="progress-bar">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percentageUsed, 100)}%` }} transition={{ duration: 0.8 }} className="progress-bar-fill" style={{ background: percentageUsed > 100 ? 'linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(350 80% 55%) 100%)' : percentageUsed > 80 ? 'linear-gradient(135deg, hsl(45 93% 58%) 0%, hsl(35 95% 55%) 100%)' : undefined }} />
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">{percentageUsed.toFixed(0)}% of budget used</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-heading font-semibold">Monthly Budget</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Set your monthly spending limit</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{symbol}</span>
              <Input id="budget" type="number" className="pl-8 text-lg h-12" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full gap-2"><Save className="w-4 h-4" />Save Budget</Button>
        </div>
      </motion.div>

      {percentageUsed > 80 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">Budget Alert</p>
            <p className="text-sm text-muted-foreground">You've used {percentageUsed.toFixed(0)}% of your monthly budget.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
