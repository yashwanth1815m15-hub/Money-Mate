import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategorySettings() {
  const { categories, addCategory, deleteCategory, isLoading } = useCategories();
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }

    addCategory({ name: newCategory.trim() });
    setNewCategory('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

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
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.03 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: category.color ? `${category.color}20` : 'hsl(var(--primary) / 0.1)',
                    color: category.color || 'hsl(var(--primary))'
                  }}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <span className="font-medium text-foreground">{category.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 rounded-md hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No categories yet. Add your first category above.
            </p>
          )}
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
