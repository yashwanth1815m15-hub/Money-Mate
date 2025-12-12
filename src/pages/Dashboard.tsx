import { Wallet, CreditCard, PiggyBank, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { MonthlyOverview } from '@/components/dashboard/MonthlyOverview';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { GroupsSummary } from '@/components/dashboard/GroupsSummary';
import { SavingsWidget } from '@/components/dashboard/SavingsWidget';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { getMonthlyStats, isLoading: expensesLoading } = useExpenses();
  const { budget, isLoading: budgetLoading } = useBudget();
  const { getTotalSavings, isLoading: savingsLoading } = useSavingsGoals();

  const { totalSpent, amountOwed } = getMonthlyStats();
  const monthlyBudget = budget?.monthly_budget || 50000;
  const totalSavings = getTotalSavings();

  const isLoading = expensesLoading || budgetLoading || savingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Budget"
          value={monthlyBudget}
          icon={Wallet}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Total Spent"
          value={totalSpent}
          icon={CreditCard}
          variant="info"
          delay={0.05}
        />
        <StatCard
          title="Savings"
          value={totalSavings}
          icon={PiggyBank}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="You Are Owed"
          value={amountOwed}
          icon={Users}
          variant="warning"
          delay={0.15}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryBreakdown />
            <GroupsSummary />
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <MonthlyOverview />
          <SavingsWidget />
        </div>
      </div>
    </div>
  );
}
