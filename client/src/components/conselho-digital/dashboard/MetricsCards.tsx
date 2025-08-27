import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Briefcase, Users, Brain } from "lucide-react";

interface DashboardMetrics {
  progress: number;
  portfolio: number;
  networking: number;
  aiScore: number;
  totalInvestment: number;
  growth: number;
  companiesCount: number;
  connectionsCount: number;
}

export default function MetricsCards() {
  // Mock data for now - in a real implementation, this would come from an API
  const metrics: DashboardMetrics = {
    progress: 78,
    portfolio: 2500000,
    networking: 87,
    aiScore: 94,
    totalInvestment: 1800000,
    growth: 15.2,
    companiesCount: 12,
    connectionsCount: 145
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Progresso</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{metrics?.progress || 0}%</p>
              <p className="text-xs md:text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">+12% vs mês anterior</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Portfólio</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                {formatCurrency(metrics?.portfolio || 0)}
              </p>
              <p className="text-xs md:text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">+{metrics?.growth?.toFixed(1) || 0}% crescimento</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Networking</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{metrics?.networking || 0}</p>
              <p className="text-xs md:text-sm text-blue-600 flex items-center">
                <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Score de qualidade</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">IA Score</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{metrics?.aiScore || 94}</p>
              <p className="text-xs md:text-sm text-orange-600 flex items-center">
                <Brain className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Eficiência IA</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}