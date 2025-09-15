import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator as CalculatorIcon,
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Info,
  RefreshCw,
  Download
} from 'lucide-react';
import { Link } from 'wouter';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";

interface NPSData {
  score: number;
  responses: number;
}

export default function NPSCalculator() {
  const [responses, setResponses] = useState<NPSData[]>(
    Array.from({ length: 11 }, (_, i) => ({ score: i, responses: 0 }))
  );
  
  const [totalResponses, setTotalResponses] = useState(0);

  // Cálculos em tempo real
  const npsResults = useMemo(() => {
    const total = responses.reduce((sum, item) => sum + item.responses, 0);
    
    if (total === 0) {
      return {
        nps: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promotersCount: 0,
        passivesCount: 0,
        detractorsCount: 0,
        promotersPct: 0,
        passivesPct: 0,
        detractorsPct: 0,
        marginError: 0,
        total: 0
      };
    }

    // Contagem por categoria
    const detractorsCount = responses.slice(0, 7).reduce((sum, item) => sum + item.responses, 0); // 0-6
    const passivesCount = responses.slice(7, 9).reduce((sum, item) => sum + item.responses, 0); // 7-8
    const promotersCount = responses.slice(9, 11).reduce((sum, item) => sum + item.responses, 0); // 9-10

    // Percentuais
    const promotersPct = (promotersCount / total) * 100;
    const passivesPct = (passivesCount / total) * 100;
    const detractorsPct = (detractorsCount / total) * 100;

    // NPS Score
    const nps = promotersPct - detractorsPct;

    // Margem de erro (95% de confiança)
    const p = promotersPct / 100;
    const q = detractorsPct / 100;
    const marginError = total > 0 ? 1.96 * Math.sqrt((p * (1 - p) + q * (1 - q)) / total) * 100 : 0;

    return {
      nps: Math.round(nps * 10) / 10,
      promoters: promotersCount,
      passives: passivesCount,
      detractors: detractorsCount,
      promotersCount,
      passivesCount,
      detractorsCount,
      promotersPct: Math.round(promotersPct * 10) / 10,
      passivesPct: Math.round(passivesPct * 10) / 10,
      detractorsPct: Math.round(detractorsPct * 10) / 10,
      marginError: Math.round(marginError * 100) / 100,
      total
    };
  }, [responses]);

  // Atualizar uma resposta específica
  const updateResponse = (score: number, value: number) => {
    setResponses(prev => 
      prev.map(item => 
        item.score === score 
          ? { ...item, responses: Math.max(0, value) }
          : item
      )
    );
  };

  // Limpar todos os valores
  const clearAll = () => {
    setResponses(prev => prev.map(item => ({ ...item, responses: 0 })));
    setTotalResponses(0);
  };

  // Dados para gráfico de distribuição
  const distributionData = responses.map(item => ({
    score: item.score,
    responses: item.responses,
    percentage: npsResults.total > 0 ? (item.responses / npsResults.total) * 100 : 0,
    fill: getScoreColor(item.score)
  }));

  // Dados para gráfico de pizza
  const pieData = [
    { name: 'Promotores', value: npsResults.promotersCount, color: '#10b981', percentage: npsResults.promotersPct },
    { name: 'Neutros', value: npsResults.passivesCount, color: '#f59e0b', percentage: npsResults.passivesPct },
    { name: 'Detratores', value: npsResults.detractorsCount, color: '#ef4444', percentage: npsResults.detractorsPct }
  ];

  function getScoreColor(score: number) {
    if (score >= 9) return '#10b981'; // Verde - Promotores
    if (score >= 7) return '#f59e0b'; // Amarelo - Neutros
    return '#ef4444'; // Vermelho - Detratores
  }

  function getNpsColor(score: number) {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-green-500';
    if (score >= 0) return 'text-yellow-600';
    if (score >= -50) return 'text-orange-600';
    return 'text-red-600';
  }

  function getNpsLabel(score: number) {
    if (score >= 70) return 'Excelente';
    if (score >= 50) return 'Muito Bom';
    if (score >= 0) return 'Bom';
    if (score >= -50) return 'Regular';
    return 'Crítico';
  }

  // Dados de exemplo rápidos
  const loadSampleData = () => {
    const sampleData = [
      { score: 0, responses: 5 },
      { score: 1, responses: 3 },
      { score: 2, responses: 2 },
      { score: 3, responses: 4 },
      { score: 4, responses: 6 },
      { score: 5, responses: 8 },
      { score: 6, responses: 12 },
      { score: 7, responses: 25 },
      { score: 8, responses: 30 },
      { score: 9, responses: 45 },
      { score: 10, responses: 60 }
    ];
    setResponses(sampleData);
  };

  const chartConfig: ChartConfig = {
    responses: {
      label: "Respostas",
      color: "hsl(221.2, 83.2%, 53.3%)",
    },
  };

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
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <CalculatorIcon className="w-8 h-8 mr-3 text-blue-600" />
                  Calculadora NPS
                </h1>
                <p className="text-gray-600 mt-1">
                  Calcule seu Net Promoter Score de forma rápida e precisa
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadSampleData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Dados Exemplo
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Limpar Tudo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Entrada de Dados */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Insira o Número de Respostas
              </CardTitle>
              <p className="text-sm text-gray-600">
                Digite quantas pessoas deram cada nota de 0 a 10
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {responses.map(({ score, responses: count }) => (
                  <div key={score} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center"
                        style={{ backgroundColor: getScoreColor(score) }}
                      >
                        {score}
                      </div>
                      <Label className="font-medium">
                        Nota {score}
                        {score >= 9 && <Badge className="ml-2 bg-green-100 text-green-800">Promotor</Badge>}
                        {score >= 7 && score <= 8 && <Badge className="ml-2 bg-yellow-100 text-yellow-800">Neutro</Badge>}
                        {score <= 6 && <Badge className="ml-2 bg-red-100 text-red-800">Detrator</Badge>}
                      </Label>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="999999"
                      value={count || ''}
                      onChange={(e) => updateResponse(score, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Total de Respostas:</span>
                  <span className="text-2xl font-bold text-blue-600">{npsResults.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Resultado NPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {npsResults.total === 0 ? (
                <div className="text-center py-12">
                  <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Insira os dados para calcular
                  </h3>
                  <p className="text-gray-600">
                    Digite o número de respostas para cada nota e veja os resultados em tempo real
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* NPS Principal */}
                  <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="mb-4">
                      <div className={`text-6xl font-bold ${getNpsColor(npsResults.nps)}`}>
                        {npsResults.nps > 0 ? '+' : ''}{npsResults.nps}
                      </div>
                      <div className="text-xl text-gray-600 mt-2">Net Promoter Score</div>
                      <Badge 
                        className={`mt-2 ${
                          npsResults.nps >= 50 ? 'bg-green-100 text-green-800' :
                          npsResults.nps >= 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {getNpsLabel(npsResults.nps)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Margem de Erro: ±{npsResults.marginError}% (95% confiança)
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">{npsResults.promoters}</div>
                      <div className="text-sm text-green-700">Promotores</div>
                      <div className="text-xs text-gray-600">{npsResults.promotersPct}%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-yellow-50">
                      <div className="text-2xl font-bold text-yellow-600">{npsResults.passives}</div>
                      <div className="text-sm text-yellow-700">Neutros</div>
                      <div className="text-xs text-gray-600">{npsResults.passivesPct}%</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-red-50">
                      <div className="text-2xl font-bold text-red-600">{npsResults.detractors}</div>
                      <div className="text-sm text-red-700">Detratores</div>
                      <div className="text-xs text-gray-600">{npsResults.detractorsPct}%</div>
                    </div>
                  </div>

                  {/* Fórmula */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Cálculo do NPS
                    </h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>NPS = % Promotores - % Detratores</p>
                      <p>NPS = {npsResults.promotersPct}% - {npsResults.detractorsPct}% = <strong>{npsResults.nps}</strong></p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {npsResults.total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            
            {/* Gráfico de Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Distribuição de Respostas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-md">
                              <p className="font-semibold">Nota: {label}</p>
                              <p>Respostas: {data.responses}</p>
                              <p>Percentual: {data.percentage.toFixed(1)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={6.5} stroke="#666" strokeDasharray="2 2" />
                    <ReferenceLine x={8.5} stroke="#666" strokeDasharray="2 2" />
                    <Bar dataKey="responses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-md">
                                <p className="font-semibold">{data.name}</p>
                                <p>Quantidade: {data.value}</p>
                                <p>Percentual: {data.percentage.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        content={({ payload }) => (
                          <div className="flex justify-center gap-4 mt-4">
                            {payload?.map((entry, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações Adicionais */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Interpretar o NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">70 a 100</div>
                <div className="font-semibold text-green-700">Excelente</div>
                <div className="text-sm text-gray-600 mt-2">
                  Clientes extremamente satisfeitos e leais
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-green-500 mb-2">50 a 69</div>
                <div className="font-semibold text-green-600">Muito Bom</div>
                <div className="text-sm text-gray-600 mt-2">
                  Boa base de clientes promotores
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">0 a 49</div>
                <div className="font-semibold text-yellow-700">Bom</div>
                <div className="text-sm text-gray-600 mt-2">
                  Há espaço para melhorias
                </div>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">-100 a -1</div>
                <div className="font-semibold text-red-700">Crítico</div>
                <div className="text-sm text-gray-600 mt-2">
                  Necessita ação imediata
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Sobre a Classificação:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Promotores (9-10):</strong> Clientes leais que recomendam sua empresa</li>
                <li><strong>Neutros (7-8):</strong> Clientes satisfeitos mas não entusiasmados</li>
                <li><strong>Detratores (0-6):</strong> Clientes insatisfeitos que podem prejudicar sua marca</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}