import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  ArrowLeft, 
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  Clock,
  Eye
} from 'lucide-react';
import { useWineQuizStore } from '@/store/wineQuizStore';
import { useWineQuizWebSocket } from '@/hooks/useWineQuizWebSocket';
import { wineQuizApi } from '@/lib/wineQuizApi';

export default function Scoreboard() {
  const [, setLocation] = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { 
    sessions,
    leaderboard,
    isConnected,
    connectedUsers,
    loading,
    error,
    setSessions,
    setLeaderboard,
    setLoading,
    setError
  } = useWineQuizStore();

  const { connect, disconnect, sendMessage, lastMessage, isConnected: wsConnected } = useWineQuizWebSocket();

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const data = await wineQuizApi.getSessions();
        setSessions(data);
        
        // Auto-select first active session
        const activeSession = data.find(s => s.status === 'active');
        if (activeSession) {
          setSelectedSessionId(activeSession.id);
        }
      } catch (err) {
        console.error('Error loading sessions:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar sessões');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Load leaderboard when session is selected
  useEffect(() => {
    if (selectedSessionId) {
      loadLeaderboard();
    }
  }, [selectedSessionId]);

  // WebSocket message handling - FIXED: No auto-refresh that causes score inflation
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'live_scores':
          if (lastMessage.data.scores) {
            setLeaderboard(lastMessage.data.scores);
          }
          break;
          
        case 'session_started':
        case 'session_ended':
          // Reload sessions when they change
          wineQuizApi.getSessions().then(setSessions).catch(console.error);
          break;

        // REMOVED: case 'answer_received' auto-refresh that was causing score inflation
      }
    }
  }, [lastMessage, selectedSessionId]);

  const loadLeaderboard = async () => {
    if (!selectedSessionId) return;
    
    try {
      const data = await wineQuizApi.getSessionLeaderboard(selectedSessionId);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const refreshLeaderboard = async () => {
    if (!selectedSessionId) return;
    
    setRefreshing(true);
    try {
      await loadLeaderboard();
      
      // Also request live scores via WebSocket if connected
      if (wsConnected) {
        sendMessage({
          type: 'get_live_scores',
          sessionId: selectedSessionId
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
            {position}
          </div>
        );
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/vinhonarios/vinhos-visoes">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
              <p className="text-gray-600">Ranking em tempo real</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {wsConnected ? `${connectedUsers} conectados` : 'Desconectado'}
              </span>
            </div>
            
            <Button 
              onClick={refreshLeaderboard} 
              disabled={refreshing || !selectedSessionId}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Session Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="animate-pulse space-y-2">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSessionId === session.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">Sessão #{session.id}</h4>
                      <Badge 
                        variant={
                          session.status === 'active' ? 'default' : 
                          session.status === 'finished' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {session.status === 'active' ? 'Ativa' : 
                         session.status === 'finished' ? 'Finalizada' : 
                         'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(session.startTime).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
                
                {sessions.length === 0 && !loading && (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma sessão encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Ranking
                  {selectedSession && (
                    <Badge variant="outline" className="ml-2">
                      Sessão #{selectedSession.id}
                    </Badge>
                  )}
                </div>
                {leaderboard.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {leaderboard.length} equipes
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSessionId ? (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">Selecione uma Sessão</h3>
                  <p className="text-sm">
                    Escolha uma sessão à esquerda para ver o ranking
                  </p>
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div 
                      key={entry.teamId}
                      className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200' :
                        index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200' :
                        index === 2 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {getRankIcon(index + 1)}
                        
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div>
                            <h4 className={`font-semibold ${
                              index === 0 ? 'text-yellow-800' :
                              index === 1 ? 'text-gray-800' :
                              index === 2 ? 'text-amber-800' :
                              'text-gray-700'
                            }`}>
                              {entry.teamName}
                            </h4>
                            {entry.icon && (
                              <span className="text-lg">{entry.icon}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            index === 0 ? 'text-yellow-700' :
                            index === 1 ? 'text-gray-700' :
                            index === 2 ? 'text-amber-700' :
                            'text-gray-600'
                          }`}>
                            {entry.totalScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">pontos</div>
                        </div>
                        
                        <Link href="/vinhonarios/question">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">Aguardando Resultados</h3>
                  <p className="text-sm">
                    O ranking aparecerá quando as equipes começarem a responder
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}