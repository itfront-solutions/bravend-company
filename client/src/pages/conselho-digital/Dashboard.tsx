import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MetricsCards from "@/components/conselho-digital/dashboard/MetricsCards";
import { 
  Brain, 
  GraduationCap, 
  Briefcase, 
  Users, 
  BarChart3, 
  ChevronRight,
  Trophy,
  Clock,
  Target
} from "lucide-react";
import { Link } from "wouter";

export default function ConselhoDigitalDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar o Conselho Digital.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 text-primary mr-3" />
                Conselho Digital
              </h1>
              <p className="text-gray-600 mt-1">Bem-vindo, {user?.firstName}! Acompanhe seu progresso como conselheiro</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Nível</div>
                <div className="font-bold text-primary">Expert</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Ranking</div>
                <div className="font-bold text-warning">#12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <MetricsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Trilha de Aprendizagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Governança Corporativa</span>
                    <span className="text-sm text-gray-500">85% completo</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estratégia e Inovação</span>
                    <span className="text-sm text-gray-500">60% completo</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Finanças para Conselheiros</span>
                    <span className="text-sm text-gray-500">30% completo</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="mt-6">
                  <Link href="/conselho-digital/learning">
                    <Button className="w-full">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Continuar Aprendizagem
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Portfólio de Atuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Empresas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">R$ 2,5M</div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">TechCorp Brasil</div>
                      <div className="text-sm text-gray-500">Presidente do Conselho</div>
                    </div>
                    <div className="text-green-600 font-medium">+15.2%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">InnovaSaaS</div>
                      <div className="text-sm text-gray-500">Conselheiro Independente</div>
                    </div>
                    <div className="text-green-600 font-medium">+8.7%</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href="/conselho-digital/portfolio">
                    <Button variant="outline" className="w-full">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Ver Portfólio Completo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* AI Coach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Mentor IA do CVO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">💡 Dica do Dia</div>
                    <div className="text-sm text-blue-800 mt-1">
                      Revisar os indicadores ESG da TechCorp antes da próxima reunião do conselho.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-900">⚠️ Alerta</div>
                    <div className="text-sm text-yellow-800 mt-1">
                      InnovaSaaS apresentou queda de 3% na receita recorrente este mês.
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/conselho-digital/coach">
                    <Button className="w-full">
                      <Brain className="w-4 h-4 mr-2" />
                      Conversar com IA
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Networking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Networking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conexões</span>
                    <span className="font-bold">145</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score de Qualidade</span>
                    <span className="font-bold text-primary">87/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Novas Sugestões</span>
                    <span className="font-bold text-warning">8</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/conselho-digital/networking">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Explorar Networking
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-sm font-medium">Expert em ESG</div>
                      <div className="text-xs text-gray-500">Concluído em 22/08</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">50 Conexões</div>
                      <div className="text-xs text-gray-500">Milestone alcançado</div>
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