import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Star, Users, Filter, Search, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

export default function Trails() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme, applyTheme } = useWhiteLabelTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

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

  const filteredTrails = trails.filter((trail: any) => {
    const matchesSearch = trail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trail.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || trail.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen theme-background">
      <div className="container-responsive py-6 md:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Trilhas de Aprendizado
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore nossos cursos estruturados e desenvolva suas habilidades de forma progressiva
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar trilhas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex rounded-lg border p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button data-testid="create-trail-button" className="theme-primary">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nova Trilha</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trails Content */}
        <div className={viewMode === 'grid' ? 'grid-responsive' : 'space-y-4'}>
          {filteredTrails.map((trail: any) => {
            const progress = getProgressForTrail(trail.id);
            const progressPercentage = progress?.progressPercentage || 0;
            
            if (viewMode === 'list') {
              return (
                <Card key={trail.id} className="hover-lift hover-glow transition-all" data-testid={`trail-card-${trail.id}`}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      <div className="w-full lg:w-48 h-32 lg:h-24 relative overflow-hidden rounded-lg flex-shrink-0">
                        <img 
                          src={trail.thumbnailUrl || '/api/placeholder/300/200'} 
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
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold mb-2">{trail.title}</h3>
                          <p className="text-gray-600 text-sm md:text-base line-clamp-2">{trail.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                      </div>
                      
                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        <Button 
                          className="flex-1 lg:flex-none button-responsive theme-primary" 
                          variant={progress ? "default" : "outline"}
                          data-testid={`trail-action-${trail.id}`}
                        >
                          {progress ? 'Continuar' : 'Iniciar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            return (
              <Card key={trail.id} className="card-responsive hover-lift hover-glow transition-all" data-testid={`trail-card-${trail.id}`}>
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={trail.thumbnailUrl || '/api/placeholder/300/200'} 
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
                  <CardTitle className="text-responsive">{trail.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{trail.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {trail.totalModules} módulos
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {trail.estimatedHours}h
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 theme-accent-text" />
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
                    className="button-responsive w-full theme-primary" 
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

        {/* Empty State */}
        {filteredTrails.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              {trails.length === 0 ? 'Nenhuma trilha disponível' : 'Nenhuma trilha encontrada'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {trails.length === 0 
                ? 'Entre em contato com o administrador para criar novas trilhas.'
                : 'Tente ajustar os filtros ou termo de busca para encontrar trilhas.'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterDifficulty('all');
                }}
                className="mt-4"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
