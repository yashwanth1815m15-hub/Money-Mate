import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Users,
  RefreshCw,
  Settings,
  PiggyBank,
  Target,
  Sparkles,
  Tag,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Personal Expenses', icon: Receipt, path: '/expenses' },
  { label: 'Groups', icon: Users, path: '/groups' },
  { label: 'Recurring Expenses', icon: RefreshCw, path: '/recurring' },
  { label: 'Budget Settings', icon: Settings, path: '/budget' },
  { label: 'Category Budgets', icon: Tag, path: '/category-budgets' },
  { label: 'Savings Goals', icon: Target, path: '/savings' },
  { label: 'AI Insights', icon: Sparkles, path: '/insights' },
  { label: 'Category Settings', icon: PiggyBank, path: '/categories' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-heading font-bold text-lg text-sidebar-accent-foreground whitespace-nowrap"
            >
              Money-Mate
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'sidebar-nav-item',
                    isActive && 'active'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button className="sidebar-nav-item w-full text-left">
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
