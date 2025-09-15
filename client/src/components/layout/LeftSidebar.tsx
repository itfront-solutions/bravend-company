import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Brain,
  Building2,
  Megaphone,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Wine,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { useDomainDetection } from '@/lib/domain-detection';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: string;
  color?: string;
  category: 'main' | 'modules' | 'admin' | 'support';
  roles?: string[];
  isActive?: boolean;
  children?: NavItem[];
  isParent?: boolean;
}

export default function LeftSidebar({ isCollapsed, onToggle, isMobileOpen, onMobileToggle }: SidebarProps) {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user, logout } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme } = useWhiteLabelTheme();
  const { isMainDomain } = useDomainDetection();

  // Navigation items baseado no tipo de usuário e tenant
  const navItems: NavItem[] = [
    // Main navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      category: 'main',
      color: 'text-blue-600'
    },
    
    // Learning modules
    {
      id: 'trails',
      label: 'Trilhas',
      icon: BookOpen,
      path: '/trails',
      category: 'modules',
      color: 'text-green-600'
    },
    {
      id: 'communities',
      label: 'Comunidades',
      icon: Users,
      path: '/communities',
      category: 'modules',
      color: 'text-purple-600'
    },
    {
      id: 'businessquest',
      label: 'Business Quest',
      icon: Gamepad2,
      path: '/businessquest',
      category: 'modules',
      color: 'text-indigo-600',
      badge: 'Novo'
    },
    {
      id: 'conselho-digital',
      label: 'Conselho Digital',
      icon: Brain,
      path: '/conselho-digital',
      category: 'modules',
      color: 'text-pink-600',
      badge: 'Premium'
    },
    {
      id: 'vinhonarios',
      label: 'Vinhonarios',
      icon: Wine,
      category: 'modules',
      color: 'text-purple-600',
      isParent: true,
      children: [
        {
          id: 'vinhos-visoes',
          label: 'Menu Principal',
          icon: Wine,
          path: '/vinhonarios/vinhos-visoes',
          category: 'modules',
          color: 'text-purple-600'
        },
        {
          id: 'scoreboard',
          label: 'Scoreboard',
          icon: BarChart3,
          path: '/vinhonarios/scoreboard',
          category: 'modules',
          color: 'text-yellow-600'
        }
      ]
    },
    {
      id: 'nps',
      label: 'Sistema NPS',
      icon: Star,
      category: 'modules',
      color: 'text-amber-600',
      badge: 'Novo',
      isParent: true,
      children: [
        {
          id: 'nps-dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/nps',
          category: 'modules',
          color: 'text-amber-600'
        },
        {
          id: 'nps-surveys',
          label: 'Pesquisas',
          icon: Star,
          path: '/nps/surveys',
          category: 'modules',
          color: 'text-amber-600'
        },
        {
          id: 'nps-create',
          label: 'Nova Pesquisa',
          icon: Star,
          path: '/nps/create',
          category: 'modules',
          color: 'text-amber-600'
        },
        {
          id: 'nps-calculator',
          label: 'Calculadora NPS',
          icon: Star,
          path: '/nps/calculator',
          category: 'modules',
          color: 'text-amber-600'
        }
      ]
    },
    
    // Analytics & Reports
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
      category: 'modules',
      color: 'text-orange-600',
      roles: ['admin', 'super_admin', 'educator']
    },
    
    // Admin section (only for main domain or super admins)
    ...(isMainDomain || user?.role === 'super_admin' ? [
      {
        id: 'admin',
        label: 'Painel Admin',
        icon: Shield,
        path: '/admin',
        category: 'admin' as const,
        color: 'text-red-600',
        roles: ['admin', 'super_admin']
      }
    ] : []),
    
    // Support
    {
      id: 'help',
      label: 'Ajuda',
      icon: HelpCircle,
      path: '/help',
      category: 'support' as const,
      color: 'text-gray-600'
    }
  ];

  // Filter items based on user roles and tenant
  const filteredNavItems = navItems.filter(item => {
    if (item.roles && user?.role) {
      return item.roles.includes(user.role);
    }
    return true;
  });

  const isActive = (path?: string, children?: NavItem[]) => {
    if (!path && children) {
      return children.some(child => child.path && location.startsWith(child.path));
    }
    if (path === '/') return location === '/';
    return path ? location.startsWith(path) : false;
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const getCategoryItems = (category: string) => {
    return filteredNavItems.filter(item => item.category === category);
  };

  const renderMenuItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.children);
    const isExpanded = expandedMenus.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <li key={item.id} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10",
              isCollapsed ? "px-2" : "px-3",
              active 
                ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700" 
                : "text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => !isCollapsed && toggleMenu(item.id)}
          >
            <Icon className={cn("h-5 w-5", item.color, isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {hasChildren && (
                  isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )
                )}
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
          
          {/* Submenu items */}
          {!isCollapsed && hasChildren && isExpanded && (
            <ul className="ml-6 space-y-1">
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    // Regular menu item
    return (
      <li key={item.id}>
        <Link href={item.path!}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10",
              isCollapsed ? "px-2" : "px-3",
              depth > 0 ? "text-sm" : "",
              active 
                ? "bg-purple-50 text-purple-700 border-r-2 border-purple-700" 
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon className={cn("h-5 w-5", item.color, isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Link>
      </li>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className={cn(
        "flex items-center px-4 py-6 border-b border-gray-200",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            {currentTenant?.theme?.logo ? (
              <img 
                src={currentTenant.theme.logo} 
                alt={currentTenant.brandName}
                className="h-8 w-auto"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: theme.colors.primary }}
              >
                {currentTenant?.brandName?.charAt(0) || 'O'}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {currentTenant?.brandName || 'Orquestra'}
              </h2>
              <p className="text-xs text-gray-600">
                {isMainDomain ? 'Admin Central' : 'Plataforma'}
              </p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="hidden lg:flex w-8 h-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="theme-primary text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Principal
              </h3>
            )}
            <ul className="space-y-1">
              {getCategoryItems('main').map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.id}>
                    <Link href={item.path || '#'}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-10",
                          isCollapsed ? "px-2" : "px-3",
                          active 
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", item.color, isCollapsed ? "" : "mr-3")} />
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator />

          {/* Modules */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Módulos
              </h3>
            )}
            <ul className="space-y-1">
              {getCategoryItems('modules').map((item) => renderMenuItem(item))}
            </ul>
          </div>

          {/* Admin Section */}
          {getCategoryItems('admin').length > 0 && (
            <>
              <Separator />
              <div>
                {!isCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administração
                  </h3>
                )}
                <ul className="space-y-1">
                  {getCategoryItems('admin').map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <li key={item.id}>
                        <Link href={item.path || '#'}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start h-10",
                              isCollapsed ? "px-2" : "px-3",
                              active 
                                ? "bg-red-50 text-red-700 border-r-2 border-red-700" 
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <Icon className={cn("h-5 w-5", item.color, isCollapsed ? "" : "mr-3")} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </Button>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-200">
        <div className="space-y-2">
          {!isCollapsed && (
            <>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
                <Badge variant="secondary" className="ml-auto">3</Badge>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className={cn(
              "w-full text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed ? "px-2" : "justify-start"
            )}
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
            {!isCollapsed && "Sair"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 p-0 bg-white border border-gray-200 shadow-md"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={onMobileToggle}
          />
          <aside className="lg:hidden fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}