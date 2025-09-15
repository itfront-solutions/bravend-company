import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Save,
  Eye,
  Send,
  Star,
  MessageSquare,
  List,
  BarChart3,
  Type,
  Settings,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link, useLocation } from 'wouter';

interface Question {
  id: string;
  type: 'nps' | 'likert' | 'single' | 'multi' | 'rating' | 'text';
  title: string;
  description?: string;
  required: boolean;
  weight: number;
  orderIdx: number;
  options?: Option[];
}

interface Option {
  id: string;
  label: string;
  valueNum?: number;
  altWeight: number;
  orderIdx: number;
}

interface Survey {
  id: string;
  name: string;
  description?: string;
  hasWeightedIndex: boolean;
  alphaWeight: number;
  questions: Question[];
}

export default function SurveyBuilder() {
  const [, navigate] = useLocation();
  const [survey, setSurvey] = useState<Survey>({
    id: '',
    name: '',
    description: '',
    hasWeightedIndex: false,
    alphaWeight: 0.8,
    questions: []
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Templates de perguntas
  const questionTemplates = [
    {
      type: 'nps' as const,
      icon: TrendingUp,
      title: 'Pergunta NPS',
      description: 'Pergunta padrão "Qual a probabilidade de nos recomendar?" (0-10)',
      template: {
        title: 'Qual a probabilidade de você nos recomendar para um amigo ou colega?',
        description: 'Escala de 0 (muito improvável) a 10 (muito provável)',
        required: true,
        weight: 1.0
      }
    },
    {
      type: 'likert' as const,
      icon: BarChart3,
      title: 'Escala Likert',
      description: 'Escala de concordância (1-5 ou 0-10)',
      template: {
        title: 'Como você avalia nossa qualidade de atendimento?',
        required: true,
        weight: 1.0
      }
    },
    {
      type: 'single' as const,
      icon: List,
      title: 'Múltipla Escolha (única)',
      description: 'Escolha uma opção com pesos personalizáveis',
      template: {
        title: 'Qual o principal motivo da sua avaliação?',
        required: false,
        weight: 0.8
      }
    },
    {
      type: 'rating' as const,
      icon: Star,
      title: 'Avaliação por Estrelas',
      description: 'Escala de 1 a 5 estrelas',
      template: {
        title: 'Avalie nossa experiência geral',
        required: false,
        weight: 0.7
      }
    },
    {
      type: 'text' as const,
      icon: MessageSquare,
      title: 'Texto Aberto',
      description: 'Campo livre para comentários',
      template: {
        title: 'Deixe seu comentário ou sugestão',
        required: false,
        weight: 0.0
      }
    }
  ];

  useEffect(() => {
    // Auto-adicionar pergunta NPS se não existir
    if (survey.questions.length === 0) {
      addQuestion('nps');
    }
  }, []);

  const addQuestion = (type: Question['type']) => {
    const template = questionTemplates.find(t => t.type === type)?.template;
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      title: template?.title || '',
      description: template?.description,
      required: template?.required || false,
      weight: template?.weight || 1.0,
      orderIdx: survey.questions.length,
      options: []
    };

    // Auto-gerar opções para tipos específicos
    if (type === 'nps') {
      newQuestion.options = Array.from({ length: 11 }, (_, i) => ({
        id: `opt_${Date.now()}_${i}`,
        label: i.toString(),
        valueNum: i,
        altWeight: 0,
        orderIdx: i
      }));
    } else if (type === 'likert') {
      const likertLabels = ['Muito Ruim', 'Ruim', 'Regular', 'Bom', 'Muito Bom'];
      const likertWeights = [-1, -0.5, 0, 0.5, 1];
      newQuestion.options = likertLabels.map((label, i) => ({
        id: `opt_${Date.now()}_${i}`,
        label,
        valueNum: i + 1,
        altWeight: likertWeights[i],
        orderIdx: i
      }));
    } else if (type === 'rating') {
      newQuestion.options = Array.from({ length: 5 }, (_, i) => ({
        id: `opt_${Date.now()}_${i}`,
        label: `${i + 1} estrela${i > 0 ? 's' : ''}`,
        valueNum: i + 1,
        altWeight: (i * 0.5) - 1, // -1, -0.5, 0, 0.5, 1
        orderIdx: i
      }));
    }

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    setSelectedQuestion(null);
  };

  const addOption = (questionId: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption: Option = {
      id: `opt_${Date.now()}`,
      label: '',
      valueNum: (question.options?.length || 0) + 1,
      altWeight: 0,
      orderIdx: question.options?.length || 0
    };

    updateQuestion(questionId, {
      options: [...(question.options || []), newOption]
    });
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<Option>) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    const updatedOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    updateQuestion(questionId, { options: updatedOptions });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = survey.questions.find(q => q.id === questionId);
    if (!question?.options) return;

    updateQuestion(questionId, {
      options: question.options.filter(opt => opt.id !== optionId)
    });
  };

  const saveSurvey = async () => {
    setSaving(true);
    try {
      // Validações
      if (!survey.name.trim()) {
        alert('Nome da pesquisa é obrigatório');
        return;
      }

      const npsQuestion = survey.questions.find(q => q.type === 'nps');
      if (!npsQuestion) {
        alert('Pesquisa deve conter pelo menos uma pergunta NPS');
        return;
      }

      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Pesquisa salva com sucesso!');
      navigate('/nps');
    } catch (error) {
      alert('Erro ao salvar pesquisa');
    } finally {
      setSaving(false);
    }
  };

  const selectedQuestionData = survey.questions.find(q => q.id === selectedQuestion);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/nps">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Criar Pesquisa NPS</h1>
                <p className="text-gray-600 mt-1">Monte seu questionário de Net Promoter Score</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button onClick={saveSurvey} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Templates e Configurações */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="surveyName">Nome da Pesquisa</Label>
                  <Input
                    id="surveyName"
                    value={survey.name}
                    onChange={(e) => setSurvey(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: NPS Pós-Compra 2024"
                  />
                </div>
                
                <div>
                  <Label htmlFor="surveyDesc">Descrição (opcional)</Label>
                  <Textarea
                    id="surveyDesc"
                    value={survey.description}
                    onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo desta pesquisa"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Índice Ponderado</Label>
                    <p className="text-sm text-gray-500">Calcular NPS ajustado (experimental)</p>
                  </div>
                  <Switch
                    checked={survey.hasWeightedIndex}
                    onCheckedChange={(checked) => setSurvey(prev => ({ ...prev, hasWeightedIndex: checked }))}
                  />
                </div>

                {survey.hasWeightedIndex && (
                  <div>
                    <Label htmlFor="alphaWeight">Peso Alpha (0-1)</Label>
                    <Input
                      id="alphaWeight"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={survey.alphaWeight}
                      onChange={(e) => setSurvey(prev => ({ ...prev, alphaWeight: parseFloat(e.target.value) || 0.8 }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Templates de Perguntas */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Pergunta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questionTemplates.map((template) => {
                    const Icon = template.icon;
                    const isNpsExists = survey.questions.some(q => q.type === 'nps');
                    const disabled = template.type === 'nps' && isNpsExists;
                    
                    return (
                      <Button
                        key={template.type}
                        variant="outline"
                        className="w-full justify-start p-3 h-auto"
                        onClick={() => addQuestion(template.type)}
                        disabled={disabled}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-medium text-sm">{template.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Question Builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas da Pesquisa</CardTitle>
              </CardHeader>
              <CardContent>
                {survey.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhuma pergunta adicionada</p>
                    <p className="text-sm text-gray-500 mt-1">Selecione um template ao lado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {survey.questions.map((question, index) => (
                      <Card 
                        key={question.id} 
                        className={`cursor-pointer transition-all ${
                          selectedQuestion === question.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedQuestion(question.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={question.type === 'nps' ? 'default' : 'secondary'}>
                                    {question.type.toUpperCase()}
                                  </Badge>
                                  {question.required && (
                                    <Badge variant="outline" className="text-xs">Obrigatória</Badge>
                                  )}
                                  {survey.hasWeightedIndex && question.weight > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      Peso: {question.weight}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-medium text-gray-900">{question.title}</h3>
                                {question.description && (
                                  <p className="text-sm text-gray-500 mt-1">{question.description}</p>
                                )}
                                {question.options && question.options.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    {question.options.length} opções
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {question.type !== 'nps' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeQuestion(question.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Question Editor */}
          <div className="lg:col-span-1">
            {selectedQuestionData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Type className="w-5 h-5 mr-2" />
                    Editar Pergunta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título da Pergunta</Label>
                    <Textarea
                      value={selectedQuestionData.title}
                      onChange={(e) => updateQuestion(selectedQuestion!, { title: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      value={selectedQuestionData.description || ''}
                      onChange={(e) => updateQuestion(selectedQuestion!, { description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Obrigatória</Label>
                    <Switch
                      checked={selectedQuestionData.required}
                      onCheckedChange={(checked) => updateQuestion(selectedQuestion!, { required: checked })}
                      disabled={selectedQuestionData.type === 'nps'}
                    />
                  </div>

                  {survey.hasWeightedIndex && selectedQuestionData.type !== 'text' && (
                    <div>
                      <Label>Peso da Pergunta (0-1)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedQuestionData.weight}
                        onChange={(e) => updateQuestion(selectedQuestion!, { weight: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {/* Opções */}
                  {selectedQuestionData.options && selectedQuestionData.options.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label>Opções</Label>
                        {selectedQuestionData.type === 'single' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(selectedQuestion!)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {selectedQuestionData.options.map((option) => (
                          <div key={option.id} className="border rounded-lg p-3">
                            <div className="space-y-2">
                              <Input
                                value={option.label}
                                onChange={(e) => updateOption(selectedQuestion!, option.id, { label: e.target.value })}
                                placeholder="Texto da opção"
                                disabled={selectedQuestionData.type === 'nps'}
                              />
                              {survey.hasWeightedIndex && selectedQuestionData.type !== 'nps' && (
                                <div>
                                  <Label className="text-xs">Peso (-1 a +1)</Label>
                                  <Input
                                    type="number"
                                    min="-1"
                                    max="1"
                                    step="0.1"
                                    value={option.altWeight}
                                    onChange={(e) => updateOption(selectedQuestion!, option.id, { altWeight: parseFloat(e.target.value) || 0 })}
                                  />
                                </div>
                              )}
                              {selectedQuestionData.type === 'single' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(selectedQuestion!, option.id)}
                                  className="w-full"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remover
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Selecione uma pergunta</p>
                  <p className="text-sm text-gray-500 mt-1">para editar suas configurações</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview da Pesquisa</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">{survey.name}</h2>
              {survey.description && (
                <p className="text-gray-600 mt-2">{survey.description}</p>
              )}
            </div>
            
            {survey.questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900">
                      {index + 1}. {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                    )}
                  </div>
                  
                  {question.type === 'nps' && (
                    <div className="grid grid-cols-11 gap-2">
                      {Array.from({ length: 11 }, (_, i) => (
                        <button
                          key={i}
                          className="aspect-square border rounded flex items-center justify-center hover:bg-blue-50"
                          disabled
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {(question.type === 'likert' || question.type === 'single') && (
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <label key={option.id} className="flex items-center gap-2">
                          <input type="radio" name={question.id} disabled />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'rating' && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'text' && (
                    <textarea
                      className="w-full p-3 border rounded resize-none"
                      rows={3}
                      placeholder="Digite sua resposta aqui..."
                      disabled
                    />
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Button className="w-full" disabled>
              Enviar Respostas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}