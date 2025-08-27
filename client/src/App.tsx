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
import Dashboard from "@/pages/Dashboard";
import Trails from "@/pages/Trails";
import Communities from "@/pages/Communities";
import Reports from "@/pages/Reports";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

function Router() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {isAuthenticated ? (
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
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
            <Route component={NotFound} />
          </Switch>
        </Layout>
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
