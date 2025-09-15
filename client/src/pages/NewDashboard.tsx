import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Trophy, 
  ChevronRight, 
  Activity,
  Brain,
  Gamepad2,
  Calendar,
  Bell,
  Star,
  Target,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Link } from 'wouter';

export default function NewDashboard() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();

  if (!user || !currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Dados para demonstração - agora mais realistas
  const stats = [
    { 
      title: 'Trilhas Ativas', 
      value: '12', 
      change: '+23%', 
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Progresso Geral', 
      value: '78%', 
      change: '+15%', 
      icon: TrendingUp,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Usuários Ativos', 
      value: '2,847', 
      change: '+12%', 
      icon: Users,
      color: 'text-blue-800',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Conquistas', 
      value: '156', 
      change: '+8%', 
      icon: Trophy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  // Dados para gráficos
  const monthlyData = [
    { month: 'Jan', usuarios: 1200, trilhas: 8, conquistas: 89 },
    { month: 'Fev', usuarios: 1800, trilhas: 10, conquistas: 112 },
    { month: 'Mar', usuarios: 2100, trilhas: 12, conquistas: 134 },
    { month: 'Abr', usuarios: 2400, trilhas: 15, conquistas: 156 },
    { month: 'Mai', usuarios: 2700, trilhas: 18, conquistas: 178 },
    { month: 'Jun', usuarios: 2847, trilhas: 20, conquistas: 201 }
  ];

  const productUsageData = [
    { name: 'Business Quest', value: 45, color: 'hsl(221.2, 83.2%, 53.3%)' },
    { name: 'Conselho Digital', value: 35, color: 'hsl(212, 95%, 68%)' },
    { name: 'Vinhonários', value: 20, color: 'hsl(216, 87%, 45%)' }
  ];

  const chartConfig: ChartConfig = {
    usuarios: {
      label: "Usuários",
      color: "hsl(221.2, 83.2%, 53.3%)",
    },
    trilhas: {
      label: "Trilhas",
      color: "hsl(212, 95%, 68%)",
    },
    conquistas: {
      label: "Conquistas", 
      color: "hsl(216, 87%, 45%)",
    },
  };

  const orquestraProducts = [
    {
      title: 'Business Quest',
      description: 'Simulador de negócios interativo',
      icon: Gamepad2,
      path: '/businessquest',
      color: 'from-blue-500 to-indigo-600',
      progress: 85,
      users: '1,234'
    },
    {
      title: 'Conselho Digital',
      description: 'Jornada CVO',
      icon: Brain,
      path: '/conselho-digital',
      color: 'from-purple-500 to-pink-600',
      progress: 92,
      users: '567'
    }
  ];

  const recentActivity = [
    { type: 'achievement', message: 'Nova conquista desbloqueada: "Expert em ESG"', time: '2h atrás' },
    { type: 'learning', message: 'Trilha "Governança Corporativa" concluída', time: '5h atrás' },
    { type: 'community', message: 'Nova discussão em "Inovação e Estratégia"', time: '1d atrás' },
    { type: 'business', message: 'Simulação BusinessQuest iniciada', time: '2d atrás' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Bem-vindo à Plataforma Orquestra
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              Olá, {user.firstName}! Gerencie seu ecossistema de aprendizado e negócios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                {stats.find(s => s.title === 'Usuários Ativos')?.value} usuários ativos
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Target className="w-4 h-4 mr-2" />
                Plataforma Multi-Tenant
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                        <span className="text-sm text-gray-500">vs mês anterior</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    axisLine={false}
                    className="text-sm"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    className="text-sm"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="hsl(221.2, 83.2%, 53.3%)" 
                    fillOpacity={1} 
                    fill="url(#colorUsuarios)" 
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Product Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Uso dos Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={productUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {productUsageData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Produtos Orquestra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Produtos da Plataforma Orquestra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orquestraProducts.map((product, index) => {
                    const Icon = product.icon;
                    return (
                      <div key={index} className="relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                        <div className={`h-2 bg-gradient-to-r ${product.color}`}></div>
                        <div className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${product.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{product.title}</h3>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Adoção</span>
                              <span className="text-sm font-medium">{product.progress}%</span>
                            </div>
                            <Progress value={product.progress} className="h-2" />
                            
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Usuários ativos</span>
                              <span className="font-medium">{product.users}</span>
                            </div>
                          </div>
                          
                          <Link href={product.path}>
                            <Button className="w-full">
                              Acessar Produto
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

            {/* Learning Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Visão Geral do Aprendizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Trilhas em Progresso</h3>
                      <p className="text-sm text-gray-600">3 trilhas ativas com 78% de conclusão média</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Trilhas
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Comunidades</h3>
                      <p className="text-sm text-gray-600">Participando de 5 grupos de discussão</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Explorar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/businessquest">
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Iniciar Business Quest
                  </Button>
                </Link>
                
                <Link href="/conselho-digital">
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Conselho Digital
                  </Button>
                </Link>
                
                <Link href="/trails">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Nova Trilha
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full mt-4 text-sm">
                  Ver todas as atividades
                </Button>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Seu Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Nível Atual</span>
                      <span className="text-sm font-medium">Expert</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Pontos</span>
                      <span className="text-sm font-medium">12,450</span>
                    </div>
                    <p className="text-xs text-gray-500">550 pontos para próximo nível</p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">#12</div>
                      <div className="text-xs text-gray-600">Ranking Geral</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}