import { Link, useLocation } from 'wouter';
import { Bell, Users, BarChart3, BookOpen, LayoutDashboard, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { currentTenant } = useTenantStore();

  if (!user || !currentTenant) return null;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trails', label: 'Trilhas', icon: BookOpen },
    { path: '/communities', label: 'Comunidades', icon: Users },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
  ];

  if (['admin', 'super_admin'].includes(user.role)) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-40" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground" data-testid="brand-name">
                  {currentTenant.brandName}
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <a
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                      data-testid={`nav-link-${item.path.replace('/', '') || 'dashboard'}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center cursor-pointer"
                data-testid="user-avatar"
              >
                <span className="text-secondary-foreground text-sm font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium" data-testid="user-name">
                  {user.firstName} {user.lastName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="ml-2 text-xs"
                  data-testid="logout-button"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
