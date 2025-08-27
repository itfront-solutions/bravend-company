import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWhiteLabelTheme } from '@/lib/theme';
import { useDomainDetection } from '@/lib/domain-detection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Trophy, 
  Bell, 
  Calendar, 
  ExternalLink,
  ChevronRight, 
  Activity,
  Brain,
  Gamepad2,
  Target,
  Zap,
  Heart,
  MessageCircle,
  Star,
  BarChart3,
  Globe
} from 'lucide-react';
import { Link } from 'wouter';
import { CompanyNews } from '@/types/tenant';

interface ClientStats {
  activeUsers: number;
  totalSessions: number;
  completedTrails: number;
  totalPoints: number;
  monthlyGrowth: number;
  engagementRate: number;
}

interface ModuleStatus {
  id: string;
  name: string;
  icon: any;
  isActive: boolean;
  usage: number;
  lastAccess: string;
  color: string;
}

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  const { theme, applyTheme } = useWhiteLabelTheme();
  const { tenantId, isMainDomain, getBrandingConfig } = useDomainDetection();
  
  const [companyNews, setCompanyNews] = useState<CompanyNews[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [availableModules, setAvailableModules] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyTheme();
    loadClientData();
  }, [applyTheme, tenantId]);

  const loadClientData = async () => {
    setLoading(true);
    
    // Mock data - em produção viria da API
    const mockNews: CompanyNews[] = [
      {
        id: '1',
        title: 'Nova Funcionalidade: Analytics Avançado',
        content: 'Estamos felizes em anunciar o lançamento do novo módulo de Analytics Avançado com dashboards personalizáveis...',
        summary: 'Novo módulo de analytics com dashboards personalizáveis e relatórios automatizados.',
        imageUrl: 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Analytics',
        author: 'Equipe Orquestra',
        publishedAt: '2024-01-15T10:00:00Z',
        tags: ['produto', 'analytics', 'novidade'],
        targetTenants: [],
        priority: 'high',
        isVisible: true
      },
      {
        id: '2',
        title: 'Webinar: Maximizando Resultados com Gamificação',
        content: 'Participe do nosso webinar exclusivo sobre como maximizar o engajamento usando gamificação...',
        summary: 'Webinar gratuito sobre estratégias de gamificação para aumentar o engajamento.',
        imageUrl: 'https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Webinar',
        author: 'Equipe Educacional',
        publishedAt: '2024-01-12T14:30:00Z',
        tags: ['webinar', 'gamificação', 'educação'],
        targetTenants: [],
        priority: 'normal',
        isVisible: true
      },
      {
        id: '3',
        title: 'Dicas: Como Aumentar o Engajamento da Equipe',
        content: 'Compartilhamos 10 estratégias comprovadas para aumentar o engajamento e motivação da sua equipe...',
        summary: 'Estratégias práticas para melhorar o engajamento e motivação das equipes.',
        author: 'Consultoria Orquestra',
        publishedAt: '2024-01-10T09:00:00Z',
        tags: ['dicas', 'engajamento', 'rh'],
        targetTenants: [],
        priority: 'normal',
        isVisible: true
      }
    ];

    const mockStats: ClientStats = {
      activeUsers: 342,
      totalSessions: 1250,
      completedTrails: 28,
      totalPoints: 15420,
      monthlyGrowth: 23,
      engagementRate: 78
    };

    const mockModules: ModuleStatus[] = [
      {
        id: 'trails',
        name: 'Trilhas de Aprendizado',
        icon: BookOpen,
        isActive: true,
        usage: 85,
        lastAccess: '2024-01-15T08:30:00Z',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'businessquest',
        name: 'Business Quest',
        icon: Gamepad2,
        isActive: true,
        usage: 72,
        lastAccess: '2024-01-14T16:20:00Z',
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: 'communities',
        name: 'Comunidades',
        icon: Users,
        isActive: true,
        usage: 64,
        lastAccess: '2024-01-13T11:45:00Z',
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'reports',
        name: 'Relatórios',
        icon: BarChart3,
        isActive: true,
        usage: 43,
        lastAccess: '2024-01-12T14:10:00Z',
        color: 'from-orange-500 to-red-600'
      }
    ];

    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCompanyNews(mockNews);
    setClientStats(mockStats);
    setAvailableModules(mockModules);
    setLoading(false);
  };

  if (!user || !currentTenant || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-background">
      {/* Hero Section with Tenant Branding */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                {currentTenant.theme.logo && (
                  <img 
                    src={currentTenant.theme.logo} 
                    alt={currentTenant.brandName}
                    className="h-12 w-auto"
                  />
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {currentTenant.brandName}
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-blue-100 mb-6">
                Olá, {user.firstName}! Bem-vindo ao seu ambiente de aprendizado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  {clientStats?.activeUsers} usuários ativos
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                  <Target className="w-4 h-4 mr-2" />
                  Plataforma White-Label
                </Badge>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{clientStats?.engagementRate}%</div>
                <div className="text-blue-100 text-sm">Engajamento</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{clientStats?.completedTrails}</div>
                <div className="text-blue-100 text-sm">Trilhas Concluídas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Modules Overview */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 theme-primary-text" />
                  Seus Módulos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableModules.filter(m => m.isActive).map((module) => {
                    const Icon = module.icon;
                    return (
                      <div key={module.id} className="relative overflow-hidden rounded-lg border border-gray-200 hover-lift transition-all">
                        <div className={`h-2 bg-gradient-to-r ${module.color}`}></div>
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{module.name}</h3>
                              <p className="text-sm text-gray-600">
                                Último acesso: {new Date(module.lastAccess).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Uso este mês</span>
                              <span className="text-sm font-medium">{module.usage}%</span>
                            </div>
                            <Progress value={module.usage} className="h-2" />
                          </div>
                          
                          <Link href={`/${module.id}`}>
                            <Button className="w-full">
                              Acessar Módulo
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 theme-accent-text" />
                  Visão Geral de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{clientStats?.activeUsers}</div>
                    <div className="text-sm text-gray-600">Usuários Ativos</div>
                    <div className="text-xs text-green-600 mt-1">+{clientStats?.monthlyGrowth}% este mês</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{clientStats?.totalSessions.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Sessões Totais</div>
                    <div className="text-xs text-green-600 mt-1">+15% este mês</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{clientStats?.completedTrails}</div>
                    <div className="text-sm text-gray-600">Trilhas Concluídas</div>
                    <div className="text-xs text-green-600 mt-1">+8 este mês</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{clientStats?.totalPoints.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Pontos Totais</div>
                    <div className="text-xs text-green-600 mt-1">+2.3k este mês</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Company News */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 theme-secondary-text" />
                    Novidades da Orquestra
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {companyNews.filter(n => n.isVisible).length} novas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyNews.filter(n => n.isVisible).slice(0, 3).map((news, index) => (
                  <div key={news.id} className={`${index > 0 ? 'pt-4 border-t' : ''}`}>
                    <div className="flex gap-3">
                      {news.imageUrl && (
                        <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={news.imageUrl} 
                            alt={news.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{news.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{news.summary}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(news.publishedAt).toLocaleDateString('pt-BR')}</span>
                          <Badge className={
                            news.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            news.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          } variant="outline">
                            {news.priority === 'urgent' ? 'Urgente' :
                             news.priority === 'high' ? 'Importante' : 'Novidade'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="ghost" className="w-full mt-4 text-sm">
                  Ver todas as novidades
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 theme-primary-text" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableModules.filter(m => m.isActive).map((module) => {
                  const Icon = module.icon;
                  return (
                    <Link key={module.id} href={`/${module.id}`}>
                      <Button variant="outline" className="w-full justify-start hover-lift">
                        <Icon className="w-4 h-4 mr-2" />
                        {module.name}
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Suporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  Precisa de ajuda? Nossa equipe está sempre disponível.
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat ao Vivo
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Base de Conhecimento
                  </Button>
                </div>
                <div className="pt-3 border-t text-center">
                  <div className="text-xs text-gray-500 mb-1">Powered by</div>
                  <div className="text-sm font-semibold theme-primary-text">Orquestra Platform</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}