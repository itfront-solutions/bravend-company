import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wine, 
  Users, 
  Trophy, 
  BarChart3, 
  QrCode,
  Settings,
  ChevronRight,
  UserPlus,
  Eye,
  Crown
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import WineGuideHint from '@/components/vinhonarios/WineGuideHint';

interface MenuOption {
  title: string;
  description: string;
  icon: any;
  path: string;
  color: string;
  bgColor: string;
  badge?: string;
  isAdmin?: boolean;
}

export default function VinhosVisoes() {
  const { user } = useAuthStore();
  
  const menuOptions: MenuOption[] = [
    {
      title: "Cadastro de Mesa",
      description: "Registrar nova mesa/equipe para participar do quiz",
      icon: UserPlus,
      path: "/vinhonarios/register",
      color: "text-green-600",
      bgColor: "bg-green-100",
      badge: "Participante"
    },
    {
      title: "Quiz de Vinho",
      description: "Responder perguntas sobre conhecimento vinícola",
      icon: Eye,
      path: "/vinhonarios/question",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      badge: "Quiz Ativo"
    },
    {
      title: "Scoreboard",
      description: "Acompanhar ranking em tempo real das equipes",
      icon: Trophy,
      path: "/vinhonarios/scoreboard",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "QR Codes",
      description: "Gerar códigos QR para as mesas/equipes",
      icon: QrCode,
      path: "/vinhonarios/qr-codes",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Gráfico de Resultados",
      description: "Visualizar analytics e estatísticas detalhadas",
      icon: BarChart3,
      path: "/vinhonarios/results-chart",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Painel do Sommelier",
      description: "Interface administrativa para gerenciar o quiz",
      icon: Crown,
      path: "/vinhonarios/sommelier",
      color: "text-red-600",
      bgColor: "bg-red-100",
      badge: "Admin",
      isAdmin: true
    },
    {
      title: "Admin Dashboard",
      description: "Painel administrativo alternativo",
      icon: Settings,
      path: "/vinhonarios/admin",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      badge: "Admin",
      isAdmin: true
    }
  ];

  // Filter menu options based on user role
  const visibleOptions = menuOptions.filter(option => 
    !option.isAdmin || (user && ['admin', 'super_admin'].includes(user.role))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-red-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Wine className="h-16 w-16 mr-4" />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Vinhonarios</h1>
                <p className="text-xl text-purple-200 mt-2">
                  Sistema Completo de Quiz Vinícola
                </p>
              </div>
            </div>
            
            {user && (
              <div className="bg-white/10 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-purple-100">
                  Bem-vindo, <strong>{user.firstName} {user.lastName}</strong>
                </p>
                <Badge className="bg-white/20 text-white border-white/30 mt-2">
                  {user.role === 'admin' || user.role === 'super_admin' ? 'Administrador' : 'Participante'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleOptions.map((option, index) => {
            const Icon = option.icon;
            
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center mr-4`}>
                        <Icon className={`w-6 h-6 ${option.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                      </div>
                    </div>
                    {option.badge && (
                      <Badge variant={option.isAdmin ? "destructive" : "secondary"} className="text-xs">
                        {option.badge}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 text-sm">
                    {option.description}
                  </p>
                  
                  <Link href={option.path}>
                    <Button className="w-full group-hover:bg-purple-700 transition-colors">
                      Acessar
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Info Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-100 to-red-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Wine className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-purple-900 mb-2">
                  Como Funciona o Sistema Vinhonarios
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">1. Cadastro</h3>
                    <p className="text-sm text-gray-600">
                      Registre sua mesa/equipe para participar do quiz
                    </p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">2. Quiz</h3>
                    <p className="text-sm text-gray-600">
                      Responda perguntas sobre conhecimento vinícola
                    </p>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-800">3. Ranking</h3>
                    <p className="text-sm text-gray-600">
                      Acompanhe sua posição no ranking em tempo real
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wine Guide Hint */}
      <WineGuideHint />
    </div>
  );
}