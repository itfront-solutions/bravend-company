import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Send,
  Eye,
  Target,
  Users,
  Mail,
  MessageSquare,
  Settings2,
  Lightbulb
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  type: 'nps' | 'text' | 'rating' | 'multiple_choice';
  text: string;
  weight?: number;
  options?: string[];
  required: boolean;
}

interface Channel {
  type: 'email' | 'sms' | 'whatsapp' | 'link';
  enabled: boolean;
  config?: any;
}

export default function CreateSurvey() {
  const [, setLocation] = useLocation();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'nps',
      text: 'Em uma escala de 0 a 10, o quanto você recomendaria nosso produto/serviço para um amigo ou colega?',
      required: true,
      weight: 1
    }
  ]);
  
  // Settings state
  const [useWeightedIndex, setUseWeightedIndex] = useState(false);
  const [anonymousResponses, setAnonymousResponses] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(true);
  const [allowPartialResponses, setAllowPartialResponses] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(true);
  
  // Distribution settings
  const [channels, setChannels] = useState<Channel[]>([
    { type: 'email', enabled: true },
    { type: 'sms', enabled: false },
    { type: 'whatsapp', enabled: false },
    { type: 'link', enabled: true }
  ]);
  
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  
  // UI state
  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const questionTypes = [
    { value: 'nps', label: 'NPS (0-10)', icon: Target },
    { value: 'text', label: 'Texto Livre', icon: MessageSquare },
    { value: 'rating', label: 'Avaliação (1-5)', icon: '⭐' },
    { value: 'multiple_choice', label: 'Múltipla Escolha', icon: '📋' }
  ];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      required: false,
      weight: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const updateChannel = (type: string, enabled: boolean) => {
    setChannels(channels.map(ch => ch.type === type ? { ...ch, enabled } : ch));
  };

  const handleSave = async (publish: boolean = false) => {
    // For draft saves, allow saving with minimal validation
    if (!publish && !name.trim()) {
      alert('Nome da pesquisa é obrigatório para salvar');
      setActiveStep(1);
      return;
    }

    // For publishing, validate all required fields
    if (publish) {
      if (!name.trim()) {
        alert('Nome da pesquisa é obrigatório');
        setActiveStep(1);
        return;
      }
      
      if (questions.some(q => !q.text.trim())) {
        alert('Todas as perguntas devem ter texto preenchido');
        setActiveStep(2);
        return;
      }
      
      if (!channels.some(ch => ch.enabled)) {
        alert('Selecione pelo menos um canal de distribuição');
        setActiveStep(4);
        return;
      }
    }

    const surveyData = {
      name,
      description,
      objective,
      targetAudience,
      tags,
      questions,
      settings: {
        useWeightedIndex,
        anonymousResponses,
        requiresAuth,
        allowPartialResponses,
        showProgressBar
      },
      distribution: {
        channels: channels.filter(ch => ch.enabled),
        scheduledDate,
        reminderEnabled,
        reminderDays
      },
      status: publish ? 'active' : 'draft'
    };

    try {
      setIsSaving(true);
      
      console.log('Saving survey:', surveyData);
      
      // Make real API call
      const response = await fetch('/api/nps/surveys/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(surveyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar pesquisa');
      }
      
      const savedSurvey = await response.json();
      
      if (publish) {
        alert(`Pesquisa "${name}" publicada com sucesso!`);
        // Redirect to survey details page
        setLocation(`/nps/surveys/${savedSurvey.id}`);
      } else {
        alert(`Rascunho "${name}" salvo com sucesso!`);
        // Redirect to NPS dashboard
        setLocation('/nps');
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar pesquisa. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: Settings2 },
    { id: 2, title: 'Perguntas', icon: MessageSquare },
    { id: 3, title: 'Configurações', icon: Settings2 },
    { id: 4, title: 'Distribuição', icon: Send }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = activeStep === step.id;
        const isCompleted = activeStep > step.id;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isActive 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : isCompleted 
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={cn(
                  "text-sm font-medium",
                  isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                )}>
                  Passo {step.id}
                </p>
                <p className={cn(
                  "text-xs",
                  isActive ? "text-blue-800" : isCompleted ? "text-green-800" : "text-gray-500"
                )}>
                  {step.title}
                </p>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors",
                isCompleted ? "bg-green-600" : "bg-gray-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Informações da Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Pesquisa *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: NPS Pós-Compra Q1 2024"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo e contexto da pesquisa..."
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="objective">Objetivo Principal</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="satisfaction">Satisfação do Cliente</SelectItem>
                  <SelectItem value="loyalty">Fidelidade do Cliente</SelectItem>
                  <SelectItem value="product_feedback">Feedback do Produto</SelectItem>
                  <SelectItem value="service_quality">Qualidade do Atendimento</SelectItem>
                  <SelectItem value="brand_perception">Percepção da Marca</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Público-Alvo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audience">Público-Alvo</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_customers">Todos os Clientes</SelectItem>
                  <SelectItem value="recent_buyers">Compradores Recentes</SelectItem>
                  <SelectItem value="premium_customers">Clientes Premium</SelectItem>
                  <SelectItem value="support_users">Usuários do Suporte</SelectItem>
                  <SelectItem value="trial_users">Usuários em Trial</SelectItem>
                  <SelectItem value="custom">Público Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Perguntas da Pesquisa</h3>
        <Button onClick={addQuestion} className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Pergunta
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <Badge variant={question.type === 'nps' ? 'default' : 'secondary'}>
                    {questionTypes.find(t => t.value === question.type)?.label}
                  </Badge>
                  {question.required && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Obrigatória
                    </Badge>
                  )}
                </div>
                
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Pergunta</Label>
                    <Select 
                      value={question.type} 
                      onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Texto da Pergunta</Label>
                    <Textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Digite sua pergunta..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {useWeightedIndex && (
                    <div>
                      <Label>Peso da Pergunta</Label>
                      <Input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={question.weight || 1}
                        onChange={(e) => updateQuestion(question.id, { weight: parseFloat(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                    />
                    <Label>Pergunta obrigatória</Label>
                  </div>

                  {question.type === 'multiple_choice' && (
                    <div>
                      <Label>Opções de Resposta</Label>
                      <div className="space-y-2 mt-1">
                        {(question.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                              }}
                              placeholder={`Opção ${optionIndex + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
                                updateQuestion(question.id, { options: newOptions });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...(question.options || []), ''];
                            updateQuestion(question.id, { options: newOptions });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Opção
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {useWeightedIndex && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Índice Ponderado Ativado</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Além do NPS tradicional, será calculado um índice ponderado considerando os pesos das perguntas. 
                  Isso permite análises mais detalhadas para uso interno.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Pesquisa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Usar Índice Ponderado</Label>
                <p className="text-sm text-gray-500">
                  Calcula um índice adicional com pesos personalizados
                </p>
              </div>
              <Switch
                checked={useWeightedIndex}
                onCheckedChange={setUseWeightedIndex}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Respostas Anônimas</Label>
                <p className="text-sm text-gray-500">
                  Permitir respostas sem identificação
                </p>
              </div>
              <Switch
                checked={anonymousResponses}
                onCheckedChange={setAnonymousResponses}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Requer Autenticação</Label>
                <p className="text-sm text-gray-500">
                  Usuário deve fazer login para responder
                </p>
              </div>
              <Switch
                checked={requiresAuth}
                onCheckedChange={setRequiresAuth}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir Respostas Parciais</Label>
                <p className="text-sm text-gray-500">
                  Salvar progresso mesmo sem completar
                </p>
              </div>
              <Switch
                checked={allowPartialResponses}
                onCheckedChange={setAllowPartialResponses}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar Barra de Progresso</Label>
                <p className="text-sm text-gray-500">
                  Exibir progresso durante o preenchimento
                </p>
              </div>
              <Switch
                checked={showProgressBar}
                onCheckedChange={setShowProgressBar}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview da Pesquisa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-3">{name || 'Nome da Pesquisa'}</h4>
              {description && (
                <p className="text-sm text-gray-600 mb-4">{description}</p>
              )}
              
              {showProgressBar && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso</span>
                    <span>1 de {questions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(1 / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {questions[0] && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">
                    1. {questions[0].text}
                    {questions[0].required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  
                  {questions[0].type === 'nps' && (
                    <div className="flex justify-between items-center p-2 bg-white rounded border">
                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 text-xs hover:border-blue-500 hover:bg-blue-50"
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {questions[0].type === 'text' && (
                    <textarea 
                      className="w-full p-2 border rounded text-sm" 
                      rows={3} 
                      placeholder="Sua resposta..."
                      disabled
                    />
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button size="sm" disabled>
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDistribution = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Canais de Distribuição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.map(channel => (
              <div key={channel.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {channel.type === 'email' && <Mail className="w-5 h-5 text-gray-500" />}
                  {channel.type === 'sms' && <MessageSquare className="w-5 h-5 text-gray-500" />}
                  {channel.type === 'whatsapp' && <MessageSquare className="w-5 h-5 text-green-500" />}
                  {channel.type === 'link' && <Eye className="w-5 h-5 text-gray-500" />}
                  
                  <div>
                    <Label className="capitalize">
                      {channel.type === 'email' && 'E-mail'}
                      {channel.type === 'sms' && 'SMS'}
                      {channel.type === 'whatsapp' && 'WhatsApp'}
                      {channel.type === 'link' && 'Link Público'}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {channel.type === 'email' && 'Enviar por e-mail para lista de contatos'}
                      {channel.type === 'sms' && 'Enviar SMS com link da pesquisa'}
                      {channel.type === 'whatsapp' && 'Compartilhar via WhatsApp Business'}
                      {channel.type === 'link' && 'Gerar link para compartilhamento'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(checked) => updateChannel(channel.type, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scheduledDate">Data de Envio</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={scheduledDate ? scheduledDate.toISOString().slice(0, 16) : ''}
                onChange={(e) => setScheduledDate(e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para envio imediato
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enviar Lembretes</Label>
                <p className="text-sm text-gray-500">
                  Reenviar para quem não respondeu
                </p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div>
                <Label>Lembrete após (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Resumo da Distribuição</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {channels.filter(ch => ch.enabled).length} canais ativos</li>
                <li>• Envio: {scheduledDate ? scheduledDate.toLocaleDateString('pt-BR') : 'Imediato'}</li>
                <li>• Lembretes: {reminderEnabled ? `Sim, após ${reminderDays} dias` : 'Não'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (activeStep) {
      case 1:
        return name.trim() !== '';
      case 2:
        return questions.every(q => q.text.trim() !== '');
      case 3:
        return true; // Settings step always allows proceeding
      case 4:
        return channels.some(ch => ch.enabled);
      default:
        return false;
    }
  };

  const canPublish = () => {
    // All validation criteria must be met to publish
    const hasName = name.trim() !== '';
    const allQuestionsValid = questions.every(q => q.text.trim() !== '');
    const hasEnabledChannels = channels.some(ch => ch.enabled);
    
    return hasName && allQuestionsValid && hasEnabledChannels;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/nps">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nova Pesquisa NPS</h1>
                <p className="text-gray-600">
                  Crie uma nova pesquisa de Net Promoter Score
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
              <Button 
                onClick={() => handleSave(true)} 
                disabled={!canPublish() || isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Publicando...' : 'Publicar Pesquisa'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        <div className="mb-8">
          {activeStep === 1 && renderBasicInfo()}
          {activeStep === 2 && renderQuestions()}
          {activeStep === 3 && renderSettings()}
          {activeStep === 4 && renderDistribution()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1 || isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={() => {
              console.log('Next button clicked, current step:', activeStep);
              console.log('Can proceed:', canProceed());
              setActiveStep(Math.min(4, activeStep + 1));
            }}
            disabled={activeStep === 4 || !canProceed() || isSaving}
          >
            Próximo
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}