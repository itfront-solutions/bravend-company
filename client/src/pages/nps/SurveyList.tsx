import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface Survey {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'finished';
  totalResponses: number;
  nps: number;
  margin: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  targetAudience: string;
}

export default function SurveyList() {
  const [, setLocation] = useLocation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/nps/surveys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSurveys(data.surveys || []);
      } else {
        console.error('Failed to fetch surveys');
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        survey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }

    setFilteredSurveys(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'finished':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'draft':
        return 'Rascunho';
      case 'finished':
        return 'Finalizada';
      default:
        return status;
    }
  };

  const getNpsColor = (nps: number) => {
    if (nps >= 70) return 'text-green-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pesquisas NPS</h1>
                <p className="text-gray-600">
                  Gerencie suas pesquisas de Net Promoter Score
                </p>
              </div>
            </div>
            
            <Link href="/nps/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Pesquisa
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar pesquisas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Todas ({surveys.length})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Ativas ({surveys.filter(s => s.status === 'active').length})
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('draft')}
                >
                  Rascunhos ({surveys.filter(s => s.status === 'draft').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Surveys Grid */}
        {filteredSurveys.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma pesquisa encontrada' 
                  : 'Nenhuma pesquisa criada'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira pesquisa NPS para obter feedback dos seus clientes'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/nps/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Pesquisa
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{survey.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {survey.description || 'Sem descrição'}
                      </p>
                    </div>
                    <Badge className={cn("ml-2 shrink-0", getStatusColor(survey.status))}>
                      {getStatusLabel(survey.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {survey.totalResponses || 0}
                        </div>
                        <div className="text-xs text-gray-500">Respostas</div>
                      </div>
                      <div>
                        <div className={cn("text-lg font-bold", getNpsColor(survey.nps || 0))}>
                          {survey.nps || 0}
                        </div>
                        <div className="text-xs text-gray-500">NPS</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          ±{survey.margin || 0}
                        </div>
                        <div className="text-xs text-gray-500">Margem</div>
                      </div>
                    </div>

                    {/* Tags */}
                    {survey.tags && survey.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {survey.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {survey.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{survey.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Criada em {new Date(survey.createdAt).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/nps/surveys/${survey.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      
                      {survey.status !== 'finished' && (
                        <Link href={`/nps/surveys/${survey.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}