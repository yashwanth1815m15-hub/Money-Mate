import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/store/financeStore';
import { toast } from 'sonner';

export default function CategorySettings() {
  const { categories } = useFinanceStore();
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    // In a real app, this would update the store
    toast.success('Category added! (Demo only - connect to backend to persist)');
    setNewCategory('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold">Category Settings</h1>
        <p className="text-muted-foreground">Manage your expense categories</p>
      </div>

      {/* Add New Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card"
      >
        <h3 className="text-lg font-heading font-semibold mb-4">Add New Category</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </motion.div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card"
      >
        <h3 className="text-lg font-heading font-semibold mb-4">Your Categories</h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="font-medium text-foreground">{category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-md hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-md hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-lg bg-info/10 border border-info/20"
      >
        <p className="text-sm text-info">
          💡 Categories help you organize and track your spending. You can assign each expense to a category for better insights.
        </p>
      </motion.div>
    </div>
  );
}
