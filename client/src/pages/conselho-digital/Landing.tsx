import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, GraduationCap, Users, BarChart3, Briefcase, Network } from "lucide-react";

export default function ConselhoDigitalLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-100">
      <div className="container mx-auto px-4 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Brain className="text-primary text-5xl mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Conselho <span className="text-primary">Digital</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Escola de Conselheiros CVO
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            Plataforma completa para desenvolvimento de competências de conselheiros, 
            com IA, networking inteligente e trilhas de aprendizado personalizadas.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
              <p className="text-gray-600">
                Acompanhe seu progresso, métricas de performance e insights personalizados
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trilha de Aprendizagem</h3>
              <p className="text-gray-600">
                Módulos estruturados para desenvolver competências essenciais de conselheiros
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mentor IA do CVO</h3>
              <p className="text-gray-600">
                Assistente inteligente para coaching personalizado e suporte em tempo real
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Portfólio de Atuação</h3>
              <p className="text-gray-600">
                Gerencie suas empresas, projetos e histórico de atuação como conselheiro
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Networking Inteligente</h3>
              <p className="text-gray-600">
                Conecte-se com outros conselheiros através de recomendações baseadas em IA
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Network className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
              <p className="text-gray-600">
                Análises avançadas do seu desempenho e impacto nas empresas que atua
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Preview */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white text-3xl" />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">CVO Company</h2>
                <p className="text-xl text-gray-600 mb-4">Escola de Conselheiros Digitais</p>
                <p className="text-gray-500">
                  A plataforma mais avançada para formação e desenvolvimento de conselheiros, 
                  combinando tecnologia de IA com metodologias comprovadas de governança corporativa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para acelerar sua jornada como conselheiro?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Acesse a plataforma completa e desenvolva as competências essenciais 
            para se tornar um conselheiro de excelência.
          </p>
          <Button 
            onClick={() => window.location.href = "/conselho-digital/dashboard"}
            size="lg" 
            className="px-8 py-4 text-lg font-semibold"
          >
            Acessar Plataforma
          </Button>
        </div>
      </div>
    </div>
  );
}