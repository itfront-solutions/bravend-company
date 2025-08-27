import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Bell, 
  Users, 
  BarChart3, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Gamepad2, 
  Brain,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  Network,
  TrendingUp,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface NavItem {
  path: string;
  label: string;
  icon: any;
  description?: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: any;
  items: NavItem[];
  color: string;
}

export default function NewNavigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { currentTenant } = useTenantStore();

  if (!user || !currentTenant) return null;

  // Estrutura hierárquica de navegação baseada na plataforma Orquestra
  const navCategories: NavCategory[] = [
    {
      id: 'main',
      label: 'Principal',
      icon: LayoutDashboard,
      color: 'text-blue-600',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral da plataforma' }
      ]
    },
    {
      id: 'learning',
      label: 'Aprendizagem',
      icon: GraduationCap,
      color: 'text-green-600',
      items: [
        { path: '/trails', label: 'Trilhas', icon: BookOpen, description: 'Jornadas de aprendizado' },
        { path: '/communities', label: 'Comunidades', icon: Users, description: 'Networking e discussões' }
      ]
    },
    {
      id: 'products',
      label: 'Produtos Orquestra',
      icon: Network,
      color: 'text-purple-600',
      items: [
        { path: '/businessquest', label: 'Business Quest', icon: Gamepad2, description: 'Simulador de negócios' },
        { path: '/conselho-digital', label: 'Conselho Digital', icon: Brain, description: 'Escola de Conselheiros CVO' }
      ]
    },
    {
      id: 'management',
      label: 'Gestão',
      icon: Building,
      color: 'text-orange-600',
      items: [
        { path: '/reports', label: 'Relatórios', icon: BarChart3, description: 'Analytics e insights' }
      ]
    }
  ];

  // Adicionar Admin se o usuário tem permissão
  if (['admin', 'super_admin'].includes(user.role)) {
    navCategories.push({
      id: 'admin',
      label: 'Administração',
      icon: Settings,
      color: 'text-red-600',
      items: [
        { path: '/admin', label: 'Painel Admin', icon: Settings, description: 'Configurações do sistema' }
      ]
    });
  }

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const isActivePath = (items: NavItem[]) => {
    return items.some(item => isActive(item.path));
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo e Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentTenant.brandName}
                  </h1>
                  <p className="text-xs text-gray-500">Plataforma Orquestra</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {navCategories.map((category) => {
                const Icon = category.icon;
                const isActiveCategory = isActivePath(category.items);
                
                return (
                  <DropdownMenu key={category.id}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                          isActiveCategory 
                            ? `${category.color} bg-gray-100` 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="start" className="w-64 p-2">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link key={item.path} href={item.path}>
                            <DropdownMenuItem className={`flex items-start space-x-3 p-3 cursor-pointer ${
                              isActive(item.path) ? 'bg-gray-100' : ''
                            }`}>
                              <ItemIcon className={`h-4 w-4 mt-0.5 ${category.color}`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                )}
                              </div>
                            </DropdownMenuItem>
                          </Link>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              {navCategories.map((category) => {
                const CategoryIcon = category.icon;
                const isActiveCategory = isActivePath(category.items);
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className={`flex items-center space-x-2 px-2 py-1 font-medium ${
                      isActiveCategory ? category.color : 'text-gray-700'
                    }`}>
                      <CategoryIcon className="h-4 w-4" />
                      <span className="text-sm">{category.label}</span>
                    </div>
                    
                    <div className="ml-6 space-y-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link key={item.path} href={item.path}>
                            <div 
                              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive(item.path) 
                                  ? 'bg-gray-100 text-gray-900' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <ItemIcon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{item.label}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}