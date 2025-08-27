import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Download, Calendar, Target, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Reports() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme, applyTheme } = useWhiteLabelTheme();
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'stats'],
    enabled: !!user?.tenantId,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'leaderboard'],
    enabled: !!user?.tenantId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mockReports = [
    {
      title: 'Engajamento por Trilha',
      description: 'Taxa de conclusão e tempo médio por trilha de aprendizado',
      trails: [
        { name: 'Marketing Digital', completion: 78, avgTime: '12h', participants: 45 },
        { name: 'Liderança', completion: 65, avgTime: '8h', participants: 32 },
        { name: 'Analytics', completion: 82, avgTime: '15h', participants: 28 },
      ]
    },
    {
      title: 'Performance por Departamento',
      description: 'Comparativo de engajamento entre departamentos',
      departments: [
        { name: 'Marketing', avgPoints: 2340, completion: 85, members: 12 },
        { name: 'Vendas', avgPoints: 2890, completion: 92, members: 18 },
        { name: 'RH', avgPoints: 2120, completion: 78, members: 8 },
        { name: 'TI', avgPoints: 1950, completion: 68, members: 15 },
      ]
    }
  ];

  return (
    <div className="min-h-screen theme-background">
      <div className="container-responsive py-6 md:py-8" data-testid="reports-page">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Relatórios e Analytics
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhe o desempenho, engajamento e resultados da sua equipe com insights detalhados
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 theme-primary-text" />
            <span className="font-medium text-gray-900">Período de Análise</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40" data-testid="time-range-select">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="export-button" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">Exportar Dados</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="active-users-count">
                {stats?.activeUsers || 2847}
              </div>
              <p className="text-xs md:text-sm text-green-600 font-medium mt-1">
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="engagement-rate">
                {stats?.engagement || 78}%
              </div>
              <p className="text-xs md:text-sm text-green-600 font-medium mt-1">
                +5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trilhas Ativas</CardTitle>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="active-trails-count">
                {stats?.totalTrails || 12}
              </div>
              <p className="text-xs md:text-sm text-green-600 font-medium mt-1">
                3 novas este mês
              </p>
            </CardContent>
          </Card>

          <Card className="card-responsive hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="nps-score">
                {stats?.nps || 8.5}
              </div>
              <p className="text-xs md:text-sm text-green-600 font-medium mt-1">
                +0.8 este trimestre
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Trail Engagement Report */}
          <Card className="card-responsive">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 theme-primary-text" />
                Engajamento por Trilha
              </CardTitle>
              <CardDescription>
                Taxa de conclusão e métricas de participação por trilha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockReports[0].trails.map((trail, index) => (
                <div key={index} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-gray-900">{trail.name}</span>
                    <Badge variant="outline" className="w-fit">{trail.participants} participantes</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-muted-foreground">
                    <span>Taxa de conclusão: {trail.completion}%</span>
                    <span>Tempo médio: {trail.avgTime}</span>
                  </div>
                  <Progress value={trail.completion} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card className="card-responsive">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 theme-secondary-text" />
                Performance por Departamento
              </CardTitle>
              <CardDescription>
                Comparativo de pontuação e engajamento entre departamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockReports[1].departments.map((dept, index) => (
                <div key={index} className="p-4 border rounded-lg hover-lift transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <span className="font-medium text-gray-900">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">{dept.members} membros</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pontuação média</span>
                      <p className="font-semibold theme-accent-text">{dept.avgPoints} pts</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taxa de conclusão</span>
                      <p className="font-semibold text-green-600">{dept.completion}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 theme-accent-text" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Usuários com melhor desempenho no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.slice(0, 10).map((user: any, index: number) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg theme-primary-text">{user.totalPoints}</p>
                    <p className="text-sm text-muted-foreground">pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
