import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Wine, Play, Square, Rocket, Clock, Save, Edit, Trash2, ExternalLink, QrCode, TrendingUp, BarChart3, Check, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface Question {
  id: number;
  questionText: string;
  questionType: "multiple_choice" | "dropdown" | "autocomplete";
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "a" | "b" | "c" | "d";
  options?: string[];
  correctAnswer?: string;
  weight: number;
}

interface GameSession {
  id: number;
  status: "active" | "inactive";
  gameMode: "individual" | "leader";
  currentQuestionId?: number;
}

interface Round {
  id: number;
  name: string;
  wineType?: string;
  roundNumber: number;
  description?: string;
  status: "pending" | "active" | "finished";
  questionIds?: number[];
}

export default function WineQuizAdminDashboard() {
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionType: "multiple_choice" as "multiple_choice" | "dropdown" | "autocomplete",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "a" as "a" | "b" | "c" | "d",
    options: [] as string[],
    correctAnswer: "",
    weight: 10
  });
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [gameMode, setGameMode] = useState<"individual" | "leader">("individual");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>();
  const [newOption, setNewOption] = useState("");
  const [currentRound, setCurrentRound] = useState({
    name: "",
    wineType: "",
    roundNumber: 1,
    description: "",
    questionIds: [] as number[]
  });
  
  const { toast } = useToast();

  // Mock data for development
  const questions: Question[] = [
    {
      id: 1,
      questionText: "Qual região é famosa pelo vinho Champagne?",
      questionType: "multiple_choice",
      optionA: "Borgonha",
      optionB: "Champagne",
      optionC: "Bordeaux",
      optionD: "Loire",
      correctOption: "b",
      weight: 10
    },
    {
      id: 2,
      questionText: "Qual uva é usada para fazer Chablis?",
      questionType: "autocomplete",
      options: ["Chardonnay", "Sauvignon Blanc", "Pinot Noir", "Merlot", "Cabernet Sauvignon"],
      correctAnswer: "Chardonnay",
      weight: 15
    }
  ];

  const currentSession: GameSession = {
    id: 1,
    status: "inactive",
    gameMode: "individual"
  };

  const scores = [
    { teamId: 1, teamName: "Mesa 1 - Terroir", totalScore: 85 },
    { teamId: 2, teamName: "Mesa 2 - Harmonização", totalScore: 72 },
    { teamId: 3, teamName: "Mesa 3 - Envelhecimento", totalScore: 68 }
  ];

  const rounds: Round[] = [
    {
      id: 1,
      name: "Vinhos Franceses",
      wineType: "Bordeaux",
      roundNumber: 1,
      description: "Conhecimentos sobre vinhos da região de Bordeaux",
      status: "finished",
      questionIds: [1]
    }
  ];

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pergunta Salva",
      description: "A pergunta foi salva com sucesso!",
    });
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      questionText: "",
      questionType: "multiple_choice",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "a",
      options: [],
      correctAnswer: "",
      weight: 10
    });
    setNewOption("");
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({
      questionText: question.questionText,
      questionType: question.questionType || "multiple_choice",
      optionA: question.optionA || "",
      optionB: question.optionB || "",
      optionC: question.optionC || "",
      optionD: question.optionD || "",
      correctOption: question.correctOption || "a",
      options: question.options || [],
      correctAnswer: question.correctAnswer || "",
      weight: question.weight
    });
    setEditingQuestion(question);
  };

  const addOption = () => {
    if (newOption.trim() && !currentQuestion.options.includes(newOption.trim())) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-0 min-h-[4rem] sm:h-16">
            <div className="flex items-center mb-2 sm:mb-0">
              <Link href="/vinhonarios/vinhos-visoes">
                <Button variant="ghost" size="sm" className="mr-3">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Wine className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Painel do Sommelier</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>{currentSession?.status === "active" ? "Sessão Ativa" : "Sessão Inativa"}</span>
                {currentSession?.gameMode && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">
                    Modo: {currentSession.gameMode === 'leader' ? 'Porta Voz da Equipe' : 'Individual'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="session" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="session" className="text-xs sm:text-sm">Controle da Sessão</TabsTrigger>
            <TabsTrigger value="rounds" className="text-xs sm:text-sm">Rodadas</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">Gerenciar Perguntas</TabsTrigger>
            <TabsTrigger value="results" className="text-xs sm:text-sm">Resultados</TabsTrigger>
          </TabsList>

          {/* Session Control */}
          <TabsContent value="session">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
              <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                {/* Session Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Controle da Sessão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Modo de Jogo</Label>
                      <Select value={gameMode} onValueChange={(value: "individual" | "leader") => setGameMode(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual - Cada participante responde</SelectItem>
                          <SelectItem value="leader">Porta Voz - Apenas o Porta Voz responde</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button 
                        className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                        onClick={() => toast({ title: "Sessão Iniciada", description: "Nova sessão foi iniciada!" })}
                        disabled={currentSession?.status === "active"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Sessão
                      </Button>
                      <Button 
                        className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                        onClick={() => toast({ title: "Sessão Finalizada", description: "Sessão foi finalizada!" })}
                        disabled={currentSession?.status !== "active"}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Finalizar Sessão
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Question */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pergunta Atual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Selecionar Pergunta</Label>
                      <Select value={selectedQuestionId?.toString()} onValueChange={(value) => setSelectedQuestionId(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma pergunta..." />
                        </SelectTrigger>
                        <SelectContent>
                          {questions.map((question) => (
                            <SelectItem key={question.id} value={question.id.toString()}>
                              {question.questionText.substring(0, 50)}... (Peso: {question.weight})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button 
                        className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                        onClick={() => toast({ title: "Pergunta Lançada", description: "Pergunta foi enviada para os participantes!" })}
                        disabled={!selectedQuestionId || currentSession?.status !== "active"}
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Lançar Pergunta
                      </Button>
                      <Button 
                        className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700 text-sm sm:text-base"
                        onClick={() => toast({ title: "Pergunta Encerrada", description: "Tempo esgotado!" })}
                        disabled={!currentSession?.currentQuestionId}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Encerrar Pergunta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Scoreboard */}
              <Card>
                <CardHeader>
                  <CardTitle>Placar ao Vivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scores.map((team: any, index: number) => (
                      <div key={team.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-700 font-medium text-sm">{index + 1}</span>
                          </div>
                          <span className="font-medium">{team.teamName}</span>
                        </div>
                        <span className="text-lg font-bold text-purple-700">{Math.round(team.totalScore)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Link href="/vinhonarios/scoreboard">
                      <Button className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm sm:text-base">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Tela Pública
                      </Button>
                    </Link>
                    <Link href="/vinhonarios/qr-codes">
                      <Button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm sm:text-base">
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Codes das Equipes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Questions Management */}
          <TabsContent value="questions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingQuestion ? "Editar Pergunta" : "Nova Pergunta"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveQuestion} className="space-y-4">
                    <div>
                      <Label>Pergunta</Label>
                      <Textarea
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                        placeholder="Digite sua pergunta aqui..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Tipo de Pergunta</Label>
                      <Select value={currentQuestion.questionType} onValueChange={(value: "multiple_choice" | "autocomplete") => 
                        setCurrentQuestion(prev => ({ ...prev, questionType: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Múltipla Escolha (2-4 opções)</SelectItem>
                          <SelectItem value="autocomplete">Autocomplete (muitas opções)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Multiple Choice Fields */}
                    {currentQuestion.questionType === 'multiple_choice' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Opção A</Label>
                          <Input
                            value={currentQuestion.optionA}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, optionA: e.target.value }))}
                            placeholder="Opção A"
                          />
                        </div>
                        <div>
                          <Label>Opção B</Label>
                          <Input
                            value={currentQuestion.optionB}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, optionB: e.target.value }))}
                            placeholder="Opção B"
                          />
                        </div>
                        <div>
                          <Label>Opção C (Opcional)</Label>
                          <Input
                            value={currentQuestion.optionC}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, optionC: e.target.value }))}
                            placeholder="Opção C (opcional)"
                          />
                        </div>
                        <div>
                          <Label>Opção D (Opcional)</Label>
                          <Input
                            value={currentQuestion.optionD}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, optionD: e.target.value }))}
                            placeholder="Opção D (opcional)"
                          />
                        </div>
                      </div>
                    )}

                    {/* Autocomplete Fields */}
                    {currentQuestion.questionType === 'autocomplete' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Adicionar Opções (mínimo 5)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              placeholder="Digite uma opção..."
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                            />
                            <Button type="button" onClick={addOption}>Adicionar</Button>
                          </div>
                        </div>

                        {currentQuestion.options.length > 0 && (
                          <div>
                            <Label>Opções ({currentQuestion.options.length})</Label>
                            <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                              {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                                  <span className="text-sm">{option}</span>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label>Resposta Correta</Label>
                          <Select 
                            value={currentQuestion.correctAnswer} 
                            onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a resposta correta..." />
                            </SelectTrigger>
                            <SelectContent>
                              {currentQuestion.options.map((option, index) => (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice Correct Answer */}
                    {currentQuestion.questionType === 'multiple_choice' && (
                      <div>
                        <Label>Resposta Correta</Label>
                        <Select value={currentQuestion.correctOption} onValueChange={(value: "a" | "b" | "c" | "d") => setCurrentQuestion(prev => ({ ...prev, correctOption: value }))}>
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
                      </div>
                    )}

                    <div>
                      <Label>Peso (Pontuação)</Label>
                      <Input
                        type="number"
                        value={currentQuestion.weight}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                        placeholder="10"
                        min="1"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Save className="h-4 w-4 mr-2" />
                        {editingQuestion ? "Atualizar Pergunta" : "Salvar Pergunta"}
                      </Button>
                      {editingQuestion && (
                        <Button type="button" variant="outline" onClick={resetQuestionForm}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas Criadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{question.questionText}</h4>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              question.questionType === 'autocomplete' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {question.questionType === 'autocomplete' ? 'Autocomplete' : 'Múltipla Escolha'}
                            </span>
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                              Peso: {question.weight}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => toast({ title: "Pergunta deletada", description: "A pergunta foi removida." })}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
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

          {/* Results */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {questions.length}
                    </div>
                    <div className="text-sm text-purple-600">Perguntas Criadas</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">20</div>
                    <div className="text-sm text-blue-600">Participantes Máximo</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {currentSession?.status === "active" ? "Ativa" : "Inativa"}
                    </div>
                    <div className="text-sm text-green-600">Status da Sessão</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">5</div>
                    <div className="text-sm text-yellow-600">Mesas Disponíveis</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Equipe</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Pontuação Final</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Posição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((team: any, index: number) => (
                        <tr key={team.teamId} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{team.teamName}</td>
                          <td className="py-3 px-4 text-center font-bold text-purple-700">
                            {Math.round(team.totalScore)}
                          </td>
                          <td className="py-3 px-4 text-center">{index + 1}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rounds Management */}
          <TabsContent value="rounds">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Rodadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sistema de Rodadas</p>
                  <p className="text-sm mt-2">
                    Funcionalidade disponível em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}