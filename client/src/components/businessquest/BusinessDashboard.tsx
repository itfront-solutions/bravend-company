import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Rocket, 
  Users, 
  DollarSign, 
  Lightbulb, 
  Lock, 
  CheckCircle, 
  Play,
  Clock,
  MessageCircle,
  AlertTriangle,
  Hammer,
  BarChart3,
  ChevronRight
} from "lucide-react";

export default function BusinessDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});

  // Mock data for now - in a real implementation, these would come from the API
  const gameInstance = {
    currentStage: 'traditional',
    currentQuarter: 1,
    currentYear: 2025,
    financialScore: 75,
    transformationScore: 35,
    leadershipScore: 68
  };

  const metrics = {
    digitalizationProgress: 35,
    employees: 342,
    profitMargin: 18.5,
    rdInvestment: 450000,
    npsScore: 67
  };

  const handleDecisionChange = (decisionType: string, value: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [decisionType]: value
    }));
  };

  const handleDecisionSubmit = (decisionType: string) => {
    const choice = selectedDecisions[decisionType];
    if (!choice) {
      toast({
        title: "Selecione uma opção",
        description: "Por favor, selecione uma opção antes de confirmar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Decisão registrada",
      description: "Sua decisão foi processada com sucesso!",
    });
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                <Hammer className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MetalBrasil</h1>
                <p className="text-gray-600">Empresa Metalúrgica Tradicional</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Estágio: {gameInstance.currentStage === 'traditional' ? 'Tradicional' : 'Digitalizada'}
                  </Badge>
                  <span className="text-sm text-gray-500">Fundada em 1985</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">T{gameInstance.currentQuarter}</div>
                <div className="text-sm text-gray-600">Trimestre Atual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{gameInstance.currentYear}</div>
                <div className="text-sm text-gray-600">Ano Simulado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {Math.round((gameInstance.financialScore * 0.25 + gameInstance.transformationScore * 0.2 + gameInstance.leadershipScore * 0.1) / 0.55)}%
                </div>
                <div className="text-sm text-gray-600">Score Geral</div>
              </div>
              <div className="flex flex-col space-y-2">
                <Link href="/businessquest/phase2">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    <Rocket className="w-4 h-4 mr-2" />
                    Fase 2 - Decisões Estratégicas
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <div className="text-xs text-center text-gray-500">
                  Próxima fase disponível
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Performance Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-3">
                      <TrendingUp className="text-success text-2xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{Math.round(gameInstance.financialScore)}%</div>
                    <div className="text-sm text-gray-600 mb-2">Performance Financeira</div>
                    <Progress value={gameInstance.financialScore} className="mb-1" />
                    <div className="text-xs text-gray-500">Receita: R$ 42M (+8%)</div>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <Rocket className="text-primary text-2xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{Math.round(gameInstance.transformationScore)}%</div>
                    <div className="text-sm text-gray-600 mb-2">Transformação/Inovação</div>
                    <Progress value={gameInstance.transformationScore} className="mb-1" />
                    <div className="text-xs text-gray-500">Digitalização: {metrics?.digitalizationProgress || 35}%</div>
                  </div>

                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-warning/10 rounded-full flex items-center justify-center mb-3">
                      <Users className="text-warning text-2xl" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{Math.round(gameInstance.leadershipScore)}%</div>
                    <div className="text-sm text-gray-600 mb-2">Liderança/Cultura</div>
                    <Progress value={gameInstance.leadershipScore} className="mb-1" />
                    <div className="text-xs text-gray-500">Engajamento: 8.2/10</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transformation Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso da Transformação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Empresa Tradicional</span>
                        <span className="text-xs text-success">Concluído</span>
                      </div>
                      <Progress value={100} className="mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Play className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Empresa Digitalizada</span>
                        <span className="text-xs text-primary">Em Progresso</span>
                      </div>
                      <Progress value={metrics?.digitalizationProgress || 35} className="mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Lock className="text-gray-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Empresa Inovadora</span>
                        <span className="text-xs text-gray-500">Bloqueado</span>
                      </div>
                      <Progress value={0} className="mt-1" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-primary">Próximos Passos</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        Continue investindo em digitalização e automação para alcançar 60% de progresso e desbloquear o estágio inovador.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Quarter Decisions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Decisões do Trimestre</CardTitle>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                    <Clock className="w-3 h-3 mr-1" />
                    7 dias restantes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tech Investment Decision */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Investimento em Tecnologia</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Sua empresa tem orçamento para um grande investimento tecnológico. Qual direção seguir?
                    </p>
                    
                    <RadioGroup 
                      value={selectedDecisions.tech_investment || ""} 
                      onValueChange={(value) => handleDecisionChange('tech_investment', value)}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="cnc" id="cnc" className="mt-1" />
                        <Label htmlFor="cnc" className="cursor-pointer">
                          <div className="font-medium text-gray-900">Máquinas CNC Automatizadas</div>
                          <div className="text-sm text-gray-600">R$ 2.5M - Aumenta eficiência produtiva em 40%</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="erp" id="erp" className="mt-1" />
                        <Label htmlFor="erp" className="cursor-pointer">
                          <div className="font-medium text-gray-900">Sistema ERP Integrado</div>
                          <div className="text-sm text-gray-600">R$ 1.8M - Melhora gestão e visibilidade</div>
                        </Label>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value="iot" id="iot" className="mt-1" />
                        <Label htmlFor="iot" className="cursor-pointer">
                          <div className="font-medium text-gray-900">IoT e Indústria 4.0</div>
                          <div className="text-sm text-gray-600">R$ 3.2M - Conectividade total da fábrica</div>
                        </Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                      <Button 
                        onClick={() => handleDecisionSubmit('tech_investment')}
                      >
                        Confirmar Decisão
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Funcionários</span>
                    <span className="font-semibold text-gray-900">{metrics?.employees || 342}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receita Mensal</span>
                    <span className="font-semibold text-gray-900">R$ 3.5M</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Margem de Lucro</span>
                    <span className="font-semibold text-success">{metrics?.profitMargin || 18.5}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Investimento P&D</span>
                    <span className="font-semibold text-gray-900">R$ {((metrics?.rdInvestment || 450000) / 1000).toFixed(0)}K</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">NPS Score</span>
                    <span className="font-semibold text-warning">{metrics?.npsScore || 67}</span>
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