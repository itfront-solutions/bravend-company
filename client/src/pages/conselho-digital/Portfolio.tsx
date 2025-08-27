import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Building, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Portfolio() {
  const { user } = useAuthStore();

  const companies = [
    {
      id: 1,
      name: "TechCorp Brasil",
      role: "Presidente do Conselho",
      sector: "Tecnologia",
      value: "R$ 850K",
      growth: "+15.2%",
      status: "active",
      description: "Líder em soluções de software empresarial",
      joinDate: "Jan 2022"
    },
    {
      id: 2,
      name: "InnovaSaaS",
      role: "Conselheiro Independente", 
      sector: "SaaS",
      value: "R$ 650K",
      growth: "+8.7%",
      status: "active",
      description: "Plataforma de gestão para PMEs",
      joinDate: "Mar 2023"
    },
    {
      id: 3,
      name: "GreenEnergy Co",
      role: "Conselheiro Consultivo",
      sector: "Energia",
      value: "R$ 420K",
      growth: "+22.1%",
      status: "active",
      description: "Energia renovável e sustentabilidade",
      joinDate: "Jun 2023"
    },
    {
      id: 4,
      name: "FinTech Solutions",
      role: "Vice-Presidente",
      sector: "Fintech",
      value: "R$ 380K",
      growth: "-2.3%",
      status: "attention",
      description: "Soluções de pagamento digital",
      joinDate: "Set 2021"
    }
  ];

  const totalValue = companies.reduce((sum, company) => {
    return sum + parseInt(company.value.replace(/[R$K\s]/g, "")) * 1000;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/conselho-digital/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-8 h-8 text-primary mr-3" />
                  Portfólio de Atuação
                </h1>
                <p className="text-gray-600 mt-1">Gerencie suas posições como conselheiro</p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Empresa
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Crescimento Médio</p>
                  <p className="text-2xl font-bold text-green-600">+10.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Anos Experiência</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                        <Badge variant={company.status === 'active' ? 'default' : 'destructive'}>
                          {company.status === 'active' ? 'Ativo' : 'Atenção'}
                        </Badge>
                        <Badge variant="outline">{company.sector}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{company.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span><strong>Cargo:</strong> {company.role}</span>
                        <span><strong>Desde:</strong> {company.joinDate}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="text-lg font-bold text-gray-900">{company.value}</div>
                      <div className={`text-sm font-medium ${
                        company.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {company.growth}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                      <Button variant="outline" size="sm">Relatórios</Button>
                    </div>
                    <Button size="sm">Agendar Reunião</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}