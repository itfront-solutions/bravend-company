import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import LeftSidebar from './LeftSidebar';
import { cn } from '@/lib/utils';

interface LeftSidebarLayoutProps {
  children: React.ReactNode;
}

export default function LeftSidebarLayout({ children }: LeftSidebarLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [children]);

  // Handle sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LeftSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out",
        "lg:ml-64", // Default sidebar width
        isSidebarCollapsed && "lg:ml-16" // Collapsed sidebar width
      )}>
        <div className="flex-1 overflow-auto">
          <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
          {children}
        </div>
      </main>
    </div>
  );
}