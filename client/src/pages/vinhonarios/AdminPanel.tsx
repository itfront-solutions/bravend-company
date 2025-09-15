import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  SkipForward,
  Settings,
  Users,
  Clock,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useWineQuizStore } from '@/store/wineQuizStore';
import { useWineQuizWebSocket } from '@/hooks/useWineQuizWebSocket';
import { wineQuizApi } from '@/lib/wineQuizApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { 
    sessions,
    currentSession,
    teams,
    connectedUsers,
    setSessions,
    setCurrentSession,
    setTeams,
    setLoading: setGlobalLoading,
    setError
  } = useWineQuizStore();

  const { connect, disconnect, sendMessage, lastMessage, isConnected } = useWineQuizWebSocket();

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'session_started':
        case 'session_ended':
        case 'question_changed':
        case 'round_changed':
          // Reload sessions when they change
          loadData();
          break;
      }
    }
  }, [lastMessage]);

  const loadData = async () => {
    try {
      setGlobalLoading(true);
      
      // Load sessions
      const sessionsData = await wineQuizApi.getSessions();
      setSessions(sessionsData);
      
      // Load teams
      const teamsData = await wineQuizApi.getTeams();
      setTeams(teamsData);
      
      // Auto-select first active session
      const activeSession = sessionsData.find(s => s.status === 'active');
      if (activeSession) {
        setSelectedSessionId(activeSession.id);
        setCurrentSession(activeSession);
      } else if (sessionsData.length > 0) {
        setSelectedSessionId(sessionsData[0].id);
        setCurrentSession(sessionsData[0]);
      }
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setGlobalLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      const newSession = await wineQuizApi.createSession({
        gameMode: 'leader',
        durationSeconds: 1800 // 30 minutes
      });
      
      await loadData(); // Reload to get updated list
      setSelectedSessionId(newSession.id);
      setCurrentSession(newSession);
      setShowCreateDialog(false);
      
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!selectedSessionId) return;
    
    try {
      setLoading(true);
      
      // Update session status to active
      await wineQuizApi.updateSession(selectedSessionId, {
        status: 'active',
        startTime: new Date().toISOString()
      });
      
      // Send WebSocket message to start session
      if (isConnected) {
        sendMessage({
          type: 'start_session',
          sessionId: selectedSessionId
        });
      }
      
      await loadData();
      
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!selectedSessionId) return;
    
    try {
      setLoading(true);
      
      // Update session status to finished
      await wineQuizApi.updateSession(selectedSessionId, {
        status: 'finished',
        endTime: new Date().toISOString()
      });
      
      // Send WebSocket message to end session
      if (isConnected) {
        sendMessage({
          type: 'end_session',
          sessionId: selectedSessionId
        });
      }
      
      await loadData();
      
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err instanceof Error ? err.message : 'Erro ao finalizar sessão');
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    if (!selectedSessionId) return;
    
    try {
      setLoading(true);
      
      // Send WebSocket message to move to next question
      if (isConnected) {
        sendMessage({
          type: 'next_question',
          sessionId: selectedSessionId
        });
      }
      
    } catch (err) {
      console.error('Error moving to next question:', err);
      setError(err instanceof Error ? err.message : 'Erro ao avançar pergunta');
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Controle de sessões do Wine Quiz</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? `${connectedUsers} conectados` : 'Desconectado'}
              </span>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Nova Sessão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Sessão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Uma nova sessão será criada no modo líder com duração de 30 minutos.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createNewSession} disabled={loading}>
                      {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Criar Sessão
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSessionId === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setCurrentSession(session);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Sessão #{session.id}</h4>
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
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Modo: {session.gameMode === 'individual' ? 'Individual' : 'Líder'}</p>
                      <p>Criada: {new Date(session.startTime).toLocaleString('pt-BR')}</p>
                      {session.endTime && (
                        <p>Finalizada: {new Date(session.endTime).toLocaleString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma sessão encontrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Controls */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Current Session Info */}
            {selectedSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Controle da Sessão #{selectedSession.id}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {selectedSession.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : selectedSession.status === 'finished' ? (
                          <XCircle className="h-4 w-4 text-gray-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        )}
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className="ml-2" variant={
                          selectedSession.status === 'active' ? 'default' : 
                          selectedSession.status === 'finished' ? 'secondary' : 
                          'outline'
                        }>
                          {selectedSession.status === 'active' ? 'Ativa' : 
                           selectedSession.status === 'finished' ? 'Finalizada' : 
                           'Pendente'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Modo: {selectedSession.gameMode === 'individual' ? 'Individual' : 'Líder'}</p>
                        <p>Início: {new Date(selectedSession.startTime).toLocaleString('pt-BR')}</p>
                        {selectedSession.endTime && (
                          <p>Fim: {new Date(selectedSession.endTime).toLocaleString('pt-BR')}</p>
                        )}
                        {selectedSession.durationSeconds && (
                          <p>Duração: {Math.floor(selectedSession.durationSeconds / 60)} minutos</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Conectados:</span>
                        <Badge variant="outline" className="ml-2">
                          {connectedUsers}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Equipes: {teams.length}</p>
                        <p>WebSocket: {isConnected ? 'Conectado' : 'Desconectado'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {selectedSession.status === 'pending' && (
                      <Button 
                        onClick={startSession}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                        Iniciar Sessão
                      </Button>
                    )}
                    
                    {selectedSession.status === 'active' && (
                      <>
                        <Button 
                          onClick={nextQuestion}
                          disabled={loading}
                          variant="outline"
                        >
                          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <SkipForward className="h-4 w-4 mr-2" />}
                          Próxima Pergunta
                        </Button>
                        
                        <Button 
                          onClick={endSession}
                          disabled={loading}
                          variant="destructive"
                        >
                          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Square className="h-4 w-4 mr-2" />}
                          Finalizar Sessão
                        </Button>
                      </>
                    )}
                    
                    <Link href="/vinhonarios/scoreboard">
                      <Button variant="outline">
                        <Trophy className="h-4 w-4 mr-2" />
                        Ver Scoreboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teams Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Equipes Cadastradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-500">
                            Max {team.maxMembers || 4} membros
                            {team.icon && ` • ${team.icon}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{team.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma equipe cadastrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {!selectedSession && (
              <Card>
                <CardContent className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma Sessão
                  </h3>
                  <p className="text-gray-500">
                    Escolha uma sessão à esquerda para ver os controles
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}