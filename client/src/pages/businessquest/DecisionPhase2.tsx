import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Handshake, 
  Users, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  ChevronRight,
  Calendar,
  BarChart3,
  Zap,
  Star,
  Coins,
  Network,
  Building,
  Brain,
  Globe,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface DecisionOption {
  value: string;
  label: string;
  description: string;
  shortTermImpact: string;
  longTermImpact: string;
  cost: number;
  benefit: string;
}

interface DecisionCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  options: DecisionOption[];
}

export default function DecisionPhase2() {
  const { toast } = useToast();
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [currentQuarter] = useState(1);
  const [timeRemaining] = useState(7);

  const decisionCategories: DecisionCategory[] = [
    {
      id: "partnerships",
      title: "Parcerias Estratégicas",
      icon: Handshake,
      description: "Estabeleça alianças que impulsionem a transformação digital",
      options: [
        {
          value: "tech_giant",
          label: "Parceria com Gigante Tecnológico",
          description: "Aliança com Microsoft/Amazon para soluções cloud",
          shortTermImpact: "Alto investimento inicial",
          longTermImpact: "Aceleração significativa da transformação digital",
          cost: 5000000,
          benefit: "Acesso a tecnologias avançadas e expertise"
        },
        {
          value: "startup",
          label: "Incubação de Startups",
          description: "Programa interno de inovação com startups",
          shortTermImpact: "Baixo custo, resultados experimentais",
          longTermImpact: "Cultura de inovação estabelecida",
          cost: 800000,
          benefit: "Flexibilidade e agilidade na inovação"
        },
        {
          value: "university",
          label: "Parceria Acadêmica",
          description: "Centro de P&D com universidades",
          shortTermImpact: "Desenvolvimento de talentos",
          longTermImpact: "Pipeline de inovação sustentável",
          cost: 1500000,
          benefit: "Pesquisa aplicada e desenvolvimento de talentos"
        }
      ]
    },
    {
      id: "market_expansion",
      title: "Expansão de Mercado",
      icon: Globe,
      description: "Diversifique e amplie sua presença no mercado",
      options: [
        {
          value: "international",
          label: "Mercado Internacional",
          description: "Expandir para América Latina",
          shortTermImpact: "Alta complexidade operacional",
          longTermImpact: "Receita diversificada e maior escala",
          cost: 8000000,
          benefit: "Acesso a novos mercados e clientes"
        },
        {
          value: "new_verticals",
          label: "Novos Verticais",
          description: "Entrar em energia renovável e construção sustentável",
          shortTermImpact: "Necessidade de novos conhecimentos",
          longTermImpact: "Portfolio diversificado e resiliente",
          cost: 4500000,
          benefit: "Menor dependência de um único setor"
        },
        {
          value: "digital_products",
          label: "Produtos Digitais",
          description: "Plataforma SaaS para gestão industrial",
          shortTermImpact: "Desenvolvimento de capacidades digitais",
          longTermImpact: "Receita recorrente e escalável",
          cost: 3200000,
          benefit: "Margens maiores e escalabilidade"
        }
      ]
    },
    {
      id: "sustainability",
      title: "Sustentabilidade",
      icon: Zap,
      description: "Implemente práticas sustentáveis e ESG",
      options: [
        {
          value: "carbon_neutral",
          label: "Carbono Neutro",
          description: "Programa completo de neutralidade de carbono",
          shortTermImpact: "Investimento em eficiência energética",
          longTermImpact: "Liderança em sustentabilidade no setor",
          cost: 6000000,
          benefit: "Compliance ESG e vantagem competitiva"
        },
        {
          value: "circular_economy",
          label: "Economia Circular",
          description: "Reciclagem e reuso de materiais",
          shortTermImpact: "Redesign de processos",
          longTermImpact: "Redução de custos e impacto ambiental",
          cost: 2800000,
          benefit: "Eficiência de recursos e sustentabilidade"
        },
        {
          value: "green_certification",
          label: "Certificações Verdes",
          description: "ISO 14001 e outras certificações ambientais",
          shortTermImpact: "Processos de auditoria e adequação",
          longTermImpact: "Credibilidade e acesso a mercados premium",
          cost: 1200000,
          benefit: "Acesso a contratos sustentáveis"
        }
      ]
    },
    {
      id: "innovation",
      title: "Centro de Inovação",
      icon: Brain,
      description: "Estabeleça capacidades internas de inovação",
      options: [
        {
          value: "innovation_lab",
          label: "Laboratório de Inovação",
          description: "Centro interno de P&D e prototipagem",
          shortTermImpact: "Contratação de talentos especializados",
          longTermImpact: "Pipeline contínuo de inovações",
          cost: 4000000,
          benefit: "Propriedade intelectual e vantagem competitiva"
        },
        {
          value: "digital_twin",
          label: "Gêmeo Digital",
          description: "Simulação digital completa da fábrica",
          shortTermImpact: "Implementação de sensores IoT",
          longTermImpact: "Otimização preditiva e manutenção",
          cost: 3500000,
          benefit: "Eficiência operacional maximizada"
        },
        {
          value: "ai_integration",
          label: "Integração de IA",
          description: "IA para otimização e tomada de decisão",
          shortTermImpact: "Coleta e estruturação de dados",
          longTermImpact: "Operações autônomas e inteligentes",
          cost: 2500000,
          benefit: "Automação inteligente e insights preditivos"
        }
      ]
    }
  ];

  const handleDecisionChange = (categoryId: string, value: string) => {
    setSelectedDecisions(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleSubmitDecisions = () => {
    const selectedCount = Object.keys(selectedDecisions).length;
    if (selectedCount === 0) {
      toast({
        title: "Nenhuma decisão selecionada",
        description: "Selecione pelo menos uma decisão estratégica.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Decisões Registradas",
      description: `${selectedCount} decisões estratégicas foram processadas.`,
    });
  };

  const calculateTotalInvestment = () => {
    let total = 0;
    Object.entries(selectedDecisions).forEach(([categoryId, optionValue]) => {
      const category = decisionCategories.find(c => c.id === categoryId);
      const option = category?.options.find(o => o.value === optionValue);
      if (option) {
        total += option.cost;
      }
    });
    return total;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/businessquest/home">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fase 2: Decisões Estratégicas</h1>
                <p className="text-gray-600">Defina o futuro da MetalBrasil com decisões que moldarão os próximos trimestres</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">T{currentQuarter}</div>
                <div className="text-xs text-gray-600">Trimestre</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-warning">{timeRemaining}d</div>
                <div className="text-xs text-gray-600">Restantes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Decision Categories */}
          <div className="lg:col-span-3 space-y-6">
            {decisionCategories.map((category) => {
              const Icon = category.icon;
              const selectedOption = selectedDecisions[category.id];
              
              return (
                <Card key={category.id} className="transition-all duration-200 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      {selectedOption && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label htmlFor={`select-${category.id}`} className="text-sm font-medium">
                        Escolha sua estratégia:
                      </Label>
                      <Select 
                        value={selectedDecisions[category.id] || ""} 
                        onValueChange={(value) => handleDecisionChange(category.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção estratégica" />
                        </SelectTrigger>
                        <SelectContent>
                          {category.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedOption && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          {(() => {
                            const option = category.options.find(o => o.value === selectedOption);
                            return option ? (
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{option.label}</h4>
                                  <p className="text-sm text-gray-700 mt-1">{option.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="font-medium text-gray-700">Impacto Curto Prazo:</span>
                                    <p className="text-gray-600 mt-1">{option.shortTermImpact}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Impacto Longo Prazo:</span>
                                    <p className="text-gray-600 mt-1">{option.longTermImpact}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                  <span className="text-sm font-medium text-gray-700">Investimento:</span>
                                  <span className="text-sm font-bold text-primary">{formatCurrency(option.cost)}</span>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Resumo das Decisões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Object.keys(selectedDecisions).length}/4
                    </div>
                    <div className="text-sm text-gray-600">Decisões Selecionadas</div>
                    <Progress 
                      value={(Object.keys(selectedDecisions).length / 4) * 100} 
                      className="mt-2" 
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Investimento Total:</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(calculateTotalInvestment())}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Budget disponível: R$ 15.000.000
                    </div>
                    
                    <Progress 
                      value={(calculateTotalInvestment() / 15000000) * 100} 
                      className="mt-2"
                    />
                  </div>
                  
                  {Object.keys(selectedDecisions).length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Decisões Selecionadas:</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedDecisions).map(([categoryId, optionValue]) => {
                          const category = decisionCategories.find(c => c.id === categoryId);
                          const option = category?.options.find(o => o.value === optionValue);
                          return (
                            <div key={categoryId} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-medium text-gray-900">{category?.title}</div>
                              <div className="text-gray-600">{option?.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-6" 
                    onClick={handleSubmitDecisions}
                    disabled={Object.keys(selectedDecisions).length === 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Decisões
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center">
                    As decisões podem ser alteradas até o final do trimestre
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