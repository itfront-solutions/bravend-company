import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LearningProgress() {
  const { user } = useAuthStore();

  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'progress'],
    enabled: !!user?.id,
  }) as { data: any[] };

  // Calculate overall progress
  const totalModules = Array.isArray(userProgress) ? userProgress.reduce((sum: number, p: any) => sum + (p.completedModules || 0), 0) : 0;
  const averageProgress = Array.isArray(userProgress) && userProgress.length > 0 
    ? userProgress.reduce((sum: number, p: any) => sum + (p.progressPercentage || 0), 0) / userProgress.length 
    : 0;

  const progressPercentage = Math.round(averageProgress);

  // Mock weekly activity data
  const weeklyActivity = [
    { day: 'S', activity: 20, label: 'Seg' },
    { day: 'T', activity: 40, label: 'Ter' },
    { day: 'Q', activity: 32, label: 'Qua' },
    { day: 'Q', activity: 28, label: 'Qui' },
    { day: 'S', activity: 45, label: 'Sex' },
    { day: 'S', activity: 38, label: 'Sáb' },
    { day: 'D', activity: 10, label: 'Dom' },
  ];

  // Calculate stroke-dashoffset for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <Card data-testid="learning-progress">
      <CardHeader>
        <CardTitle className="text-xl">Progresso de Aprendizado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 progress-ring" viewBox="0 0 84 84">
              <circle 
                cx="42" 
                cy="42" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
                className="text-muted/30" 
              />
              <circle 
                cx="42" 
                cy="42" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
                className="text-primary progress-circle" 
                style={{ 
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset 
                }} 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" data-testid="progress-percentage">
                {progressPercentage}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Meta mensal concluída
          </p>
        </div>
        
        {/* Weekly Activity */}
        <div>
          <h3 className="font-medium mb-3">Atividade da Semana</h3>
          <div className="flex justify-between items-end space-x-1" data-testid="weekly-activity">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-8 rounded-t transition-all duration-500 ${
                    day.activity > 35 ? 'bg-primary' : 
                    day.activity > 20 ? 'bg-primary/60' : 
                    day.activity > 10 ? 'bg-secondary' : 'bg-muted'
                  }`}
                  style={{ height: `${Math.max(day.activity, 10)}px` }}
                />
                <span className="text-xs text-muted-foreground mt-1">
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {totalModules}
            </p>
            <p className="text-xs text-muted-foreground">
              Módulos concluídos
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">
              {Array.isArray(userProgress) ? userProgress.length : 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Trilhas iniciadas
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
