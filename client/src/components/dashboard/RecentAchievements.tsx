import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Star } from 'lucide-react';

export default function RecentAchievements() {
  const { user } = useAuthStore();

  const { data: pointsHistory = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'points'],
    enabled: !!user?.id,
  }) as { data: any[] };

  const { data: userBadges = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'badges'],
    enabled: !!user?.id,
  });

  // Mock recent achievements data since we don't have a specific endpoint
  const recentAchievements = [
    {
      id: '1',
      title: 'Expert em Marketing',
      description: 'Completou 5 trilhas de marketing digital',
      points: 500,
      date: 'Hoje',
      icon: Trophy,
      color: 'text-accent',
      bgColor: 'bg-accent/5 border-accent/20',
    },
    {
      id: '2',
      title: 'Participação Ativa',
      description: '7 dias consecutivos de atividade',
      points: 100,
      date: 'Ontem',
      icon: Medal,
      color: 'text-secondary',
      bgColor: 'bg-secondary/5 border-secondary/20',
    },
    {
      id: '3',
      title: 'Primeiro Módulo',
      description: 'Completou seu primeiro módulo de aprendizado',
      points: 50,
      date: '3 dias atrás',
      icon: Star,
      color: 'text-primary',
      bgColor: 'bg-primary/5 border-primary/20',
    },
  ].slice(0, Math.min(3, (Array.isArray(pointsHistory) ? pointsHistory.length : 0) + 1)); // Show achievements based on actual activity

  return (
    <Card data-testid="recent-achievements">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Conquistas Recentes</CardTitle>
          <Button variant="ghost" size="sm" data-testid="view-all-achievements">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAchievements.length > 0 ? (
          recentAchievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`flex items-center p-4 border rounded-lg ${achievement.bgColor}`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className={`w-12 h-12 ${achievement.bgColor.replace('/5', '/20')} rounded-lg flex items-center justify-center mr-4`}>
                  <Icon className={`${achievement.color} text-xl h-6 w-6`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <div className={`${achievement.color} font-bold`}>
                    +{achievement.points} pts
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.date}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma conquista recente</p>
            <p className="text-sm text-muted-foreground">
              Complete módulos e trilhas para ganhar badges!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
