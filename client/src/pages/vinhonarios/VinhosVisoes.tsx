import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wine, 
  Play, 
  Users, 
  Trophy, 
  BarChart3, 
  QrCode,
  Settings,
  Clock,
  ExternalLink,
  ChevronRight,
  Gamepad2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { useWineQuizStore } from '@/store/wineQuizStore';
import { useWineQuizWebSocket } from '@/hooks/useWineQuizWebSocket';
import { wineQuizApi } from '@/lib/wineQuizApi';

export default function VinhosVisoes() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();
  
  // Wine Quiz state
  const { 
    sessions,
    teams,
    leaderboard,
    isConnected,
    connectedUsers,
    loading,
    error,
    setSessions,
    setTeams,
    setLeaderboard,
    setLoading,
    setError
  } = useWineQuizStore();
  
  // WebSocket connection
  const { connect, disconnect, sendMessage, lastMessage } = useWineQuizWebSocket();
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load teams
        const teamsData = await wineQuizApi.getTeams();
        setTeams(teamsData);
        
        // Load sessions (with proper auth token)
        const token = localStorage.getItem('auth_token');
        if (token) {
          const sessionsData = await wineQuizApi.getSessions();
          setSessions(sessionsData);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'session_started':
        case 'session_ended':
          // Reload sessions when they change
          wineQuizApi.getSessions().then(setSessions).catch(console.error);
          break;
          
        case 'live_scores':
          if (lastMessage.data.scores) {
            setLeaderboard(lastMessage.data.scores);
          }
          break;
          
        case 'user_joined':
        case 'user_left':
          // Could update connected users count here
          break;
      }
    }
  }, [lastMessage]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
            <Wine className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vinhos & Visões</h1>
            <p className="text-gray-600">Quiz interativo sobre vinhos e enologia</p>
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {isConnected ? `${connectedUsers} conectados` : 'Desconectado'}
              </span>
            </div>
            <Badge variant="secondary">
              Vinhonarios
            </Badge>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-wine-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Desafie seus conhecimentos sobre vinhos!</h2>
          <p className="opacity-90">
            Teste sua expertise em enologia com nosso quiz interativo. 
            Perguntas sobre terroir, harmonização, variedades e muito mais.
          </p>
        </div>
      </div>

      <Tabs defaultValue="play" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="play">Jogar</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Play Tab */}
        <TabsContent value="play" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Play */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-green-600" />
                  Jogo Rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Inicie uma partida rápida individual ou com amigos
                </p>
                <Link href="/vinhonarios/admin">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Mode */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Modo Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Jogue com sua equipe usando QR Codes para acesso
                </p>
                <div className="space-y-2">
                  <Link href="/vinhonarios/qr-codes">
                    <Button variant="outline" className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      Ver QR Codes
                    </Button>
                  </Link>
                  <Link href="/vinhonarios/admin">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Painel de Controle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Scoreboard */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Placar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Acompanhe os resultados e rankings em tempo real
                </p>
                <Link href="/vinhonarios/scoreboard">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Placar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Características do Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Wine className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Variedade de Perguntas</h4>
                    <p className="text-sm text-gray-600">
                      Múltipla escolha, autocomplete e perguntas abertas sobre vinhos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Modo Colaborativo</h4>
                    <p className="text-sm text-gray-600">
                      Jogue em equipe com até 5 participantes por mesa
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Análise de Resultados</h4>
                    <p className="text-sm text-gray-600">
                      Gráficos e estatísticas detalhadas do desempenho
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temas Abordados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <h4 className="font-medium text-purple-700">Terroir</h4>
                    <p className="text-xs text-purple-600">Origem e características</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <h4 className="font-medium text-red-700">Variedades</h4>
                    <p className="text-xs text-red-600">Uvas e vinhos</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <h4 className="font-medium text-yellow-700">Harmonização</h4>
                    <p className="text-xs text-yellow-600">Vinhos e pratos</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <h4 className="font-medium text-green-700">Envelhecimento</h4>
                    <p className="text-xs text-green-600">Maturação e guarda</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sessões do Sistema
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Sessão #{session.id}</h3>
                        <Badge 
                          variant={
                            session.status === 'active' ? 'default' : 
                            session.status === 'finished' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {session.status === 'active' ? 'Ativa' : 
                           session.status === 'finished' ? 'Finalizada' : 
                           'Pendente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Modo: {session.gameMode === 'individual' ? 'Individual' : 'Líder'}</p>
                        <p>Início: {new Date(session.startTime).toLocaleString('pt-BR')}</p>
                        {session.endTime && (
                          <p>Fim: {new Date(session.endTime).toLocaleString('pt-BR')}</p>
                        )}
                        {session.durationSeconds && (
                          <p>Duração: {Math.floor(session.durationSeconds / 60)} minutos</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma sessão encontrada</p>
                  <p className="text-sm mt-2">
                    Inicie uma nova sessão através do painel de administração
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Ranking Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 
                            'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{entry.teamName}</p>
                            {entry.icon && <span className="text-lg">{entry.icon}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{entry.totalScore.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">pontos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhum resultado</p>
                    <p className="text-sm mt-2">Os resultados aparecerão após as partidas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Equipes Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <div>
                            <p className="font-medium">{team.name}</p>
                            {team.icon && <span className="text-lg">{team.icon}</span>}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Max {team.maxMembers || 4} membros
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma equipe</p>
                    <p className="text-sm mt-2">Configure as equipes no admin</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Painel de Administração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/vinhonarios/admin">
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Acessar Painel Admin
                  </Button>
                </Link>
                <Link href="/vinhonarios/qr-codes">
                  <Button variant="outline" className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Gerenciar QR Codes
                  </Button>
                </Link>
                <Link href="/vinhonarios/results-chart">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gráficos de Resultado
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Integração Ativa</h4>
                  <p className="text-sm text-blue-600">
                    O módulo Vinhos & Visões está integrado ao sistema principal
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Usuários:</span>
                    <span className="text-gray-600"> Unlimited</span>
                  </div>
                  <div>
                    <span className="font-medium">Mesas:</span>
                    <span className="text-gray-600"> 5 máx.</span>
                  </div>
                  <div>
                    <span className="font-medium">Questões:</span>
                    <span className="text-gray-600"> Ilimitadas</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant="default" className="ml-1">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}