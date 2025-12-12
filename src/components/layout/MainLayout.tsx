import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

export function MainLayout() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      
      <div className="flex-1 ml-20 lg:ml-[260px] transition-all duration-300">
        <TopBar onAddExpense={() => setIsAddExpenseOpen(true)} />
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <AddExpenseModal 
        isOpen={isAddExpenseOpen} 
        onClose={() => setIsAddExpenseOpen(false)} 
      />
    </div>
  );
}
