import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import PersonalExpenses from "@/pages/PersonalExpenses";
import Groups from "@/pages/Groups";
import RecurringExpenses from "@/pages/RecurringExpenses";
import BudgetSettings from "@/pages/BudgetSettings";
import CategoryBudgets from "@/pages/CategoryBudgets";
import SavingsGoals from "@/pages/SavingsGoals";
import AIInsights from "@/pages/AIInsights";
import CategorySettings from "@/pages/CategorySettings";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<PersonalExpenses />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/recurring" element={<RecurringExpenses />} />
            <Route path="/budget" element={<BudgetSettings />} />
            <Route path="/category-budgets" element={<CategoryBudgets />} />
            <Route path="/savings" element={<SavingsGoals />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/categories" element={<CategorySettings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
