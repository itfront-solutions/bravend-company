import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import Navigation from './Navigation';
import TenantSelector from './TenantSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();
  const { initializeTenant } = useTenantStore();

  useEffect(() => {
    if (user?.tenantId) {
      initializeTenant(user.tenantId);
    }
  }, [user?.tenantId, initializeTenant]);

  return (
    <div className="min-h-screen bg-background">
      <TenantSelector />
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
