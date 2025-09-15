import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Wine, 
  Users, 
  UserPlus,
  Check,
  Crown,
  QrCode,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import WineGuideHint from '@/components/vinhonarios/WineGuideHint';

interface Team {
  id?: number;
  name: string;
  color: string;
  icon: string;
  members: TeamMember[];
  max_members: number;
  qr_code?: string;
  is_leader?: boolean;
}

interface TeamMember {
  name: string;
  is_leader: boolean;
  device_fingerprint?: string;
}

interface WineQuizSession {
  id: number;
  status: string;
  game_mode: 'individual' | 'leader';
}

export default function TeamRegistration() {
  const [currentStep, setCurrentStep] = useState<'team-setup' | 'member-registration' | 'confirmation'>('team-setup');
  const [gameMode, setGameMode] = useState<'individual' | 'leader'>('individual');
  const [team, setTeam] = useState<Team>({
    name: '',
    color: '#8B5CF6',
    icon: '🍷',
    members: [],
    max_members: 4
  });
  const [currentMember, setCurrentMember] = useState({ name: '', is_leader: false });
  const [activeSession, setActiveSession] = useState<WineQuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Wine-themed color options
  const colorOptions = [
    { color: '#8B5CF6', name: 'Violeta' },
    { color: '#DC2626', name: 'Vinho Tinto' },
    { color: '#0891B2', name: 'Azul Celeste' },
    { color: '#059669', name: 'Verde Jade' },
    { color: '#D97706', name: 'Âmbar' },
    { color: '#7C2D12', name: 'Mogno' },
    { color: '#BE185D', name: 'Rosa Rosé' },
    { color: '#1E40AF', name: 'Azul Royal' }
  ];

  // Wine-themed icons
  const iconOptions = [
    '🍷', '🍇', '🥂', '🍾', '🌿', '🌺', '🌟', '🎭', 
    '🎪', '🎨', '🎵', '⚡', '🔥', '💎', '🌙', '🌊'
  ];

  // Check for active session
  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const response = await fetch('/api/wine-quiz/session/current');
      if (response.ok) {
        const session = await response.json();
        if (session) {
          setActiveSession(session);
          setGameMode(session.game_mode);
        }
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const handleTeamSetup = () => {
    if (!team.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome da sua mesa/equipe",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('member-registration');
  };

  const addMember = () => {
    if (!currentMember.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome do participante",
        variant: "destructive"
      });
      return;
    }

    if (team.members.length >= team.max_members) {
      toast({
        title: "Mesa cheia",
        description: `Esta mesa já tem o máximo de ${team.max_members} participantes`,
        variant: "destructive"
      });
      return;
    }

    // Check if it's leader mode and we already have a leader
    if (gameMode === 'leader' && currentMember.is_leader && team.members.some(m => m.is_leader)) {
      toast({
        title: "Apenas um porta-voz",
        description: "Já existe um porta-voz nesta mesa",
        variant: "destructive"
      });
      return;
    }

    const newMember: TeamMember = {
      name: currentMember.name.trim(),
      is_leader: currentMember.is_leader,
      device_fingerprint: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setTeam(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setCurrentMember({ name: '', is_leader: false });

    toast({
      title: "Participante adicionado",
      description: `${newMember.name} foi adicionado à mesa`,
    });
  };

  const removeMember = (index: number) => {
    setTeam(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const finishRegistration = async () => {
    if (team.members.length === 0) {
      toast({
        title: "Pelo menos um participante",
        description: "Adicione pelo menos um participante à mesa",
        variant: "destructive"
      });
      return;
    }

    // For leader mode, ensure we have a leader
    if (gameMode === 'leader' && !team.members.some(m => m.is_leader)) {
      toast({
        title: "Porta-voz necessário",
        description: "No modo Líder, é necessário designar um porta-voz",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create team
      const teamResponse = await fetch('/api/wine-quiz/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: team.name,
          color: team.color,
          icon: team.icon,
          max_members: team.max_members,
          qr_code: `wine-quiz-${Date.now()}`
        })
      });

      if (!teamResponse.ok) {
        throw new Error('Failed to create team');
      }

      const createdTeam = await teamResponse.json();

      // Create users for each member
      for (const member of team.members) {
        const userResponse = await fetch('/api/wine-quiz/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: member.name,
            team_id: createdTeam.team.id,
            is_leader: member.is_leader,
            device_fingerprint: member.device_fingerprint
          })
        });

        if (!userResponse.ok) {
          console.error(`Failed to create user ${member.name}`);
        }
      }

      setTeam(prev => ({ ...prev, id: createdTeam.team.id, qr_code: createdTeam.team.qr_code }));
      setCurrentStep('confirmation');

      toast({
        title: "Mesa registrada com sucesso!",
        description: `Mesa "${team.name}" criada com ${team.members.length} participantes`,
      });

    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Erro ao criar mesa",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startQuizSession = () => {
    // Redirect to quiz interface or waiting room
    window.location.href = '/vinhonarios/scoreboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-red-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Wine className="h-12 w-12 mr-4" />
              <h1 className="text-4xl font-bold">Vinhos & Visões</h1>
            </div>
            <p className="text-xl text-purple-100">
              Quiz Interativo de Conhecimento Vinícola
            </p>
            {activeSession && (
              <Badge className="mt-2 bg-green-600">
                Sessão Ativa - Modo {activeSession.game_mode === 'individual' ? 'Individual' : 'Líder'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Step 1: Team Setup */}
        {currentStep === 'team-setup' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Configurar Mesa / Equipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Game Mode Info */}
                {activeSession && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Modo de Jogo: {gameMode === 'individual' ? 'Individual' : 'Líder/Porta-voz'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      {gameMode === 'individual' 
                        ? 'Todos os participantes respondem às perguntas individualmente'
                        : 'Apenas o porta-voz da mesa responde pelas perguntas da equipe'
                      }
                    </p>
                  </div>
                )}

                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Mesa/Equipe</label>
                  <Input 
                    placeholder="Ex: Mesa dos Sommeliers, Equipe Terroir, etc."
                    value={team.name}
                    onChange={(e) => setTeam(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Team Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cor da Mesa</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.color}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center space-y-1 transition-all ${
                          team.color === option.color 
                            ? 'border-purple-600 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setTeam(prev => ({ ...prev, color: option.color }))}
                      >
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: option.color }}
                        ></div>
                        <span className="text-xs text-gray-600">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Icon */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ícone da Mesa</label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                          team.icon === icon 
                            ? 'border-purple-600 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setTeam(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Members */}
                <div>
                  <label className="block text-sm font-medium mb-2">Número Máximo de Participantes</label>
                  <Select value={team.max_members.toString()} onValueChange={(value) => 
                    setTeam(prev => ({ ...prev, max_members: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 pessoas</SelectItem>
                      <SelectItem value="3">3 pessoas</SelectItem>
                      <SelectItem value="4">4 pessoas</SelectItem>
                      <SelectItem value="5">5 pessoas</SelectItem>
                      <SelectItem value="6">6 pessoas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleTeamSetup} className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continuar para Cadastro de Participantes
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Member Registration */}
        {currentStep === 'member-registration' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Member Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-6 w-6 mr-2" />
                    Adicionar Participante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome do Participante</label>
                    <Input 
                      placeholder="Digite o nome completo"
                      value={currentMember.name}
                      onChange={(e) => setCurrentMember(prev => ({ ...prev, name: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addMember()}
                    />
                  </div>

                  {gameMode === 'leader' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="is-leader"
                        checked={currentMember.is_leader}
                        onCheckedChange={(checked) => 
                          setCurrentMember(prev => ({ ...prev, is_leader: checked as boolean }))
                        }
                      />
                      <label htmlFor="is-leader" className="text-sm font-medium">
                        Este participante é o porta-voz da mesa
                      </label>
                      <Crown className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}

                  <Button onClick={addMember} className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar à Mesa
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    {team.members.length} / {team.max_members} participantes
                  </div>

                  <Button 
                    onClick={finishRegistration}
                    variant="outline" 
                    className="w-full"
                    disabled={team.members.length === 0 || isLoading}
                  >
                    {isLoading ? 'Criando mesa...' : 'Finalizar Cadastro da Mesa'}
                  </Button>
                </CardContent>
              </Card>

              {/* Team Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-3"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    {team.icon} {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Participantes:</h4>
                    {team.members.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Nenhum participante adicionado ainda
                      </p>
                    ) : (
                      team.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{member.name}</span>
                            {member.is_leader && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="h-3 w-3 mr-1" />
                                Porta-voz
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeMember(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 'confirmation' && (
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="mb-6">
                  <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Mesa Registrada com Sucesso!
                  </h2>
                  <p className="text-gray-600">
                    Sua mesa "{team.name}" foi criada e está pronta para participar do quiz
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className="w-8 h-8 rounded-full mr-3"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span className="text-2xl">{team.icon}</span>
                    <h3 className="text-xl font-bold ml-3">{team.name}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Participantes:</strong> {team.members.length}</p>
                    <p><strong>Modo:</strong> {gameMode === 'individual' ? 'Individual' : 'Líder/Porta-voz'}</p>
                    {team.qr_code && (
                      <p><strong>Código da Mesa:</strong> {team.qr_code}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={startQuizSession} size="lg" className="w-full">
                    <QrCode className="h-5 w-5 mr-2" />
                    Acessar Quiz
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Aguarde o início da sessão pelo administrador
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Hint System */}
      <WineGuideHint />
    </div>
  );
}