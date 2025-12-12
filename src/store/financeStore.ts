import { create } from 'zustand';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  type: 'personal' | 'group';
  groupId?: string;
  paymentStatus: 'paid' | 'you_owe' | 'you_are_owed';
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  totalExpenses: number;
  yourShare: number;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly';
  nextDueDate: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

interface FinanceState {
  monthlyBudget: number;
  expenses: Expense[];
  groups: Group[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  categoryBudgets: CategoryBudget[];
  categories: string[];
  
  // Computed values
  getTotalSpent: () => number;
  getTotalSavings: () => number;
  getAmountOwed: () => number;
  getRecentActivity: () => Expense[];
  getCategorySpending: () => { category: string; amount: number; percentage: number }[];
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setMonthlyBudget: (amount: number) => void;
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'totalExpenses' | 'yourShare'>) => void;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  setCategoryBudget: (category: string, limit: number) => void;
}

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Others'
];

const sampleExpenses: Expense[] = [
  { id: '1', name: 'Grocery Shopping', amount: 85.50, category: 'Food & Dining', date: '2024-01-15', type: 'personal', paymentStatus: 'paid', createdAt: '2024-01-15' },
  { id: '2', name: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2024-01-14', type: 'personal', paymentStatus: 'paid', createdAt: '2024-01-14' },
  { id: '3', name: 'Uber Ride', amount: 24.00, category: 'Transportation', date: '2024-01-13', type: 'personal', paymentStatus: 'paid', createdAt: '2024-01-13' },
  { id: '4', name: 'Team Lunch', amount: 120.00, category: 'Food & Dining', date: '2024-01-12', type: 'group', groupId: '1', paymentStatus: 'you_are_owed', createdAt: '2024-01-12' },
  { id: '5', name: 'Electric Bill', amount: 95.00, category: 'Bills & Utilities', date: '2024-01-10', type: 'personal', paymentStatus: 'paid', createdAt: '2024-01-10' },
  { id: '6', name: 'New Shoes', amount: 129.99, category: 'Shopping', date: '2024-01-08', type: 'personal', paymentStatus: 'paid', createdAt: '2024-01-08' },
  { id: '7', name: 'Weekend Trip', amount: 350.00, category: 'Travel', date: '2024-01-05', type: 'group', groupId: '2', paymentStatus: 'you_owe', createdAt: '2024-01-05' },
];

const sampleGroups: Group[] = [
  { id: '1', name: 'Work Team', members: ['John', 'Sarah', 'Mike'], totalExpenses: 450, yourShare: 112.50, createdAt: '2024-01-01' },
  { id: '2', name: 'Roommates', members: ['Alex', 'Jordan'], totalExpenses: 1200, yourShare: 400, createdAt: '2024-01-01' },
];

const sampleSavingsGoals: SavingsGoal[] = [
  { id: '1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3500, createdAt: '2024-01-01' },
  { id: '2', name: 'Vacation', targetAmount: 3000, currentAmount: 1200, deadline: '2024-06-01', createdAt: '2024-01-01' },
];

const sampleCategoryBudgets: CategoryBudget[] = [
  { id: '1', category: 'Food & Dining', limit: 500, spent: 320 },
  { id: '2', category: 'Entertainment', limit: 200, spent: 156 },
  { id: '3', category: 'Transportation', limit: 300, spent: 180 },
  { id: '4', category: 'Shopping', limit: 400, spent: 380 },
];

export const useFinanceStore = create<FinanceState>((set, get) => ({
  monthlyBudget: 3500,
  expenses: sampleExpenses,
  groups: sampleGroups,
  recurringExpenses: [],
  savingsGoals: sampleSavingsGoals,
  categoryBudgets: sampleCategoryBudgets,
  categories: defaultCategories,
  
  getTotalSpent: () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return get().expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear &&
               e.paymentStatus === 'paid';
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },
  
  getTotalSavings: () => {
    return get().savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  },
  
  getAmountOwed: () => {
    return get().expenses
      .filter(e => e.paymentStatus === 'you_are_owed')
      .reduce((sum, e) => sum + e.amount, 0);
  },
  
  getRecentActivity: () => {
    return [...get().expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  },
  
  getCategorySpending: () => {
    const expenses = get().expenses.filter(e => e.paymentStatus === 'paid');
    const categoryMap = new Map<string, number>();
    
    expenses.forEach(e => {
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    });
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  },
  
  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    set(state => ({ expenses: [...state.expenses, newExpense] }));
  },
  
  updateExpense: (id, expense) => {
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e)
    }));
  },
  
  deleteExpense: (id) => {
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
  },
  
  setMonthlyBudget: (amount) => {
    set({ monthlyBudget: amount });
  },
  
  addGroup: (group) => {
    const newGroup: Group = {
      ...group,
      id: crypto.randomUUID(),
      totalExpenses: 0,
      yourShare: 0,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ groups: [...state.groups, newGroup] }));
  },
  
  addRecurringExpense: (expense) => {
    const newExpense: RecurringExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    set(state => ({ recurringExpenses: [...state.recurringExpenses, newExpense] }));
  },
  
  addSavingsGoal: (goal) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    set(state => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
  },
  
  updateSavingsGoal: (id, amount) => {
    set(state => ({
      savingsGoals: state.savingsGoals.map(g => 
        g.id === id ? { ...g, currentAmount: amount } : g
      )
    }));
  },
  
  setCategoryBudget: (category, limit) => {
    set(state => {
      const existing = state.categoryBudgets.find(b => b.category === category);
      if (existing) {
        return {
          categoryBudgets: state.categoryBudgets.map(b =>
            b.category === category ? { ...b, limit } : b
          )
        };
      }
      return {
        categoryBudgets: [...state.categoryBudgets, { id: crypto.randomUUID(), category, limit, spent: 0 }]
      };
    });
  },
}));
