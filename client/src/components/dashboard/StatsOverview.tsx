import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, CheckCircle, Clock, Users } from 'lucide-react';

export default function StatsOverview() {
  const { user } = useAuthStore();

  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'progress'],
    enabled: !!user?.id,
  }) as { data: any[] };

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'leaderboard'],
    enabled: !!user?.tenantId,
  }) as { data: any[] };

  // Calculate stats from progress data
  const activeTrails = Array.isArray(userProgress) ? userProgress.filter((p: any) => p.progressPercentage > 0 && p.progressPercentage < 100).length : 0;
  const completedModules = Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.completedModules || 0), 0) : 0;
  const totalTimeSpent = Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.totalTimeSpent || 0), 0) : 0;
  const userRanking = Array.isArray(leaderboard) ? leaderboard.findIndex((u: any) => u.id === user?.id) + 1 : 0;

  const stats = [
    {
      label: 'Trilhas em Progresso',
      value: activeTrails,
      icon: PlayCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Módulos Concluídos',
      value: completedModules,
      icon: CheckCircle,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      label: 'Horas de Estudo',
      value: `${Math.floor(totalTimeSpent / 60)}h`,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Ranking da Empresa',
      value: userRanking > 0 ? `#${userRanking}` : 'N/A',
      icon: Users,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-overview">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`${stat.color} text-xl h-6 w-6`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold" data-testid={`stat-${index}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
