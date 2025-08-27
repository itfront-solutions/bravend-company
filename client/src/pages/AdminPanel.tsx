import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentManagement from '@/components/admin/ContentManagement';
import UserManagement from '@/components/admin/UserManagement';
import WhiteLabelCustomization from '@/components/WhiteLabelCustomization';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuthStore();

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
    <div className="space-y-6" data-testid="admin-panel">
      <div>
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie conteúdos, usuários e configurações da plataforma
        </p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="admin-active-users">
              {stats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trilhas Disponíveis</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="admin-total-trails">
              {stats?.totalTrails || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Trilhas de aprendizado ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="admin-engagement">
              {stats?.engagement || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa de engajamento mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="admin-nps">
              {stats?.nps || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Net Promoter Score atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" data-testid="content-tab">Gestão de Conteúdo</TabsTrigger>
          <TabsTrigger value="users" data-testid="users-tab">Gestão de Usuários</TabsTrigger>
          <TabsTrigger value="customization" data-testid="customization-tab">Personalização</TabsTrigger>
        </TabsList>

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
  );
}
