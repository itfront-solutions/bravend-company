import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

export default function ActiveTrails() {
  const { user } = useAuthStore();

  const { data: trails = [] } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'trails'],
    enabled: !!user?.tenantId,
  }) as { data: any[] };

  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'progress'],
    enabled: !!user?.id,
  }) as { data: any[] };

  const activeTrails = Array.isArray(trails) ? trails.filter((trail: any) => {
    const progress = Array.isArray(userProgress) ? userProgress.find((p: any) => p.trailId === trail.id) : null;
    return progress && progress.progressPercentage > 0 && progress.progressPercentage < 100;
  }).slice(0, 3) : [];

  const getProgressForTrail = (trailId: string) => {
    return Array.isArray(userProgress) ? userProgress.find((p: any) => p.trailId === trailId) : null;
  };

  return (
    <Card data-testid="active-trails">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Suas Trilhas Ativas</CardTitle>
          <Button variant="ghost" size="sm" data-testid="view-all-trails">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTrails.length > 0 ? (
          activeTrails.map((trail: any) => {
            const progress = getProgressForTrail(trail.id);
            const progressPercentage = progress?.progressPercentage || 0;
            
            return (
              <div 
                key={trail.id} 
                className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`active-trail-${trail.id}`}
              >
                <img 
                  src={trail.thumbnailUrl} 
                  alt={trail.title}
                  className="w-16 h-16 rounded-lg object-cover mr-4" 
                />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{trail.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Módulo {progress?.completedModules || 0} de {trail.totalModules}
                  </p>
                  <div className="flex items-center">
                    <div className="flex-1 mr-3">
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {progressPercentage}%
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="flex items-center text-accent mb-1">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+{trail.pointsReward} pts</span>
                  </div>
                  <Button 
                    size="sm"
                    data-testid={`continue-trail-${trail.id}`}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma trilha ativa encontrada</p>
            <Button variant="outline" className="mt-2" data-testid="start-first-trail">
              Iniciar uma trilha
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
