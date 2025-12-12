import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
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
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
