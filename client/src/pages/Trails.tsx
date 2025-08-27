import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, Users } from 'lucide-react';

export default function Trails() {
  const { user } = useAuthStore();

  const { data: trails = [], isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'trails'],
    enabled: !!user?.tenantId,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'progress'],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getProgressForTrail = (trailId: string) => {
    return userProgress.find((p: any) => p.trailId === trailId);
  };

  return (
    <div className="space-y-6" data-testid="trails-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">
            Explore nossos cursos e desenvolva suas habilidades
          </p>
        </div>
        <Button data-testid="create-trail-button">
          <BookOpen className="h-4 w-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trails.map((trail: any) => {
          const progress = getProgressForTrail(trail.id);
          const progressPercentage = progress?.progressPercentage || 0;
          
          return (
            <Card key={trail.id} className="hover:shadow-lg transition-shadow" data-testid={`trail-card-${trail.id}`}>
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={trail.thumbnailUrl} 
                  alt={trail.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={trail.difficulty === 'beginner' ? 'secondary' : 
                                 trail.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                    {trail.difficulty === 'beginner' ? 'Iniciante' : 
                     trail.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{trail.title}</CardTitle>
                <CardDescription className="line-clamp-2">{trail.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {trail.totalModules} módulos
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {trail.estimatedHours}h
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {trail.pointsReward} pts
                  </div>
                </div>

                {progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={progress ? "default" : "outline"}
                  data-testid={`trail-action-${trail.id}`}
                >
                  {progress ? 'Continuar' : 'Iniciar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {trails.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma trilha disponível</h3>
          <p className="text-muted-foreground">
            Entre em contato com o administrador para criar novas trilhas.
          </p>
        </div>
      )}
    </div>
  );
}
