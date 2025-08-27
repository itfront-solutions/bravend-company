import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Plus, Bookmark } from 'lucide-react';

export default function Communities() {
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

  return (
    <div className="space-y-6" data-testid="communities-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comunidades</h1>
          <p className="text-muted-foreground">
            Conecte-se com outros profissionais e compartilhe conhecimento
          </p>
        </div>
        <Button data-testid="create-community-button">
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunidade
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Suas Comunidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communities.filter(c => c.isJoined).map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow" data-testid={`community-card-${community.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.avatar} alt={community.name} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{community.category}</Badge>
                          <span className="text-xs text-muted-foreground">{community.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{community.description}</CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {community.members} membros
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {community.posts} posts
                      </div>
                    </div>
                    <Button className="w-full" variant="outline" data-testid={`visit-community-${community.id}`}>
                      Visitar Comunidade
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Descobrir Comunidades</h2>
            <div className="space-y-4">
              {communities.filter(c => !c.isJoined).map((community) => (
                <Card key={community.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.avatar} alt={community.name} />
                          <AvatarFallback>{community.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{community.name}</h3>
                          <p className="text-sm text-muted-foreground">{community.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                            <span>{community.members} membros</span>
                            <span>{community.posts} posts</span>
                            <Badge variant="outline" className="text-xs">{community.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <Button data-testid={`join-community-${community.id}`}>Entrar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posts Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b border-border pb-4 last:border-b-0" data-testid={`recent-post-${post.id}`}>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.authorAvatar} alt={post.author} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{post.community}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{post.likes} curtidas</span>
                        <span>{post.replies} respostas</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas da Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Bookmark className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Seja respeitoso</p>
                  <p className="text-xs text-muted-foreground">Mantenha um ambiente profissional e colaborativo</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Bookmark className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Compartilhe conhecimento</p>
                  <p className="text-xs text-muted-foreground">Ajude outros com sua experiência e aprenda</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Bookmark className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Use tags relevantes</p>
                  <p className="text-xs text-muted-foreground">Facilite a descoberta do seu conteúdo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
