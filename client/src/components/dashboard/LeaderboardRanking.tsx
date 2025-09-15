import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export default function LeaderboardRanking() {
  const { user } = useAuthStore();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'leaderboard'],
    enabled: !!user?.tenantId,
  }) as { data: any[], isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topUsers = Array.isArray(leaderboard) ? leaderboard.slice(0, 4) : [];
  const currentUserRank = Array.isArray(leaderboard) ? leaderboard.findIndex((u: any) => u.id === user?.id) + 1 : 0;

  return (
    <Card data-testid="leaderboard-ranking">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Ranking da Empresa</CardTitle>
          <Button variant="ghost" size="sm" data-testid="view-full-leaderboard">
            Ver ranking completo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topUsers.map((rankUser: any, index: number) => {
          const isCurrentUser = rankUser.id === user?.id;
          const rank = index + 1;
          
          return (
            <div 
              key={rankUser.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isCurrentUser 
                  ? 'bg-primary/5 border border-primary/20' 
                  : rank === 1 
                    ? 'bg-accent/5 border border-accent/20'
                    : 'hover:bg-muted/30'
              }`}
              data-testid={`leaderboard-rank-${rank}`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                  rank === 1 
                    ? 'bg-accent text-accent-foreground' 
                    : isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground text-background'
                }`}>
                  {rank === 1 ? <Crown className="h-4 w-4" /> : rank}
                </div>
                <div>
                  <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                    {rankUser.firstName} {rankUser.lastName}
                    {isCurrentUser && ' (Você)'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {rankUser.department}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  rank === 1 ? 'text-accent' : 
                  isCurrentUser ? 'text-primary' : ''
                }`}>
                  {rankUser.totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          );
        })}

        {currentUserRank > 4 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {currentUserRank}
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {user?.firstName} {user?.lastName} (Você)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.department}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">
                  {user?.totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
