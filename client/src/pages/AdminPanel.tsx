import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentManagement from '@/components/admin/ContentManagement';
import UserManagement from '@/components/admin/UserManagement';
import WhiteLabelCustomization from '@/components/WhiteLabelCustomization';
import TenantManagement from '@/components/admin/TenantManagement';
import CompanyNewsManagement from '@/components/admin/CompanyNewsManagement';
import LayoutSettings from '@/components/admin/LayoutSettings';
import { Users, BookOpen, TrendingUp, Award, Settings, Shield, Building2, Megaphone } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminPanel() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme, applyTheme } = useWhiteLabelTheme();

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'stats'],
    enabled: !!user?.tenantId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-background">
      <div className="container-responsive py-6 md:py-8" data-testid="admin-panel">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Painel Administrativo
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Gerencie conteúdos, usuários e configurações da plataforma {currentTenant?.brandName || 'Orquestra'}
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="admin-active-users">
                {stats?.activeUsers || 2847}
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Total de usuários cadastrados
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trilhas Disponíveis</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="admin-total-trails">
                {stats?.totalTrails || 12}
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Trilhas de aprendizado ativas
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="admin-engagement">
                {stats?.engagement || 78}%
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Taxa de engajamento mensal
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="admin-nps">
                {stats?.nps || 8.5}
              </div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Net Promoter Score atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="tenants" className="space-y-6 md:space-y-8">
          <div className="flex justify-center overflow-x-auto">
            <TabsList className="grid w-full max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto sm:h-10">
              <TabsTrigger 
                value="tenants" 
                data-testid="tenants-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Clientes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                data-testid="news-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <Megaphone className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Notícias</span>
              </TabsTrigger>
              <TabsTrigger 
                value="layout" 
                data-testid="layout-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Layout</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                data-testid="content-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Conteúdo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                data-testid="users-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Usuários</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customization" 
                data-testid="customization-tab"
                className="flex items-center justify-center gap-1 py-2 sm:py-0"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs sm:text-sm">White-Label</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tenants" className="space-y-6">
            <TenantManagement />
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <CompanyNewsManagement />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <WhiteLabelCustomization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
