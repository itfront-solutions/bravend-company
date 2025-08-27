import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, Edit, MoreHorizontal, Mail, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function UserManagement() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'users'],
    enabled: !!user?.tenantId,
  });

  const filteredUsers = users.filter((u: any) => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { variant: 'destructive' as const, label: 'Super Admin', icon: Shield },
      admin: { variant: 'default' as const, label: 'Admin', icon: Shield },
      educator: { variant: 'secondary' as const, label: 'Educador', icon: Mail },
      student: { variant: 'outline' as const, label: 'Aluno', icon: null }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        {Icon && <Icon className="h-3 w-3" />}
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-secondary text-secondary-foreground">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="user-management">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestão de Usuários</CardTitle>
            <Button data-testid="create-user-button">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários por nome, email ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-users-input"
            />
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem: any) => (
                <div 
                  key={userItem.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  data-testid={`user-item-${userItem.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userItem.avatar} alt={`${userItem.firstName} ${userItem.lastName}`} />
                      <AvatarFallback>
                        {userItem.firstName[0]}{userItem.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">
                          {userItem.firstName} {userItem.lastName}
                        </h3>
                        {userItem.id === user?.id && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {userItem.email}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {userItem.department || 'Sem departamento'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {userItem.totalPoints.toLocaleString()} pontos
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Nível {userItem.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(userItem.role)}
                    {getStatusBadge(userItem.isActive)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" data-testid={`user-actions-${userItem.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Alterar Função
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Resetar Senha
                        </DropdownMenuItem>
                        {userItem.id !== user?.id && (
                          <DropdownMenuItem className="text-destructive">
                            {userItem.isActive ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Tente buscar com outros termos'
                    : 'Comece adicionando usuários à plataforma'
                  }
                </p>
                {!searchTerm && (
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Usuário
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* User Stats */}
          {filteredUsers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {filteredUsers.filter((u: any) => u.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {filteredUsers.filter((u: any) => u.role === 'admin' || u.role === 'super_admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {filteredUsers.filter((u: any) => u.role === 'educator').length}
                </p>
                <p className="text-sm text-muted-foreground">Educadores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-1">
                  {filteredUsers.filter((u: any) => u.role === 'student').length}
                </p>
                <p className="text-sm text-muted-foreground">Alunos</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
