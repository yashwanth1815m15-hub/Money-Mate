import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#eab308' },
  { name: 'Transport', icon: 'car', color: '#f97316' },
  { name: 'Groceries', icon: 'shopping-cart', color: '#22c55e' },
  { name: 'Entertainment', icon: 'film', color: '#8b5cf6' },
  { name: 'Bills & Utilities', icon: 'zap', color: '#3b82f6' },
  { name: 'Health', icon: 'heart', color: '#ec4899' },
  { name: 'Education', icon: 'book', color: '#06b6d4' },
  { name: 'Investments', icon: 'trending-up', color: '#10b981' },
  { name: 'Miscellaneous', icon: 'more-horizontal', color: '#6b7280' },
];

export default function CategorySettings() {
  const { user } = useAuth();
  const { categories, addCategory, deleteCategory, isLoading } = useCategories();
  const [newCategory, setNewCategory] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      return;
    }

    addCategory({ name: newCategory.trim() });
    setNewCategory('');
  };

  const handleAddDefaultCategories = async () => {
    if (!user) return;
    
    setIsResetting(true);
    try {
      // Get existing category names
      const existingNames = categories.map(c => c.name.toLowerCase());
      
      // Filter out categories that already exist
      const newCategories = DEFAULT_CATEGORIES.filter(
        dc => !existingNames.includes(dc.name.toLowerCase())
      );

      if (newCategories.length === 0) {
        toast.info('All default categories already exist');
        return;
      }

      // Insert new categories
      const { error } = await supabase
        .from('categories')
        .insert(
          newCategories.map(cat => ({
            user_id: user.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
          }))
        );

      if (error) throw error;
      
      toast.success(`Added ${newCategories.length} default categories`);
      // Trigger refetch
      window.location.reload();
    } catch (error) {
      console.error('Error adding default categories:', error);
      toast.error('Failed to add default categories');
    } finally {
      setIsResetting(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Category Settings</h1>
          <p className="text-muted-foreground">Manage your expense categories</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleAddDefaultCategories}
          disabled={isResetting}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          Add Defaults
        </Button>
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

      {/* Default Categories Info */}
      {categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-warning/10 border border-warning/20"
        >
          <p className="text-sm text-warning font-medium mb-2">No categories found</p>
          <p className="text-sm text-muted-foreground mb-3">
            Click "Add Defaults" to add common expense categories like Food & Dining, Shopping, Transport, etc.
          </p>
          <Button 
            size="sm" 
            onClick={handleAddDefaultCategories}
            disabled={isResetting}
          >
            Add Default Categories
          </Button>
        </motion.div>
      )}

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card"
      >
        <h3 className="text-lg font-heading font-semibold mb-4">
          Your Categories ({categories.length})
        </h3>
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
              No categories yet. Add your first category above or use defaults.
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
