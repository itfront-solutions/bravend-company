import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, TrendingUp, Rocket, Users, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16 pt-24">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Factory className="text-primary text-5xl mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Nova Economia <span className="text-primary">Simulator</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            "De Empresa Tradicional a Ecossistema de Valor"
          </p>
          <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
            Transforme a MetalBrasil usando a metodologia Jornada CVO by XPTO. 
            Desenvolva liderança estratégica e pensamento sistêmico através de gameplay gamificado.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Decisões Estratégicas</h3>
              <p className="text-gray-600">
                Faça escolhas que impactam performance financeira, transformação e cultura organizacional
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Transformação Progressiva</h3>
              <p className="text-gray-600">
                Evolua por 3 estágios: Tradicional → Digitalizada → Inovadora ao longo de 4 trimestres
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mentor Virtual</h3>
              <p className="text-gray-600">
                Receba orientações baseadas na metodologia Jornada Equity by XPTO
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Crises</h3>
              <p className="text-gray-600">
                Enfrente eventos dinâmicos e crises que testam sua capacidade de adaptação
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sistema de Conquistas</h3>
              <p className="text-gray-600">
                Desbloqueie badges e reconhecimentos em Smart Money, Inovação e Sustentabilidade
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Factory className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cenário Brasileiro</h3>
              <p className="text-gray-600">
                Contexto realista do mercado brasileiro com desafios e oportunidades específicas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Preview */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                <Factory className="text-white text-3xl" />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">MetalBrasil</h2>
                <p className="text-xl text-gray-600 mb-4">Empresa Metalúrgica Tradicional</p>
                <p className="text-gray-500">Fundada em 1985, a MetalBrasil representa uma empresa tradicional brasileira pronta para a transformação digital. Como Chief Visionary Officer (CVO), você liderará esta jornada de transformação.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para transformar o futuro dos negócios?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Aplique os princípios da metodologia Jornada CVO 
            em um ambiente de aprendizado prático e envolvente.
          </p>
          <Button 
            onClick={() => window.location.href = "/businessquest/home"}
            size="lg" 
            className="px-8 py-4 text-lg font-semibold"
          >
            Iniciar Simulador
          </Button>
        </div>
      </div>
    </div>
  );
}