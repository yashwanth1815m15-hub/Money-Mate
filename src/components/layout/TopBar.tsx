import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '@/hooks/useExpenses';

interface TopBarProps {
  onAddExpense: () => void;
}

export function TopBar({ onAddExpense }: TopBarProps) {
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const { expenses } = useExpenses();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const displayName = profile?.display_name || profile?.email?.split('@')[0] || 'there';

  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  // Filter expenses based on search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return expenses.filter(expense => 
      expense.name.toLowerCase().includes(query) ||
      expense.category_name?.toLowerCase().includes(query) ||
      expense.notes?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, expenses]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false);
    if (showResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showResults]);

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(e.target.value.trim().length > 0);
  };

  const handleExpenseClick = (expenseId: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate('/expenses');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {greeting}, {displayName}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here's your financial overview
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search expenses..."
            className="pl-10 w-64 bg-secondary border-0"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
          
          {/* Search Results Dropdown */}
          {showResults && filteredExpenses.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              {filteredExpenses.map((expense) => (
                <button
                  key={expense.id}
                  onClick={() => handleExpenseClick(expense.id)}
                  className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">{expense.category_name}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {expense.amount.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {showResults && searchQuery.trim() && filteredExpenses.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
              <p className="text-sm text-muted-foreground text-center">No expenses found</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <Button onClick={onAddExpense} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>
    </header>
  );
}
