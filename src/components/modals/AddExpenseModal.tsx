import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceStore } from '@/store/financeStore';
import { toast } from 'sonner';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { categories, groups, addExpense } = useFinanceStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'personal' | 'group'>('personal');
  const [groupId, setGroupId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'you_owe' | 'you_are_owed'>('paid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addExpense({
      name,
      amount: parseFloat(amount),
      category,
      date,
      type,
      groupId: type === 'group' ? groupId : undefined,
      paymentStatus,
    });

    toast.success('Expense added successfully!');
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setType('personal');
    setGroupId('');
    setPaymentStatus('paid');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-heading font-semibold">Add New Expense</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
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
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                        ? 'border-primary bg-primary-muted text-primary' 
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
                        ? 'border-primary bg-primary-muted text-primary' 
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
                <Button type="submit" className="flex-1">
                  Add Expense
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
