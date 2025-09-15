import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Users,
  MessageSquare,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  FileText,
  Mail,
  Presentation
} from 'lucide-react';
import { Link, useParams } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

export default function SurveyResults() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Mock comprehensive data
  const mockSurvey = {
    id: surveyId,
    name: 'NPS Pós-Compra 2024',
    status: 'active',
    
    // Advanced statistics
    stats: {
      totalResponses: 1247,
      nps: 42,
      marginError: 6,
      confidenceLevel: 95,
      promoters: 487,
      passives: 324,
      detractors: 436,
      promotersPct: 39.1,
      passivesPct: 26.0,
      detractorsPct: 34.9,
      weightedIndex: 67.5, // If using weighted calculation
      averageScore: 6.8,
      medianScore: 7,
      standardDeviation: 2.4,
      completionRate: 87.3,
      averageTimeToComplete: 145,
      
      // Trends
      npsChange: +3.2, // Change from previous period
      responseRateChange: -1.5,
      
      // Segments
      segmentBreakdown: {
        age: {
          '18-25': { nps: 52, responses: 234 },
          '26-35': { nps: 45, responses: 387 },
          '36-50': { nps: 38, responses: 421 },
          '50+': { nps: 35, responses: 205 }
        },
        channel: {
          email: { nps: 44, responses: 892 },
          sms: { nps: 39, responses: 155 },
          web: { nps: 41, responses: 200 }
        },
        region: {
          north: { nps: 48, responses: 287 },
          south: { nps: 39, responses: 342 },
          central: { nps: 41, responses: 618 }
        }
      }
    }
  };

  // Trend data for different periods
  const trendData = [
    { date: '01/11', nps: 38, responses: 45, promoters: 18, detractors: 15 },
    { date: '02/11', nps: 41, responses: 52, promoters: 22, detractors: 16 },
    { date: '03/11', nps: 39, responses: 48, promoters: 19, detractors: 18 },
    { date: '04/11', nps: 44, responses: 58, promoters: 26, detractors: 16 },
    { date: '05/11', nps: 42, responses: 61, promoters: 25, detractors: 19 },
    { date: '06/11', nps: 45, responses: 54, promoters: 24, detractors: 13 },
    { date: '07/11', nps: 43, responses: 49, promoters: 21, detractors: 15 },
    { date: '08/11', nps: 47, responses: 56, promoters: 28, detractors: 14 },
    { date: '09/11', nps: 41, responses: 63, promoters: 24, detractors: 20 },
    { date: '10/11', nps: 44, responses: 59, promoters: 26, detractors: 17 },
    { date: '11/11', nps: 46, responses: 67, promoters: 31, detractors: 16 },
    { date: '12/11', nps: 42, responses: 52, promoters: 22, detractors: 18 }
  ];

  // Score distribution
  const scoreDistribution = [
    { score: 0, count: 28, percentage: 2.2 },
    { score: 1, count: 35, percentage: 2.8 },
    { score: 2, count: 42, percentage: 3.4 },
    { score: 3, count: 58, percentage: 4.7 },
    { score: 4, count: 67, percentage: 5.4 },
    { score: 5, count: 89, percentage: 7.1 },
    { score: 6, count: 117, percentage: 9.4 },
    { score: 7, count: 156, percentage: 12.5 },
    { score: 8, count: 168, percentage: 13.5 },
    { score: 9, count: 234, percentage: 18.8 },
    { score: 10, count: 253, percentage: 20.3 }
  ];

  // Feedback analysis (mock sentiment analysis)
  const feedbackAnalysis = {
    totalFeedbacks: 892,
    sentimentBreakdown: {
      positive: { count: 487, percentage: 54.6, keywords: ['excelente', 'ótimo', 'recomendo', 'satisfeito'] },
      neutral: { count: 234, percentage: 26.2, keywords: ['bom', 'ok', 'regular', 'normal'] },
      negative: { count: 171, percentage: 19.2, keywords: ['ruim', 'problema', 'insatisfeito', 'demorado'] }
    },
    topKeywords: [
      { word: 'atendimento', count: 156, sentiment: 'positive' },
      { word: 'produto', count: 134, sentiment: 'positive' },
      { word: 'entrega', count: 98, sentiment: 'negative' },
      { word: 'preço', count: 87, sentiment: 'neutral' },
      { word: 'qualidade', count: 76, sentiment: 'positive' }
    ],
    categories: [
      { category: 'Atendimento', count: 234, avgScore: 8.2 },
      { category: 'Produto', count: 198, avgScore: 7.9 },
      { category: 'Entrega', count: 156, avgScore: 6.1 },
      { category: 'Preço', count: 143, avgScore: 6.8 },
      { category: 'Site/App', count: 89, avgScore: 7.5 }
    ]
  };

  const chartConfig: ChartConfig = {
    nps: { label: "NPS", color: "hsl(221.2, 83.2%, 53.3%)" },
    responses: { label: "Respostas", color: "hsl(212, 95%, 68%)" },
    promoters: { label: "Promotores", color: "hsl(142.1, 76.2%, 36.3%)" },
    detractors: { label: "Detratores", color: "hsl(0, 84.2%, 60.2%)" }
  };

  useEffect(() => {
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

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const exportResults = (format: string) => {
    // TODO: Implement export functionality
    alert(`Exportando resultados em formato ${format}...`);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/nps/surveys/${surveyId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Resultados - {survey.name}
                </h1>
                <p className="text-gray-600">
                  Análise detalhada dos resultados da pesquisa NPS
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="all">Tudo</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => exportResults('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              
              <Button variant="outline" onClick={() => exportResults('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              
              <Button variant="outline">
                <Presentation className="w-4 h-4 mr-2" />
                Apresentação
              </Button>
              
              <Button>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="segments">Segmentos</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="analysis">Análises</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                        <div className="flex items-center gap-1">
                          {getTrendIcon(survey.stats.npsChange)}
                          <span className="text-sm text-gray-500">
                            {survey.stats.npsChange > 0 ? '+' : ''}{survey.stats.npsChange}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ±{survey.stats.marginError} ({survey.stats.confidenceLevel}% confiança)
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Respostas</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {survey.stats.totalResponses.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {survey.stats.completionRate}% completude
                      </p>
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
                      <p className="text-3xl font-bold text-green-600">
                        {survey.stats.promotersPct}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {survey.stats.promoters} pessoas
                      </p>
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
                      <p className="text-sm font-medium text-gray-600">Índice Ponderado</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {survey.stats.weightedIndex}
                      </p>
                      <p className="text-sm text-gray-500">Análise interna</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistical Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Distribuição de Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p className="font-medium">Nota {label}</p>
                                <p className="text-blue-600">{data.count} respostas</p>
                                <p className="text-gray-500">{data.percentage}% do total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill={(entry: any) => {
                          const score = entry?.score || 0;
                          if (score >= 9) return 'hsl(142.1, 76.2%, 36.3%)';
                          if (score >= 7) return 'hsl(47.9, 95.8%, 53.1%)';
                          return 'hsl(0, 84.2%, 60.2%)';
                        }}
                        radius={[2, 2, 0, 0]}
                      />
                      <ReferenceLine x={6.5} stroke="#666" strokeDasharray="2 2" />
                      <ReferenceLine x={8.5} stroke="#666" strokeDasharray="2 2" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Média</span>
                    <span className="font-semibold">{survey.stats.averageScore}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mediana</span>
                    <span className="font-semibold">{survey.stats.medianScore}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desvio Padrão</span>
                    <span className="font-semibold">{survey.stats.standardDeviation}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo Médio</span>
                    <span className="font-semibold">{Math.floor(survey.stats.averageTimeToComplete / 60)}'</span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Promotores</span>
                        </div>
                        <span className="text-sm font-medium">{survey.stats.promotersPct}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Neutros</span>
                        </div>
                        <span className="text-sm font-medium">{survey.stats.passivesPct}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Detratores</span>
                        </div>
                        <span className="text-sm font-medium">{survey.stats.detractorsPct}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do NPS ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-100, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                    <ReferenceLine y={50} stroke="#10b981" strokeDasharray="2 2" label="Excelente" />
                    <Line 
                      type="monotone" 
                      dataKey="nps" 
                      stroke="hsl(221.2, 83.2%, 53.3%)" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(221.2, 83.2%, 53.3%)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Promotores vs Detratores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="promoters" 
                        stackId="1"
                        stroke="hsl(142.1, 76.2%, 36.3%)" 
                        fill="hsl(142.1, 76.2%, 36.3%)"
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="detractors" 
                        stackId="2"
                        stroke="hsl(0, 84.2%, 60.2%)" 
                        fill="hsl(0, 84.2%, 60.2%)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume de Respostas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="responses" 
                        fill="hsl(212, 95%, 68%)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Por Faixa Etária</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(survey.stats.segmentBreakdown.age).map(([age, data]: [string, any]) => (
                    <div key={age} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{age} anos</p>
                        <p className="text-sm text-gray-500">{data.responses} respostas</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getNpsColor(data.nps)}`}>{data.nps}</p>
                        <p className="text-xs text-gray-500">NPS</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Por Canal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(survey.stats.segmentBreakdown.channel).map(([channel, data]: [string, any]) => (
                    <div key={channel} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {channel === 'sms' && <MessageSquare className="w-4 h-4 text-green-500" />}
                        {channel === 'web' && <Users className="w-4 h-4 text-purple-500" />}
                        <div>
                          <p className="font-medium capitalize">{channel}</p>
                          <p className="text-sm text-gray-500">{data.responses} respostas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getNpsColor(data.nps)}`}>{data.nps}</p>
                        <p className="text-xs text-gray-500">NPS</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Por Região</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(survey.stats.segmentBreakdown.region).map(([region, data]: [string, any]) => (
                    <div key={region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{region}</p>
                        <p className="text-sm text-gray-500">{data.responses} respostas</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getNpsColor(data.nps)}`}>{data.nps}</p>
                        <p className="text-xs text-gray-500">NPS</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Sentimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">Positivo</p>
                          <p className="text-sm text-green-600">
                            {feedbackAnalysis.sentimentBreakdown.positive.count} comentários
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {feedbackAnalysis.sentimentBreakdown.positive.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-yellow-800">Neutro</p>
                          <p className="text-sm text-yellow-600">
                            {feedbackAnalysis.sentimentBreakdown.neutral.count} comentários
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">
                          {feedbackAnalysis.sentimentBreakdown.neutral.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">Negativo</p>
                          <p className="text-sm text-red-600">
                            {feedbackAnalysis.sentimentBreakdown.negative.count} comentários
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {feedbackAnalysis.sentimentBreakdown.negative.percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Palavras-Chave Mais Citadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedbackAnalysis.topKeywords.map((keyword, index) => (
                      <div key={keyword.word} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{keyword.word}</span>
                          <Badge 
                            variant="outline"
                            className={
                              keyword.sentiment === 'positive' 
                                ? 'text-green-600 border-green-600' 
                                : keyword.sentiment === 'negative'
                                  ? 'text-red-600 border-red-600'
                                  : 'text-yellow-600 border-yellow-600'
                            }
                          >
                            {keyword.sentiment}
                          </Badge>
                        </div>
                        <span className="font-medium">{keyword.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feedback por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {feedbackAnalysis.categories.map((category) => (
                    <div key={category.category} className="text-center p-4 border rounded-lg">
                      <p className="font-semibold text-gray-900">{category.category}</p>
                      <p className="text-2xl font-bold text-blue-600 my-2">{category.avgScore}</p>
                      <p className="text-sm text-gray-500">{category.count} menções</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Correlação Tempo vs NPS</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ScatterChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="responses" name="Respostas" />
                      <YAxis dataKey="nps" name="NPS" />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border rounded shadow">
                                <p>NPS: {payload[0].payload.nps}</p>
                                <p>Respostas: {payload[0].payload.responses}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        dataKey="nps" 
                        fill="hsl(221.2, 83.2%, 53.3%)" 
                      />
                    </ScatterChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análise Radar - Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <RadarChart data={feedbackAnalysis.categories}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={60}
                        domain={[0, 10]}
                        tick={{ fontSize: 10 }}
                      />
                      <Radar 
                        dataKey="avgScore" 
                        stroke="hsl(221.2, 83.2%, 53.3%)"
                        fill="hsl(221.2, 83.2%, 53.3%)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <ChartTooltip />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Insights e Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Pontos Fortes
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Alta satisfação com atendimento (8.2/10)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Qualidade do produto bem avaliada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                        <span>Público jovem (18-25) muito satisfeito</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Oportunidades de Melhoria
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                        <span>Entrega precisa de atenção especial (6.1/10)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                        <span>Percepção de preço pode melhorar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></div>
                        <span>Público 50+ menos engajado</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Relatório Executivo</h3>
                      <p className="text-sm text-gray-500">Resumo para liderança</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Sumário executivo com principais métricas, insights e recomendações estratégicas.
                  </p>
                  <Button variant="outline" className="w-full">
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Análise Detalhada</h3>
                      <p className="text-sm text-gray-500">Relatório completo</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Análise completa com todos os gráficos, segmentações e dados estatísticos.
                  </p>
                  <Button variant="outline" className="w-full">
                    Gerar Análise
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Presentation className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Apresentação</h3>
                      <p className="text-sm text-gray-500">Slides para reunião</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Apresentação em slides pronta para reuniões e apresentações executivas.
                  </p>
                  <Button variant="outline" className="w-full">
                    Gerar Slides
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personalizar Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Período</Label>
                    <Select defaultValue="current">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Período atual</SelectItem>
                        <SelectItem value="previous">Período anterior</SelectItem>
                        <SelectItem value="comparison">Comparação períodos</SelectItem>
                        <SelectItem value="custom">Período personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Formato</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="csv">CSV (dados)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Seções a incluir</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      'Resumo Executivo',
                      'Métricas Principais',
                      'Tendências',
                      'Segmentação',
                      'Análise de Feedback',
                      'Recomendações'
                    ].map((section) => (
                      <label key={section} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Observações adicionais</Label>
                  <Textarea 
                    placeholder="Adicione contexto ou observações especiais para incluir no relatório..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Relatório Personalizado
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar por Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}