import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Send, 
  Pause, 
  Play, 
  BarChart3, 
  Users, 
  Mail,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  Download,
  Share2,
  Copy,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SurveyDetails() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockSurvey = {
    id: surveyId,
    name: 'NPS Pós-Compra 2024',
    description: 'Pesquisa de satisfação para clientes que realizaram compras nos últimos 30 dias',
    status: 'active',
    createdAt: '2024-11-01',
    updatedAt: '2024-12-01',
    objective: 'satisfaction',
    targetAudience: 'recent_buyers',
    tags: ['pós-compra', 'satisfação', 'q4-2024'],
    
    // Statistics
    stats: {
      totalInvitations: 1250,
      totalResponses: 324,
      responseRate: 25.9,
      nps: 45,
      marginError: 8,
      promoters: 146,
      passives: 89,
      detractors: 89,
      promotersPct: 45.1,
      passivesPct: 27.5,
      detractorsPct: 27.5,
      averageCompletionTime: 180
    },
    
    // Questions
    questions: [
      {
        id: '1',
        type: 'nps',
        text: 'Em uma escala de 0 a 10, o quanto você recomendaria nosso produto/serviço para um amigo ou colega?',
        required: true,
        weight: 1,
        responses: 324
      },
      {
        id: '2',
        type: 'text',
        text: 'O que mais gostou em sua experiência de compra?',
        required: false,
        responses: 287
      },
      {
        id: '3',
        type: 'text',
        text: 'Como podemos melhorar nosso produto/serviço?',
        required: false,
        responses: 201
      }
    ],

    // Distribution channels
    channels: [
      { type: 'email', enabled: true, sent: 1000, delivered: 985, opened: 456 },
      { type: 'sms', enabled: false, sent: 0 },
      { type: 'link', enabled: true, clicks: 250 }
    ],

    // Settings
    settings: {
      useWeightedIndex: false,
      anonymousResponses: true,
      requiresAuth: false,
      allowPartialResponses: true,
      showProgressBar: true,
      reminderEnabled: true,
      reminderDays: 3
    }
  };

  // Trend data for last 30 days
  const trendData = [
    { date: '01/12', responses: 8, nps: 42 },
    { date: '02/12', responses: 12, nps: 44 },
    { date: '03/12', responses: 15, nps: 46 },
    { date: '04/12', responses: 18, nps: 43 },
    { date: '05/12', responses: 22, nps: 45 },
    { date: '06/12', responses: 19, nps: 47 },
    { date: '07/12', responses: 25, nps: 45 }
  ];

  // Response distribution by score
  const scoreDistribution = [
    { score: 0, count: 5 },
    { score: 1, count: 8 },
    { score: 2, count: 12 },
    { score: 3, count: 15 },
    { score: 4, count: 18 },
    { score: 5, count: 22 },
    { score: 6, count: 19 },
    { score: 7, count: 35 },
    { score: 8, count: 54 },
    { score: 9, count: 89 },
    { score: 10, count: 57 }
  ];

  const chartConfig: ChartConfig = {
    nps: {
      label: "NPS",
      color: "hsl(221.2, 83.2%, 53.3%)",
    },
    responses: {
      label: "Respostas",
      color: "hsl(212, 95%, 68%)",
    },
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSurvey(mockSurvey);
      setLoading(false);
    }, 1000);
  }, [surveyId]);

  const getNpsColor = (nps: number) => {
    if (nps >= 70) return 'text-green-600';
    if (nps >= 50) return 'text-blue-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/survey/public/${surveyId}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado para área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Pesquisa não encontrada</h3>
        <p className="text-gray-600 mb-4">A pesquisa solicitada não existe ou foi removida.</p>
        <Link href="/nps">
          <Button>Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/nps">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{survey.name}</h1>
                  <Badge className={getStatusColor(survey.status)}>
                    {survey.status === 'active' && 'Ativa'}
                    {survey.status === 'paused' && 'Pausada'}
                    {survey.status === 'completed' && 'Finalizada'}
                    {survey.status === 'draft' && 'Rascunho'}
                  </Badge>
                </div>
                <p className="text-gray-600">{survey.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Criada em {format(new Date(survey.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  <span>•</span>
                  <span>{survey.stats.totalResponses} respostas</span>
                  <span>•</span>
                  <span>Taxa: {survey.stats.responseRate}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyShareLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              
              {survey.status === 'active' ? (
                <Button variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              ) : (
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Ativar
                </Button>
              )}
              
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="responses">Respostas</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NPS Score</p>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-bold ${getNpsColor(survey.stats.nps)}`}>
                          {survey.stats.nps}
                        </p>
                        <span className="text-sm text-gray-500">±{survey.stats.marginError}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Resposta</p>
                      <p className="text-3xl font-bold text-gray-900">{survey.stats.responseRate}%</p>
                      <p className="text-sm text-gray-500">{survey.stats.totalResponses} de {survey.stats.totalInvitations}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promotores</p>
                      <p className="text-3xl font-bold text-green-600">{survey.stats.promotersPct}%</p>
                      <p className="text-sm text-gray-500">{survey.stats.promoters} pessoas</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                      <p className="text-3xl font-bold text-gray-900">{Math.floor(survey.stats.averageCompletionTime / 60)}'</p>
                      <p className="text-sm text-gray-500">{survey.stats.averageCompletionTime}s total</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* NPS Trend */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tendência NPS (últimos 7 dias)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} domain={[-100, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                      <Area 
                        type="monotone" 
                        dataKey="nps" 
                        stroke="hsl(221.2, 83.2%, 53.3%)" 
                        fill="url(#npsGradient)" 
                      />
                      <defs>
                        <linearGradient id="npsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={scoreDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="score" 
                        tickLine={false} 
                        axisLine={false}
                        width={20}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(221.2, 83.2%, 53.3%)"
                        radius={[0, 2, 2, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-800">{survey.stats.promoters}</p>
                      <p className="text-sm text-green-700">Promotores (9-10)</p>
                      <p className="text-xs text-green-600">{survey.stats.promotersPct}% do total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-800">{survey.stats.passives}</p>
                      <p className="text-sm text-yellow-700">Neutros (7-8)</p>
                      <p className="text-xs text-yellow-600">{survey.stats.passivesPct}% do total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-800">{survey.stats.detractors}</p>
                      <p className="text-sm text-red-700">Detratores (0-6)</p>
                      <p className="text-xs text-red-600">{survey.stats.detractorsPct}% do total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Respostas Individuais</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Buscar respostas..." className="pl-9 w-64" />
                </div>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filtro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="promoters">Promotores</SelectItem>
                    <SelectItem value="passives">Neutros</SelectItem>
                    <SelectItem value="detractors">Detratores</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Data/Hora</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">NPS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Feedback</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Canal</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 10 }, (_, i) => {
                        const scores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
                        const score = scores[i % scores.length];
                        const category = score >= 9 ? 'Promotor' : score >= 7 ? 'Neutro' : 'Detrator';
                        const categoryColor = score >= 9 ? 'text-green-600' : score >= 7 ? 'text-yellow-600' : 'text-red-600';
                        
                        return (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm">
                              {format(new Date(Date.now() - i * 86400000), "dd/MM HH:mm", { locale: ptBR })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-bold text-lg ${categoryColor}`}>
                                {score}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm max-w-xs truncate">
                              {i % 3 === 0 && "Produto excelente, superou minhas expectativas!"}
                              {i % 3 === 1 && "Bom produto, mas pode melhorar no atendimento."}
                              {i % 3 === 2 && ""}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant="outline" 
                                className={categoryColor}
                              >
                                {category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-sm">
                              {i % 2 === 0 ? (
                                <Mail className="w-4 h-4 mx-auto text-blue-500" />
                              ) : (
                                <Eye className="w-4 h-4 mx-auto text-gray-500" />
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canais de Distribuição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {survey.channels.map((channel: any) => (
                    <div key={channel.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {channel.type === 'email' && <Mail className="w-5 h-5 text-blue-500" />}
                        {channel.type === 'sms' && <MessageSquare className="w-5 h-5 text-green-500" />}
                        {channel.type === 'link' && <Eye className="w-5 h-5 text-gray-500" />}
                        
                        <div>
                          <p className="font-medium capitalize">
                            {channel.type === 'email' && 'E-mail'}
                            {channel.type === 'sms' && 'SMS'}
                            {channel.type === 'link' && 'Link Público'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {channel.enabled ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {channel.type === 'email' && (
                          <div>
                            <p className="font-medium">{channel.sent} enviados</p>
                            <p className="text-sm text-gray-500">{channel.opened} abertos</p>
                          </div>
                        )}
                        {channel.type === 'link' && (
                          <div>
                            <p className="font-medium">{channel.clicks} cliques</p>
                            <p className="text-sm text-gray-500">Link ativo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cronograma de Envios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Envio Inicial</p>
                        <p className="text-sm text-green-600">01/12/2024 às 09:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Primeiro Lembrete</p>
                        <p className="text-sm text-yellow-600">04/12/2024 às 14:00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Segundo Lembrete</p>
                        <p className="text-sm text-blue-600">07/12/2024 às 10:00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Lembrete Manual
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6 mt-6">
            <div className="space-y-4">
              {survey.questions.map((question: any, index: number) => (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <Badge variant={question.type === 'nps' ? 'default' : 'secondary'}>
                            {question.type.toUpperCase()}
                          </Badge>
                          {question.required && (
                            <Badge variant="outline" className="ml-2 text-red-600 border-red-600">
                              Obrigatória
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{question.responses} respostas</p>
                        <p className="text-sm text-gray-500">
                          {Math.round((question.responses / survey.stats.totalResponses) * 100)}% taxa
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-4">{question.text}</p>

                    {question.weight && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>Peso: {question.weight}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Pesquisa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Índice Ponderado</p>
                      <p className="text-sm text-gray-500">Cálculo adicional com pesos</p>
                    </div>
                    <Badge variant={survey.settings.useWeightedIndex ? 'default' : 'secondary'}>
                      {survey.settings.useWeightedIndex ? 'Ativado' : 'Desativado'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Respostas Anônimas</p>
                      <p className="text-sm text-gray-500">Permitir respostas sem identificação</p>
                    </div>
                    <Badge variant={survey.settings.anonymousResponses ? 'default' : 'secondary'}>
                      {survey.settings.anonymousResponses ? 'Permitido' : 'Não Permitido'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Autenticação Obrigatória</p>
                      <p className="text-sm text-gray-500">Login necessário para responder</p>
                    </div>
                    <Badge variant={survey.settings.requiresAuth ? 'default' : 'secondary'}>
                      {survey.settings.requiresAuth ? 'Obrigatória' : 'Opcional'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Respostas Parciais</p>
                      <p className="text-sm text-gray-500">Salvar progresso incompleto</p>
                    </div>
                    <Badge variant={survey.settings.allowPartialResponses ? 'default' : 'secondary'}>
                      {survey.settings.allowPartialResponses ? 'Permitido' : 'Não Permitido'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Barra de Progresso</p>
                      <p className="text-sm text-gray-500">Mostrar progresso durante preenchimento</p>
                    </div>
                    <Badge variant={survey.settings.showProgressBar ? 'default' : 'secondary'}>
                      {survey.settings.showProgressBar ? 'Visível' : 'Oculta'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Objetivo</Label>
                    <p className="text-gray-900 capitalize">{survey.objective}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Público-Alvo</Label>
                    <p className="text-gray-900">{survey.targetAudience}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {survey.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Última Atualização</Label>
                    <p className="text-gray-900">
                      {format(new Date(survey.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID da Pesquisa</Label>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{survey.id}</code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigator.clipboard.writeText(survey.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}