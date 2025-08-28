import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ArrowLeft, Crown, Star } from 'lucide-react';
import { Link } from 'wouter';

interface TeamScore {
  id: number;
  name: string;
  totalScore: number;
  lastQuestionScore: number;
  participantCount: number;
  avgResponseTime: number;
}

interface Question {
  id: number;
  text: string;
  isActive: boolean;
  timeRemaining?: number;
}

export default function Scoreboard() {
  const [teams, setTeams] = useState<TeamScore[]>([
    {
      id: 1,
      name: "Mesa 1 - Terroir",
      totalScore: 185,
      lastQuestionScore: 15,
      participantCount: 4,
      avgResponseTime: 8.5
    },
    {
      id: 2,
      name: "Mesa 2 - Harmonização",
      totalScore: 172,
      lastQuestionScore: 12,
      participantCount: 3,
      avgResponseTime: 12.3
    },
    {
      id: 3,
      name: "Mesa 3 - Envelhecimento",
      totalScore: 168,
      lastQuestionScore: 18,
      participantCount: 4,
      avgResponseTime: 7.8
    },
    {
      id: 4,
      name: "Mesa 4 - Degustação",
      totalScore: 156,
      lastQuestionScore: 8,
      participantCount: 2,
      avgResponseTime: 15.2
    },
    {
      id: 5,
      name: "Mesa 5 - Vinificação",
      totalScore: 143,
      lastQuestionScore: 10,
      participantCount: 3,
      avgResponseTime: 11.7
    }
  ]);

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: 1,
    text: "Qual região é conhecida pelos vinhos Barolo e Barbaresco?",
    isActive: false,
    timeRemaining: 0
  });

  const [sessionActive, setSessionActive] = useState(false);

  // Simular atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular pequenas mudanças na pontuação
      setTeams(prevTeams => 
        prevTeams.map(team => ({
          ...team,
          totalScore: Math.max(0, team.totalScore + (Math.random() - 0.5) * 2)
        })).sort((a, b) => b.totalScore - a.totalScore)
      );

      // Simular mudanças na pergunta ativa
      if (Math.random() > 0.95) {
        setCurrentQuestion(prev => ({
          ...prev,
          isActive: !prev.isActive,
          timeRemaining: prev.isActive ? 0 : 30
        }));
      }

      // Decrementar tempo se pergunta ativa
      setCurrentQuestion(prev => 
        prev.isActive && prev.timeRemaining! > 0 
          ? { ...prev, timeRemaining: prev.timeRemaining! - 1 }
          : prev
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-300" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-purple-400 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/vinhonarios/vinhos-visoes">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="border-l border-white/30 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                  Placar Oficial - Vinhos & Visões
                </h1>
                <p className="text-purple-200 mt-1">Competição de Conhecimentos sobre Vinhos</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              sessionActive 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {sessionActive ? '🔴 AO VIVO' : '⏸️ PAUSADO'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Question */}
        {currentQuestion.isActive && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">
                      {currentQuestion.timeRemaining}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Pergunta Ativa</h2>
                    <p className="text-gray-200">{currentQuestion.text}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentQuestion.timeRemaining! / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <div className="space-y-4">
          {/* Top 3 - Destacado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {teams.slice(0, 3).map((team, index) => (
              <Card key={team.id} className={`bg-gradient-to-br ${getPositionColor(index + 1)} text-white shadow-xl transform hover:scale-105 transition-transform`}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getPositionIcon(index + 1)}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                  <div className="text-3xl font-bold mb-2">
                    {Math.round(team.totalScore)}
                  </div>
                  <div className="text-sm opacity-90">
                    {team.participantCount} participantes
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    {index + 1}° Lugar
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resto das equipes */}
          {teams.slice(3).map((team, index) => (
            <Card key={team.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">{index + 4}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{team.name}</h3>
                      <div className="text-sm text-purple-200">
                        {team.participantCount} participantes • 
                        Tempo médio: {team.avgResponseTime}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-200">
                      {Math.round(team.totalScore)}
                    </div>
                    <div className="text-sm text-purple-300">
                      Última: +{team.lastQuestionScore}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics Footer */}
        <Card className="mt-8 bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{teams.length}</div>
                <div className="text-sm text-purple-200">Equipes Participando</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {teams.reduce((sum, team) => sum + team.participantCount, 0)}
                </div>
                <div className="text-sm text-purple-200">Total de Participantes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(teams.reduce((sum, team) => sum + team.avgResponseTime, 0) / teams.length)}s
                </div>
                <div className="text-sm text-purple-200">Tempo Médio de Resposta</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(teams[0]?.totalScore || 0)}
                </div>
                <div className="text-sm text-purple-200">Maior Pontuação</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Atualizando em tempo real
          </div>
        </div>
      </div>
    </div>
  );
}