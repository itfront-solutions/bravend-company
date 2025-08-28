import { useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/auth";
import { useTenantStore } from "@/store/tenant";

// Pages
import Login from "@/pages/Login";
import NewDashboard from "@/pages/NewDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import Trails from "@/pages/Trails";
import Communities from "@/pages/Communities";
import Reports from "@/pages/Reports";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

// BusinessQuest Pages
import BusinessQuestLanding from "@/pages/businessquest/Landing";
import BusinessQuestHome from "@/pages/businessquest/Home";
import BusinessQuestDecisionPhase2 from "@/pages/businessquest/DecisionPhase2";

// ConselhoDigital Pages
import ConselhoDigitalLanding from "@/pages/conselho-digital/Landing";
import ConselhoDigitalDashboard from "@/pages/conselho-digital/Dashboard";
import ConselhoDigitalAICoach from "@/pages/conselho-digital/AICoach";
import ConselhoDigitalPortfolio from "@/pages/conselho-digital/Portfolio";

// Vinhonarios Pages
import VinhosVisoes from "@/pages/vinhonarios/VinhosVisoes";
import WineQuizAdminDashboard from "@/pages/vinhonarios/AdminDashboard";
import QrCodes from "@/pages/vinhonarios/QrCodes";
import Scoreboard from "@/pages/vinhonarios/Scoreboard";
import ResultsChart from "@/pages/vinhonarios/ResultsChart";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import LeftSidebarLayout from "@/components/layout/LeftSidebarLayout";
import { useDomainDetection } from "@/lib/domain-detection";
import { useLayoutStore } from "@/store/layout";

function Router() {
  const { isAuthenticated } = useAuthStore();
  const { layoutType } = useLayoutStore();
  const { isMainDomain, tenantId } = useDomainDetection();

  // Choose layout component based on configuration
  const LayoutComponent = layoutType === 'left-sidebar' ? LeftSidebarLayout : Layout;

  // Use ClientDashboard for tenant-specific domains, NewDashboard for main domain
  const DashboardComponent = !isMainDomain && tenantId ? ClientDashboard : NewDashboard;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {isAuthenticated ? (
        <LayoutComponent>
          <Switch>
            <Route path="/" component={DashboardComponent} />
            <Route path="/trails" component={Trails} />
            <Route path="/communities" component={Communities} />
            <Route path="/reports">
              <ProtectedRoute roles={['admin', 'super_admin', 'educator']}>
                <Reports />
              </ProtectedRoute>
            </Route>
            <Route path="/admin">
              <ProtectedRoute roles={['admin', 'super_admin']}>
                <AdminPanel />
              </ProtectedRoute>
            </Route>
            <Route path="/businessquest" component={BusinessQuestLanding} />
            <Route path="/businessquest/home" component={BusinessQuestHome} />
            <Route path="/businessquest/phase2" component={BusinessQuestDecisionPhase2} />
            <Route path="/conselho-digital" component={ConselhoDigitalLanding} />
            <Route path="/conselho-digital/dashboard" component={ConselhoDigitalDashboard} />
            <Route path="/conselho-digital/coach" component={ConselhoDigitalAICoach} />
            <Route path="/conselho-digital/portfolio" component={ConselhoDigitalPortfolio} />
            <Route path="/vinhonarios/vinhos-visoes" component={VinhosVisoes} />
            <Route path="/vinhonarios/admin" component={WineQuizAdminDashboard} />
            <Route path="/vinhonarios/qr-codes" component={QrCodes} />
            <Route path="/vinhonarios/scoreboard" component={Scoreboard} />
            <Route path="/vinhonarios/results-chart" component={ResultsChart} />
            <Route component={NotFound} />
          </Switch>
        </LayoutComponent>
      ) : (
        <Route component={Login} />
      )}
    </Switch>
  );
}

function App() {
  const { initialize } = useAuthStore();
  const { loadTenants } = useTenantStore();

  useEffect(() => {
    initialize();
    loadTenants();
  }, [initialize, loadTenants]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
