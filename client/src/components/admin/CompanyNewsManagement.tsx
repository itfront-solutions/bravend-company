import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Send,
  Clock,
  Users,
  Tag,
  Image,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Megaphone
} from 'lucide-react';
import { CompanyNews } from '@/types/tenant';

export default function CompanyNewsManagement() {
  const [news, setNews] = useState<CompanyNews[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<CompanyNews | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock data
  useEffect(() => {
    const mockNews: CompanyNews[] = [
      {
        id: '1',
        title: 'Nova Funcionalidade: Analytics Avançado',
        content: 'Estamos felizes em anunciar o lançamento do novo módulo de Analytics Avançado...',
        summary: 'Novo módulo de analytics com dashboards personalizáveis e relatórios automatizados.',
        imageUrl: 'https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Analytics',
        author: 'Equipe Produto',
        publishedAt: '2024-01-15T10:00:00Z',
        tags: ['produto', 'analytics', 'novidade'],
        targetTenants: [], // Todos os tenants
        priority: 'high',
        isVisible: true
      },
      {
        id: '2',
        title: 'Manutenção Programada - 20/01/2024',
        content: 'Informamos que haverá uma manutenção programada no dia 20/01/2024 das 2h às 6h...',
        summary: 'Manutenção programada para melhorias de performance e segurança.',
        author: 'Equipe Técnica',
        publishedAt: '2024-01-14T09:00:00Z',
        tags: ['manutenção', 'sistema', 'aviso'],
        targetTenants: [],
        priority: 'urgent',
        isVisible: true
      },
      {
        id: '3',
        title: 'Webinar: Maximizando Resultados com Gamificação',
        content: 'Participe do nosso webinar exclusivo sobre como maximizar o engajamento...',
        summary: 'Webinar gratuito sobre estratégias de gamificação para aumentar o engajamento.',
        imageUrl: 'https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Webinar',
        author: 'Equipe Educacional',
        publishedAt: '2024-01-12T14:30:00Z',
        tags: ['webinar', 'gamificação', 'educação'],
        targetTenants: ['1', '2'], // Apenas alguns tenants
        priority: 'normal',
        isVisible: true
      }
    ];
    setNews(mockNews);
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-blue-600" />
            Notícias da Empresa
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie comunicações e atualizações para os clientes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Notícia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Notícia</DialogTitle>
              <DialogDescription>
                Publique atualizações e comunicados para seus clientes
              </DialogDescription>
            </DialogHeader>
            <CreateNewsForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News List */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <Card key={item.id} className="hover-lift transition-all">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Image */}
                {item.imageUrl && (
                  <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {item.summary || item.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(item.priority)}>
                        {getPriorityLabel(item.priority)}
                      </Badge>
                      {item.isVisible ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <span>por {item.author}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {item.targetTenants?.length > 0 ? `${item.targetTenants.length} clientes` : 'Todos os clientes'}
                    </span>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedNews(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Republicar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {news.length === 0 ? 'Nenhuma notícia publicada' : 'Nenhuma notícia encontrada'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            {news.length === 0 
              ? 'Comece criando sua primeira notícia para os clientes.'
              : 'Tente ajustar os filtros para encontrar notícias.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Componente para criar nova notícia
function CreateNewsForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    tags: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    targetAll: true,
    selectedTenants: [] as string[],
    isVisible: true,
    publishNow: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating news:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Nova funcionalidade disponível"
          required
        />
      </div>

      <div>
        <Label htmlFor="summary">Resumo</Label>
        <Input
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Breve descrição para listagens"
        />
      </div>

      <div>
        <Label htmlFor="content">Conteúdo *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Conteúdo completo da notícia..."
          rows={6}
          required
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="produto, novidade, importante"
          />
        </div>
        <div>
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="targetAll"
            checked={formData.targetAll}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, targetAll: checked }))}
          />
          <Label htmlFor="targetAll">Enviar para todos os clientes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            checked={formData.isVisible}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
          />
          <Label htmlFor="isVisible">Visível no dashboard dos clientes</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="publishNow"
            checked={formData.publishNow}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publishNow: checked }))}
          />
          <Label htmlFor="publishNow">Publicar imediatamente</Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {formData.publishNow ? 'Publicar' : 'Salvar Rascunho'}
        </Button>
      </DialogFooter>
    </form>
  );
}