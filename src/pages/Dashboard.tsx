import { Wallet, CreditCard, PiggyBank, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { MonthlyOverview } from '@/components/dashboard/MonthlyOverview';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { GroupsSummary } from '@/components/dashboard/GroupsSummary';
import { SavingsWidget } from '@/components/dashboard/SavingsWidget';
import { useFinanceStore } from '@/store/financeStore';

export default function Dashboard() {
  const { monthlyBudget, getTotalSpent, getTotalSavings, getAmountOwed } = useFinanceStore();
  const totalSpent = getTotalSpent();
  const totalSavings = getTotalSavings();
  const amountOwed = getAmountOwed();

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
          trend={{ value: 12, isPositive: false }}
          delay={0.05}
        />
        <StatCard
          title="Savings"
          value={totalSavings}
          icon={PiggyBank}
          variant="success"
          trend={{ value: 8, isPositive: true }}
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
