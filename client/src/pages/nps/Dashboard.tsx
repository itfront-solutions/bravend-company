import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  BarChart3,
  MessageSquare,
  Mail,
  ExternalLink,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Link } from 'wouter';

export default function NpsDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados de exemplo para demonstração
  const mockStats = {
    totalSurveys: 12,
    totalResponses: 1247,
    averageNps: 42,
    marginError: 6,
    promoters: 487,
    passives: 324,
    detractors: 436,
    promotersPct: 39.1,
    passivesPct: 26.0,
    detractorsPct: 34.9,
    responseRate: 78.5
  };

  const mockSurveys = [
    {
      id: '1',
      name: 'NPS Pós-Compra 2024',
      status: 'active',
      responses: 324,
      nps: 45,
      margin: 8,
      createdAt: '2024-11-01',
      lastResponse: '2024-12-01'
    },
    {
      id: '2', 
      name: 'Satisfação Suporte Técnico',
      status: 'active',
      responses: 156,
      nps: 67,
      margin: 12,
      createdAt: '2024-10-15',
      lastResponse: '2024-11-30'
    },
    {
      id: '3',
      name: 'NPS Produto Premium',
      status: 'closed',
      responses: 89,
      nps: 23,
      margin: 15,
      createdAt: '2024-09-01',
      lastResponse: '2024-10-01'
    }
  ];

  const trendData = [
    { month: 'Jul', nps: 38, responses: 145 },
    { month: 'Ago', nps: 41, responses: 167 },
    { month: 'Set', nps: 39, responses: 198 },
    { month: 'Out', nps: 44, responses: 234 },
    { month: 'Nov', nps: 42, responses: 287 },
    { month: 'Dez', nps: 45, responses: 216 }
  ];

  const distributionData = [
    { name: 'Detratores', value: mockStats.detractorsPct, count: mockStats.detractors, color: '#ef4444' },
    { name: 'Neutros', value: mockStats.passivesPct, count: mockStats.passives, color: '#f59e0b' },
    { name: 'Promotores', value: mockStats.promotersPct, count: mockStats.promoters, color: '#10b981' }
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
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch surveys from API
        const response = await fetch('/api/nps/surveys', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSurveys(data.surveys || []);
          
          // Calculate overall stats from surveys
          const totalSurveys = data.surveys?.length || 0;
          const activeSurveys = data.surveys?.filter((s: any) => s.status === 'active').length || 0;
          const totalResponses = data.surveys?.reduce((acc: number, s: any) => acc + (s.totalResponses || 0), 0) || 0;
          
          // Calculate average NPS from active surveys
          const activeWithResponses = data.surveys?.filter((s: any) => s.status === 'active' && s.totalResponses > 0) || [];
          const averageNps = activeWithResponses.length > 0 
            ? Math.round(activeWithResponses.reduce((acc: number, s: any) => acc + (s.nps || 0), 0) / activeWithResponses.length)
            : 0;
          
          const calculatedStats = {
            totalSurveys,
            activeSurveys, 
            totalResponses,
            averageNps,
            marginError: 6, // Static for now
            responseRate: totalResponses > 0 ? 78.5 : 0, // Static for now
            promoters: Math.round(totalResponses * 0.39),
            passives: Math.round(totalResponses * 0.26),
            detractors: Math.round(totalResponses * 0.35),
            promotersPct: 39.1,
            passivesPct: 26.0,
            detractorsPct: 34.9
          };
          
          setOverallStats(calculatedStats);
        } else {
          // Fallback to mock data
          setSurveys(mockSurveys);
          setOverallStats(mockStats);
        }
      } catch (error) {
        console.error('Error fetching NPS data:', error);
        // Fallback to mock data
        setSurveys(mockSurveys);
        setOverallStats(mockStats);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getNpsColor = (nps: number) => {
    if (nps >= 70) return 'text-green-600';
    if (nps >= 50) return 'text-blue-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNpsBadgeColor = (nps: number) => {
    if (nps >= 70) return 'bg-green-100 text-green-800';
    if (nps >= 50) return 'bg-blue-100 text-blue-800'; 
    if (nps >= 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema NPS</h1>
              <p className="text-gray-600 mt-1">Gerencie pesquisas de satisfação e Net Promoter Score</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Link href="/nps/surveys/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Pesquisa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NPS Geral</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${getNpsColor(overallStats.averageNps)}`}>
                      {overallStats.averageNps}
                    </p>
                    <span className="text-sm text-gray-500">±{overallStats.marginError}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">n={overallStats.totalResponses}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Respostas</p>
                  <p className="text-3xl font-bold text-gray-900">{overallStats.totalResponses.toLocaleString()}</p>
                  <p className="text-sm text-green-600 font-medium">↑ {overallStats.responseRate}% taxa resposta</p>
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
                  <p className="text-sm font-medium text-gray-600">Pesquisas Ativas</p>
                  <p className="text-3xl font-bold text-gray-900">{surveys.filter(s => s.status === 'active').length}</p>
                  <p className="text-sm text-gray-500">de {overallStats.totalSurveys} total</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promotores</p>
                  <p className="text-3xl font-bold text-green-600">{overallStats.promotersPct}%</p>
                  <p className="text-sm text-gray-500">{overallStats.promoters} pessoas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* NPS Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tendência NPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    domain={[-100, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                  <ReferenceLine y={50} stroke="#10b981" strokeDasharray="2 2" label="Excelente" />
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

          {/* Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distributionData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.count} respostas</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        <Card>
          <CardHeader>
            <CardTitle>Pesquisas NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nome da Pesquisa</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Respostas</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">NPS</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Criada em</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{survey.name}</p>
                          <p className="text-sm text-gray-500">Última resposta: {new Date(survey.lastResponse).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                          {survey.status === 'active' ? 'Ativa' : 'Fechada'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium">{survey.responses}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold text-lg ${getNpsColor(survey.nps)}`}>
                            {survey.nps}
                          </span>
                          <span className="text-xs text-gray-500">±{survey.margin}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600">
                        {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <Link href={`/nps/surveys/${survey.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/nps/surveys/${survey.id}/results`}>
                            <Button variant="outline" size="sm">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Resultados
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}