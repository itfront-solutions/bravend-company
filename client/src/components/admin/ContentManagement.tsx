import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function ContentManagement() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: trails = [], isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'trails'],
    enabled: !!user?.tenantId,
  });

  const filteredTrails = trails.filter((trail: any) => 
    trail.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trail.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-secondary text-secondary-foreground">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Rascunho
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      beginner: { variant: 'secondary' as const, label: 'Iniciante' },
      intermediate: { variant: 'default' as const, label: 'Intermediário' },
      advanced: { variant: 'destructive' as const, label: 'Avançado' }
    };
    
    const config = variants[difficulty as keyof typeof variants] || variants.beginner;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="content-management">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestão de Conteúdo</CardTitle>
            <Button data-testid="create-trail-button">
              <Plus className="h-4 w-4 mr-2" />
              Nova Trilha
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar trilhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-trails-input"
              />
            </div>
          </div>

          {/* Trails List */}
          <div className="space-y-4">
            {filteredTrails.length > 0 ? (
              filteredTrails.map((trail: any) => (
                <div 
                  key={trail.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  data-testid={`trail-item-${trail.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img 
                        src={trail.thumbnailUrl} 
                        alt={trail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{trail.title}</h3>
                        {getDifficultyBadge(trail.difficulty)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {trail.totalModules} módulos • {trail.estimatedHours}h • {trail.category}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{trail.pointsReward} pontos</span>
                        <span>Criado por: Admin</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(trail.isActive)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`trail-actions-${trail.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma trilha criada'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Tente buscar com outros termos'
                    : 'Comece criando sua primeira trilha de aprendizado'
                  }
                </p>
                {!searchTerm && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Trilha
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
