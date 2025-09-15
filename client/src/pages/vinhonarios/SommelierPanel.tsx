import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Wine, 
  Settings, 
  BarChart3, 
  Plus,
  Edit2,
  Trash2,
  Play,
  Square,
  Send,
  Clock,
  Users,
  Target,
  Trophy
} from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'autocomplete';
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_option?: 'a' | 'b' | 'c' | 'd';
  options?: string[];
  correct_answer?: string;
  weight: number;
}

interface Round {
  id: number;
  name: string;
  wine_type: string;
  description: string;
  questions: Question[];
  status: 'pending' | 'active' | 'finished';
}

interface SessionStats {
  questionsCreated: number;
  maxParticipants: number;
  sessionStatus: 'Inativa' | 'Ativa';
  availableTables: number;
}

export default function SommelierPanel() {
  const [activeTab, setActiveTab] = useState('controle');
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsCreated: 14,
    maxParticipants: 20,
    sessionStatus: 'Inativa',
    availableTables: 5
  });

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'autocomplete',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a' as 'a' | 'b' | 'c' | 'd',
    options: [],
    correct_answer: '',
    weight: 2
  });

  // New Round Form State
  const [newRound, setNewRound] = useState({
    name: '',
    wine_type: '',
    description: '',
    selected_questions: [] as number[]
  });

  // Load initial data
  useEffect(() => {
    loadQuestions();
    loadRounds();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/wine-quiz/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadRounds = async () => {
    try {
      const response = await fetch('/api/wine-quiz/rounds');
      if (response.ok) {
        const data = await response.json();
        setRounds(data);
      }
    } catch (error) {
      console.error('Error loading rounds:', error);
    }
  };

  const handleStartSession = async () => {
    try {
      const response = await fetch('/api/wine-quiz/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_mode: 'individual' })
      });
      
      if (response.ok) {
        setSessionActive(true);
        setSessionStats(prev => ({ ...prev, sessionStatus: 'Ativa' }));
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleFinishSession = async () => {
    try {
      const response = await fetch('/api/wine-quiz/session/finish', {
        method: 'POST'
      });
      
      if (response.ok) {
        setSessionActive(false);
        setSessionStats(prev => ({ ...prev, sessionStatus: 'Inativa' }));
      }
    } catch (error) {
      console.error('Error finishing session:', error);
    }
  };

  const handleLaunchQuestion = async (questionId: number) => {
    try {
      const response = await fetch('/api/wine-quiz/session/launch-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      
      if (response.ok) {
        const question = questions.find(q => q.id === questionId);
        setCurrentQuestion(question || null);
      }
    } catch (error) {
      console.error('Error launching question:', error);
    }
  };

  const handleEndQuestion = async () => {
    try {
      const response = await fetch('/api/wine-quiz/session/end-question', {
        method: 'POST'
      });
      
      if (response.ok) {
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error ending question:', error);
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const response = await fetch('/api/wine-quiz/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      
      if (response.ok) {
        await loadQuestions();
        // Reset form
        setNewQuestion({
          question_text: '',
          question_type: 'multiple_choice',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'a',
          options: [],
          correct_answer: '',
          weight: 2
        });
        setSessionStats(prev => ({ ...prev, questionsCreated: prev.questionsCreated + 1 }));
      }
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(`/api/wine-quiz/questions/${questionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadQuestions();
        setSessionStats(prev => ({ ...prev, questionsCreated: prev.questionsCreated - 1 }));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleCreateRound = async () => {
    try {
      const response = await fetch('/api/wine-quiz/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRound,
          question_ids: newRound.selected_questions
        })
      });
      
      if (response.ok) {
        await loadRounds();
        // Reset form
        setNewRound({
          name: '',
          wine_type: '',
          description: '',
          selected_questions: []
        });
      }
    } catch (error) {
      console.error('Error creating round:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-red-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wine className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Painel do Sommelier</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={sessionStats.sessionStatus === 'Ativa' ? 'default' : 'secondary'}>
                {sessionStats.sessionStatus}
              </Badge>
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-900">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="controle">Controle da Sessão</TabsTrigger>
            <TabsTrigger value="rodadas">Rodadas</TabsTrigger>
            <TabsTrigger value="perguntas">Gerenciar Perguntas</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
          </TabsList>

          {/* Session Control Tab */}
          <TabsContent value="controle">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Session Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Controle da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Modo de Jogo</label>
                    <Select defaultValue="individual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual - Cada participante responde</SelectItem>
                        <SelectItem value="leader">Líder - Porta voz responde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleStartSession}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={sessionActive}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Sessão
                    </Button>
                    <Button 
                      onClick={handleFinishSession}
                      variant="outline"
                      className="flex-1"
                      disabled={!sessionActive}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Finalizar Sessão
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Live Game Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Placar ao Vivo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button className="flex-1" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Ver Tela Pública
                    </Button>
                    <Button className="flex-1" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      QR Codes das Equipes  
                    </Button>
                  </div>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gráfico de Resultados
                  </Button>
                </CardContent>
              </Card>

              {/* Current Question Control */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Pergunta Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Selecionar Pergunta</label>
                    <Select onValueChange={(value) => {
                      const questionId = parseInt(value);
                      const question = questions.find(q => q.id === questionId);
                      setCurrentQuestion(question || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pergunta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {questions.map((question) => (
                          <SelectItem key={question.id} value={question.id.toString()}>
                            {question.question_text.substring(0, 60)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => currentQuestion && handleLaunchQuestion(currentQuestion.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={!currentQuestion}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Lançar Pergunta
                    </Button>
                    <Button 
                      onClick={handleEndQuestion}
                      variant="outline"
                      className="flex-1"
                      disabled={!currentQuestion}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Encerrar Pergunta
                    </Button>
                  </div>

                  {currentQuestion && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Pergunta Ativa:</h4>
                      <p className="text-sm text-gray-700">{currentQuestion.question_text}</p>
                      {currentQuestion.question_type === 'multiple_choice' && (
                        <div className="mt-2 text-xs text-gray-600">
                          A: {currentQuestion.option_a} | 
                          B: {currentQuestion.option_b} | 
                          C: {currentQuestion.option_c} | 
                          D: {currentQuestion.option_d}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rounds Tab */}
          <TabsContent value="rodadas">
            <div className="space-y-8">
              {/* Create Round */}
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de Rodadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome da Rodada</label>
                      <Input 
                        placeholder="Ex: Vinhos Brancos"
                        value={newRound.name}
                        onChange={(e) => setNewRound(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Vinho</label>
                      <Input 
                        placeholder="Ex: Sauvignon Blanc"
                        value={newRound.wine_type}
                        onChange={(e) => setNewRound(prev => ({ ...prev, wine_type: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Número da Rodada</label>
                      <Input type="number" defaultValue="1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição</label>
                    <Textarea 
                      placeholder="Descrição da rodada e contexto do vinho..."
                      value={newRound.description}
                      onChange={(e) => setNewRound(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Perguntas da Rodada (0 selecionadas)</label>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {questions.map((question) => (
                        <div key={question.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`question-${question.id}`}
                            checked={newRound.selected_questions.includes(question.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewRound(prev => ({
                                  ...prev,
                                  selected_questions: [...prev.selected_questions, question.id]
                                }));
                              } else {
                                setNewRound(prev => ({
                                  ...prev,
                                  selected_questions: prev.selected_questions.filter(id => id !== question.id)
                                }));
                              }
                            }}
                          />
                          <label htmlFor={`question-${question.id}`} className="text-sm cursor-pointer">
                            {question.question_text.substring(0, 60)}... (Peso: {question.weight})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateRound}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newRound.name || !newRound.description || newRound.selected_questions.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Rodada
                  </Button>
                </CardContent>
              </Card>

              {/* Rounds List */}
              <Card>
                <CardHeader>
                  <CardTitle>Todas as Rodadas da Sessão</CardTitle>
                </CardHeader>
                <CardContent>
                  {rounds.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma rodada criada ainda</p>
                      <p className="text-sm">Crie uma rodada acima para organizar suas perguntas por vinho</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rounds.map((round) => (
                        <div key={round.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{round.name}</h4>
                            <Badge variant={round.status === 'active' ? 'default' : 'secondary'}>
                              {round.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{round.description}</p>
                          <div className="text-xs text-gray-500">
                            Tipo de Vinho: {round.wine_type} | {round.questions.length} perguntas
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Management Tab */}
          <TabsContent value="perguntas">
            <div className="space-y-8">
              {/* Create Question */}
              <Card>
                <CardHeader>
                  <CardTitle>Nova Pergunta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pergunta</label>
                    <Textarea 
                      placeholder="Digite sua pergunta aqui..."
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Pergunta</label>
                    <Select 
                      value={newQuestion.question_type}
                      onValueChange={(value: 'multiple_choice' | 'autocomplete') => 
                        setNewQuestion(prev => ({ ...prev, question_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Múltipla Escolha (2-4 opções)</SelectItem>
                        <SelectItem value="autocomplete">Autocomplete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newQuestion.question_type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Opção A</label>
                        <Input 
                          placeholder="Opção A"
                          value={newQuestion.option_a}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, option_a: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Opção B</label>
                        <Input 
                          placeholder="Opção B"
                          value={newQuestion.option_b}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, option_b: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Opção C (Opcional)</label>
                        <Input 
                          placeholder="Opção C (opcional)"
                          value={newQuestion.option_c}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, option_c: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Opção D (Opcional)</label>
                        <Input 
                          placeholder="Opção D (opcional)"
                          value={newQuestion.option_d}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, option_d: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Resposta Correta</label>
                      {newQuestion.question_type === 'multiple_choice' ? (
                        <Select 
                          value={newQuestion.correct_option}
                          onValueChange={(value: 'a' | 'b' | 'c' | 'd') => 
                            setNewQuestion(prev => ({ ...prev, correct_option: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a">A</SelectItem>
                            <SelectItem value="b">B</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="d">D</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          placeholder="Resposta correta para autocomplete"
                          value={newQuestion.correct_answer}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Peso (Pontuação)</label>
                      <Input 
                        type="number"
                        min="1"
                        max="10"
                        value={newQuestion.weight}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveQuestion}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!newQuestion.question_text || 
                             (newQuestion.question_type === 'multiple_choice' && !newQuestion.option_a) ||
                             (newQuestion.question_type === 'autocomplete' && !newQuestion.correct_answer)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Salvar Pergunta
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas Criadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{question.question_text}</h4>
                          <div className="flex space-x-2">
                            <Badge variant="outline">
                              {question.question_type === 'multiple_choice' ? 'Múltipla Escolha' : 'Autocomplete'}
                            </Badge>
                            <Badge variant="secondary">Peso: {question.weight}</Badge>
                          </div>
                        </div>

                        {question.question_type === 'multiple_choice' && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>A:</strong> {question.option_a} | 
                            <strong> B:</strong> {question.option_b}
                            {question.option_c && <><strong> | C:</strong> {question.option_c}</>}
                            {question.option_d && <><strong> | D:</strong> {question.option_d}</>}
                            <br />
                            <strong className="text-green-600">Correta:</strong> {question.correct_option?.toUpperCase()}
                          </div>
                        )}

                        {question.question_type === 'autocomplete' && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong className="text-green-600">Resposta Correta:</strong> {question.correct_answer}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="resultados">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-600">{sessionStats.questionsCreated}</div>
                  <p className="text-sm text-gray-600">Perguntas Criadas</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600">{sessionStats.maxParticipants}</div>
                  <p className="text-sm text-gray-600">Participantes Máximo</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className={`text-3xl font-bold ${sessionStats.sessionStatus === 'Ativa' ? 'text-green-600' : 'text-gray-600'}`}>
                    {sessionStats.sessionStatus}
                  </div>
                  <p className="text-sm text-gray-600">Status da Sessão</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600">{sessionStats.availableTables}</div>
                  <p className="text-sm text-gray-600">Mesas Disponíveis</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Gráfico de Resultados
              </Button>
              <Button variant="outline" className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600">
                <Users className="h-4 w-4 mr-2" />
                Revisar Respostas Corretas
              </Button>
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Relatório de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use "Revisar Respostas" para mostrar aos participantes quais foram as respostas corretas de cada pergunta
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}