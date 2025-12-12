import { Plus, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopBarProps {
  onAddExpense: () => void;
}

export function TopBar({ onAddExpense }: TopBarProps) {
  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {greeting}, Alex! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here's your financial overview
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search expenses..."
            className="pl-10 w-64 bg-secondary border-0"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <Button onClick={onAddExpense} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>
    </header>
  );
}
