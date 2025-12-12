import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getCurrencySymbol } from '@/lib/currency';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = [
  { value: 'INR', label: '₹ INR', symbol: '₹' },
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
];

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { addExpense, isAdding } = useExpenses();
  const { categories } = useCategories();
  const { groups } = useGroups();
  const { profile } = useAuth();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(profile?.preferred_currency || 'INR');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'personal' | 'group'>('personal');
  const [groupId, setGroupId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'you_owe' | 'you_are_owed'>('paid');

  // Update default currency when profile loads
  useEffect(() => {
    if (profile?.preferred_currency) {
      setCurrency(profile.preferred_currency);
    }
  }, [profile?.preferred_currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addExpense({
      name,
      amount: parseFloat(amount),
      currency,
      category_name: category,
      date,
      type,
      group_id: type === 'group' ? groupId : undefined,
      payment_status: paymentStatus,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setCurrency(profile?.preferred_currency || 'INR');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('personal');
    setGroupId('');
    setPaymentStatus('paid');
    onClose();
  };

  const selectedCurrency = currencies.find(c => c.value === currency);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[10000] pointer-events-none"
          >
            <div 
              className="w-full max-w-[480px] max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <h2 className="text-xl font-heading font-semibold">Add New Expense</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Expense Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Grocery Shopping"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                        {selectedCurrency?.symbol}
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((cur) => (
                          <SelectItem key={cur.value} value={cur.value}>
                            {cur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Expense Type</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setType('personal')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        type === 'personal' 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('group')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        type === 'group' 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Group
                    </button>
                  </div>
                </div>

                {/* Group Selection */}
                {type === 'group' && (
                  <div className="space-y-2">
                    <Label>Select Group</Label>
                    <Select value={groupId} onValueChange={setGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Payment Status */}
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as typeof paymentStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="you_owe">You Owe</SelectItem>
                      <SelectItem value="you_are_owed">You Are Owed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add Expense'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
