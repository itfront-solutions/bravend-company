import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wine, 
  Clock, 
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Search,
  Star
} from 'lucide-react';
import WineGuideHint from '@/components/vinhonarios/WineGuideHint';

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

interface Team {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface User {
  id: number;
  name: string;
  team_id: number;
  is_leader: boolean;
  session_token: string;
}

export default function QuestionView() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(120); // 2 minutes default
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [roundInfo, setRoundInfo] = useState<{ name: string; wine_type: string; description: string } | null>(null);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (!sessionActive || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, isSubmitted, timeRemaining]);

  // Load initial data
  useEffect(() => {
    loadCurrentQuestion();
    loadTeamInfo();
    loadUserInfo();
  }, []);

  // Handle autocomplete filtering
  useEffect(() => {
    if (currentQuestion?.question_type === 'autocomplete' && currentQuestion.options) {
      const filtered = currentQuestion.options.filter(option =>
        option.toLowerCase().includes(textAnswer.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [textAnswer, currentQuestion]);

  const loadCurrentQuestion = async () => {
    try {
      // In a real implementation, this would get the active question from WebSocket or API
      // For now, we'll simulate with a sample question
      const sampleQuestion: Question = {
        id: 1,
        question_text: "Qual é a idade do vinho degustado?",
        question_type: 'multiple_choice',
        option_a: '0 a 3 anos',
        option_b: '4 a 7 anos',
        option_c: '8 a 11 anos',
        option_d: '12 ou +',
        correct_option: 'b',
        weight: 2
      };
      
      setCurrentQuestion(sampleQuestion);
      setTimeRemaining(120); // Reset timer for new question
      
      // Sample round info
      setRoundInfo({
        name: "Degustação de Vinhos Tintos",
        wine_type: "Cabernet Sauvignon 2018",
        description: "Análise sensorial de vinho tinto encorpado da região de Bordeaux"
      });
    } catch (error) {
      console.error('Error loading question:', error);
      toast({
        title: "Erro ao carregar pergunta",
        description: "Tente recarregar a página",
        variant: "destructive"
      });
    }
  };

  const loadTeamInfo = async () => {
    try {
      // Sample team info - in real implementation, get from user session
      setTeam({
        id: 1,
        name: "Mesa dos Experts",
        color: "#8B5CF6",
        icon: "🍷"
      });
    } catch (error) {
      console.error('Error loading team info:', error);
    }
  };

  const loadUserInfo = async () => {
    try {
      // Sample user info - in real implementation, get from authentication
      setUser({
        id: 1,
        name: "João Silva",
        team_id: 1,
        is_leader: false,
        session_token: "sample_token"
      });
      setSessionActive(true);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleMultipleChoiceSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleAutocompleteSelect = (option: string) => {
    setTextAnswer(option);
    setFilteredOptions([]);
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitted || !currentQuestion) return;

    let answerToSubmit = '';
    
    if (currentQuestion.question_type === 'multiple_choice') {
      if (!selectedAnswer) {
        toast({
          title: "Selecione uma resposta",
          description: "Por favor, escolha uma das opções",
          variant: "destructive"
        });
        return;
      }
      answerToSubmit = selectedAnswer;
    } else if (currentQuestion.question_type === 'autocomplete') {
      if (!textAnswer.trim()) {
        toast({
          title: "Digite uma resposta",
          description: "Por favor, digite sua resposta",
          variant: "destructive"
        });
        return;
      }
      answerToSubmit = textAnswer.trim();
    }

    try {
      const response = await fetch('/api/wine-quiz/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          user_id: user?.id,
          selected_option: currentQuestion.question_type === 'multiple_choice' ? selectedAnswer : null,
          text_answer: currentQuestion.question_type === 'autocomplete' ? answerToSubmit : null
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Resposta enviada!",
          description: "Aguarde a próxima pergunta",
        });
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro ao enviar resposta",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitted) return;
    
    // Submit empty or current answer when time runs out
    await handleSubmitAnswer();
    
    toast({
      title: "Tempo esgotado!",
      description: "Sua resposta foi enviada automaticamente",
      variant: "destructive"
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 60) return 'text-green-600';
    if (timeRemaining > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressValue = () => {
    return ((120 - timeRemaining) / 120) * 100;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-8 text-center">
            <Wine className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aguardando pergunta...</h2>
            <p className="text-gray-600">O administrador irá lançar a próxima pergunta em breve</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-red-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              {team && (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <span className="text-xl">{team.icon}</span>
                  <span className="font-semibold">{team.name}</span>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-xs text-purple-200">tempo restante</div>
              </div>
              <Clock className={`h-6 w-6 ${getTimeColor()}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Timer Progress Bar */}
        <div className="mb-6">
          <Progress 
            value={getProgressValue()} 
            className="h-2"
          />
        </div>

        {/* Round Info */}
        {roundInfo && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-800">{roundInfo.name}</h3>
                  <p className="text-sm text-gray-600">{roundInfo.wine_type}</p>
                </div>
                <Badge variant="outline" className="flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  {currentQuestion.weight} pontos
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mt-2">{roundInfo.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wine className="h-6 w-6 mr-2 text-purple-600" />
                Pergunta {currentQuestion.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {currentQuestion.question_text}
              </h2>

              {/* Multiple Choice Options */}
              {currentQuestion.question_type === 'multiple_choice' && (
                <div className="space-y-3">
                  {[
                    { key: 'a', text: currentQuestion.option_a },
                    { key: 'b', text: currentQuestion.option_b },
                    { key: 'c', text: currentQuestion.option_c },
                    { key: 'd', text: currentQuestion.option_d }
                  ].map((option) => {
                    if (!option.text) return null;
                    
                    const isSelected = selectedAnswer === option.key;
                    
                    return (
                      <button
                        key={option.key}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                          isSelected 
                            ? 'border-purple-600 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                        } ${isSubmitted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        onClick={() => handleMultipleChoiceSelect(option.key)}
                        disabled={isSubmitted}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-600' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <span className="font-medium text-purple-800">
                            {option.key.toUpperCase()}:
                          </span>
                          <span>{option.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Autocomplete Input */}
              {currentQuestion.question_type === 'autocomplete' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Digite sua resposta ou busque nas opções..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      className="pl-10 text-lg"
                      disabled={isSubmitted}
                    />
                  </div>

                  {/* Autocomplete Suggestions */}
                  {filteredOptions.length > 0 && !isSubmitted && (
                    <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                      {filteredOptions.map((option, index) => (
                        <button
                          key={index}
                          className="w-full p-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleAutocompleteSelect(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {!isSubmitted ? (
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={handleSubmitAnswer}
                    size="lg"
                    className="px-8 py-3"
                    disabled={
                      (currentQuestion.question_type === 'multiple_choice' && !selectedAnswer) ||
                      (currentQuestion.question_type === 'autocomplete' && !textAnswer.trim())
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </Button>
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-lg font-semibold">Resposta enviada!</span>
                  </div>
                  <p className="text-gray-600">Aguarde a próxima pergunta ou o resultado da rodada</p>
                </div>
              )}

              {/* Status Indicators */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Pontuação: {currentQuestion.weight} pontos</span>
                  {user?.is_leader && (
                    <Badge variant="secondary">Porta-voz</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {timeRemaining <= 30 && !isSubmitted && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Tempo quase esgotado!</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hint System */}
      <WineGuideHint />
    </div>
  );
}