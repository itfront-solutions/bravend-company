import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Download, Calendar, Target } from 'lucide-react';
import { useState } from 'react';

export default function Reports() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30d');

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
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e engajamento da sua equipe
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32" data-testid="time-range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="export-button">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-users-count">
              {stats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="engagement-rate">
              {stats?.engagement || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trilhas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="active-trails-count">
              {stats?.totalTrails || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              3 novas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="nps-score">
              {stats?.nps || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +8 pontos este trimestre
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trail Engagement Report */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento por Trilha</CardTitle>
            <CardDescription>
              Taxa de conclusão e métricas de participação por trilha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockReports[0].trails.map((trail, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{trail.name}</span>
                  <Badge variant="outline">{trail.participants} participantes</Badge>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxa de conclusão: {trail.completion}%</span>
                  <span>Tempo médio: {trail.avgTime}</span>
                </div>
                <Progress value={trail.completion} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Departamento</CardTitle>
            <CardDescription>
              Comparativo de pontuação e engajamento entre departamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockReports[1].departments.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">{dept.members} membros</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{dept.avgPoints} pts médios</span>
                    <span>{dept.completion}% conclusão</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Usuários com melhor desempenho no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.slice(0, 10).map((user: any, index: number) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{user.totalPoints}</p>
                  <p className="text-sm text-muted-foreground">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
