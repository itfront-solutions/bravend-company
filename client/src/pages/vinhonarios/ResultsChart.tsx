import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Download, Users, Clock, Target } from 'lucide-react';
import { Link } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

interface TeamPerformance {
  name: string;
  totalScore: number;
  correctAnswers: number;
  avgResponseTime: number;
  participantCount: number;
}

interface QuestionAnalysis {
  id: number;
  question: string;
  difficulty: number;
  correctRate: number;
  avgTime: number;
  totalAttempts: number;
}

interface TimeAnalysis {
  round: string;
  time: string;
  totalScore: number;
  activeTeams: number;
}

export default function ResultsChart() {
  const [selectedChart, setSelectedChart] = useState<string>('team-performance');
  const [timeRange, setTimeRange] = useState<string>('all');

  // Mock data
  const teamPerformance: TeamPerformance[] = [
    { name: "Mesa 1 - Terroir", totalScore: 185, correctAnswers: 18, avgResponseTime: 8.5, participantCount: 4 },
    { name: "Mesa 2 - Harmonização", totalScore: 172, correctAnswers: 16, avgResponseTime: 12.3, participantCount: 3 },
    { name: "Mesa 3 - Envelhecimento", totalScore: 168, correctAnswers: 17, avgResponseTime: 7.8, participantCount: 4 },
    { name: "Mesa 4 - Degustação", totalScore: 156, correctAnswers: 14, avgResponseTime: 15.2, participantCount: 2 },
    { name: "Mesa 5 - Vinificação", totalScore: 143, correctAnswers: 13, avgResponseTime: 11.7, participantCount: 3 },
  ];

  const questionAnalysis: QuestionAnalysis[] = [
    { id: 1, question: "Região do Champagne", difficulty: 2, correctRate: 85, avgTime: 12.5, totalAttempts: 20 },
    { id: 2, question: "Uva do Chablis", difficulty: 4, correctRate: 65, avgTime: 18.3, totalAttempts: 20 },
    { id: 3, question: "Classificação Bordeaux", difficulty: 5, correctRate: 45, avgTime: 25.8, totalAttempts: 20 },
    { id: 4, question: "Harmonização Pinot Noir", difficulty: 3, correctRate: 70, avgTime: 15.2, totalAttempts: 20 },
    { id: 5, question: "Processo de Envelhecimento", difficulty: 4, correctRate: 60, avgTime: 20.1, totalAttempts: 20 },
  ];

  const timeAnalysis: TimeAnalysis[] = [
    { round: "Início", time: "14:00", totalScore: 0, activeTeams: 5 },
    { round: "Pergunta 1", time: "14:15", totalScore: 80, activeTeams: 5 },
    { round: "Pergunta 2", time: "14:30", totalScore: 145, activeTeams: 5 },
    { round: "Pergunta 3", time: "14:45", totalScore: 190, activeTeams: 4 },
    { round: "Pergunta 4", time: "15:00", totalScore: 235, activeTeams: 4 },
    { round: "Final", time: "15:15", totalScore: 290, activeTeams: 5 },
  ];

  const difficultyData = [
    { name: 'Fácil (1-2)', value: 25, color: '#10B981' },
    { name: 'Médio (3)', value: 35, color: '#F59E0B' },
    { name: 'Difícil (4-5)', value: 40, color: '#EF4444' },
  ];

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  const downloadReport = () => {
    // Em produção, geraria um relatório PDF ou Excel
    alert('Relatório baixado! (Funcionalidade simulada)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/vinhonarios/vinhos-visoes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                  Análise de Resultados
                </h1>
                <p className="text-gray-600 mt-1">Relatórios detalhados e insights do desempenho</p>
              </div>
            </div>
            <Button onClick={downloadReport} className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamPerformance.reduce((sum, team) => sum + team.participantCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(questionAnalysis.reduce((sum, q) => sum + q.correctRate, 0) / questionAnalysis.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(teamPerformance.reduce((sum, team) => sum + team.avgResponseTime, 0) / teamPerformance.length)}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Maior Pontuação</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(...teamPerformance.map(team => team.totalScore))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="questions">Perguntas</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Team Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pontuação por Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalScore" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Resposta Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgResponseTime" fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Comparativo Detalhado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Equipe</th>
                          <th className="text-center p-3 font-medium">Pontuação</th>
                          <th className="text-center p-3 font-medium">Acertos</th>
                          <th className="text-center p-3 font-medium">Tempo Médio</th>
                          <th className="text-center p-3 font-medium">Participantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamPerformance.map((team, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-3 font-medium">{team.name}</td>
                            <td className="p-3 text-center font-bold text-purple-600">
                              {team.totalScore}
                            </td>
                            <td className="p-3 text-center">{team.correctAnswers}</td>
                            <td className="p-3 text-center">{team.avgResponseTime}s</td>
                            <td className="p-3 text-center">{team.participantCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Analysis Tab */}
          <TabsContent value="questions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Acerto por Pergunta</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={questionAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value}%`,
                          'Taxa de Acerto'
                        ]}
                        labelFormatter={(label) => `Pergunta ${label}`}
                      />
                      <Bar dataKey="correctRate" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Dificuldade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip />
                      <RechartsPieChart data={difficultyData}>
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Análise Detalhada das Perguntas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questionAnalysis.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            {question.id}. {question.question}
                          </h4>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              question.difficulty <= 2 ? 'bg-green-100 text-green-700' :
                              question.difficulty <= 3 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Dificuldade: {question.difficulty}
                            </span>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                              {question.correctRate}% de acerto
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>Tempo médio: {question.avgTime}s</div>
                          <div>Tentativas: {question.totalAttempts}</div>
                          <div>Acertos: {Math.round(question.totalAttempts * question.correctRate / 100)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Pontuação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="totalScore" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🏆 Melhores Performances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Mesa mais rápida</h4>
                    <p className="text-sm text-yellow-700">
                      Mesa 3 - Envelhecimento com média de 7.8 segundos por resposta
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">Maior precisão</h4>
                    <p className="text-sm text-green-700">
                      Mesa 1 - Terroir com 18 acertos de 20 perguntas (90%)
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">Melhor pontuação</h4>
                    <p className="text-sm text-purple-700">
                      Mesa 1 - Terroir com 185 pontos totais
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Análises Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Pergunta mais difícil</h4>
                    <p className="text-sm text-blue-700">
                      "Classificação Bordeaux" com apenas 45% de acertos
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800">Tempo médio geral</h4>
                    <p className="text-sm text-orange-700">
                      11.1 segundos por resposta em todas as equipes
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800">Área de melhoria</h4>
                    <p className="text-sm text-red-700">
                      Perguntas de alta dificuldade (4-5) tiveram 52% de acerto médio
                    </p>
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