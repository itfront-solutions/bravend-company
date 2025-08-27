import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import NewNavigation from './NewNavigation';
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
    <div className="min-h-screen bg-gray-50">
      <TenantSelector />
      <NewNavigation />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
