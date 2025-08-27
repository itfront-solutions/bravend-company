import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { Users, MessageCircle, Plus, Bookmark, Search, Filter, TrendingUp, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Communities() {
  const { currentTenant } = useTenantStore();
  const { theme, applyTheme } = useWhiteLabelTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Mock data for communities
  const communities = [
    {
      id: '1',
      name: 'Marketing Digital',
      description: 'Discussões sobre estratégias de marketing digital e tendências',
      members: 234,
      posts: 45,
      category: 'Marketing',
      isJoined: true,
      lastActivity: '2 horas atrás',
      avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150'
    },
    {
      id: '2',
      name: 'Liderança e Gestão',
      description: 'Compartilhe experiências e aprenda sobre liderança',
      members: 189,
      posts: 67,
      category: 'Liderança',
      isJoined: false,
      lastActivity: '1 dia atrás',
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150'
    },
    {
      id: '3',
      name: 'Analytics e Dados',
      description: 'Discussões sobre análise de dados e business intelligence',
      members: 156,
      posts: 23,
      category: 'Analytics',
      isJoined: true,
      lastActivity: '3 horas atrás',
      avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150'
    },
  ];

  const recentPosts = [
    {
      id: '1',
      title: 'Estratégias de SEO para 2024',
      author: 'Maria Silva',
      community: 'Marketing Digital',
      replies: 12,
      likes: 34,
      time: '2h atrás',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    },
    {
      id: '2',
      title: 'Como implementar OKRs em equipes remotas',
      author: 'João Santos',
      community: 'Liderança e Gestão',
      replies: 8,
      likes: 21,
      time: '4h atrás',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    {
      id: '3',
      title: 'Dashboards de vendas mais eficazes',
      author: 'Ana Costa',
      community: 'Analytics e Dados',
      replies: 15,
      likes: 42,
      time: '6h atrás',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
  ];

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || community.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(communities.map(c => c.category.toLowerCase()))];

  return (
    <div className="min-h-screen theme-background">
      <div className="container-responsive py-6 md:py-8" data-testid="communities-page">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Comunidades
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Conecte-se com outros profissionais, compartilhe conhecimento e aprenda colaborativamente
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar comunidades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button data-testid="create-community-button" className="theme-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nova Comunidade</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Suas Comunidades</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {filteredCommunities.filter(c => c.isJoined).map((community) => (
                  <Card key={community.id} className="card-responsive hover-lift hover-glow transition-all" data-testid={`community-card-${community.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 md:h-14 md:w-14">
                          <AvatarImage src={community.avatar} alt={community.name} />
                          <AvatarFallback className="theme-primary text-white">{community.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg truncate">{community.name}</CardTitle>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 gap-1 sm:gap-0">
                            <Badge variant="secondary" className="w-fit">{community.category}</Badge>
                            <span className="text-xs text-muted-foreground">{community.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className="line-clamp-2">{community.description}</CardDescription>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {community.members} membros
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {community.posts} posts
                        </div>
                      </div>
                      <Button className="w-full theme-primary" variant="outline" data-testid={`visit-community-${community.id}`}>
                        Visitar Comunidade
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Descobrir Comunidades</h2>
              <div className="space-y-4 md:space-y-6">
                {filteredCommunities.filter(c => !c.isJoined).map((community) => (
                  <Card key={community.id} className="hover-lift transition-all">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <Avatar className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0">
                            <AvatarImage src={community.avatar} alt={community.name} />
                            <AvatarFallback className="theme-secondary text-white">{community.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base md:text-lg">{community.name}</h3>
                            <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{community.description}</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {community.members} membros
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {community.posts} posts
                              </span>
                              <Badge variant="outline" className="text-xs">{community.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          data-testid={`join-community-${community.id}`}
                          className="w-full sm:w-auto theme-primary"
                        >
                          Entrar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Posts Recentes */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 theme-accent-text" />
                  Posts Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b border-border pb-4 last:border-b-0" data-testid={`recent-post-${post.id}`}>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={post.authorAvatar} alt={post.author} />
                        <AvatarFallback className="theme-primary text-white text-xs">{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{post.title}</h4>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
                          <span className="font-medium">{post.author}</span>
                          <span>•</span>
                          <span>{post.community}</span>
                          <span>•</span>
                          <span>{post.time}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {post.replies}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Bookmark className="h-5 w-5 mr-2 theme-secondary-text" />
                  Diretrizes da Comunidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Bookmark className="h-4 w-4 theme-primary-text mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Seja respeitoso</p>
                    <p className="text-xs text-muted-foreground">Mantenha um ambiente profissional e colaborativo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bookmark className="h-4 w-4 theme-primary-text mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Compartilhe conhecimento</p>
                    <p className="text-xs text-muted-foreground">Ajude outros com sua experiência e aprenda colaborativamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bookmark className="h-4 w-4 theme-primary-text mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Use categorias relevantes</p>
                    <p className="text-xs text-muted-foreground">Facilite a descoberta e organização do conteúdo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <div className="text-center py-12 md:py-16">
            <Users className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              Nenhuma comunidade encontrada
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Tente ajustar os filtros ou termo de busca para encontrar comunidades.
            </p>
            {(searchTerm || filterCategory !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                }}
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
