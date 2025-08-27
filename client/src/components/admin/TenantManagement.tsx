import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Users, 
  Settings, 
  TrendingUp, 
  Eye,
  Building2,
  Palette,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { WhiteLabelTenant, AVAILABLE_MODULES, TenantDomain, TenantSubscription } from '@/types/tenant';

export default function TenantManagement() {
  const [tenants, setTenants] = useState<WhiteLabelTenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<WhiteLabelTenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Mock data - substituir por API real
  useEffect(() => {
    const mockTenants: WhiteLabelTenant[] = [
      {
        id: '1',
        name: 'acme-corp',
        brandName: 'ACME Corporation',
        companyName: 'ACME Corporation Ltda',
        contactEmail: 'admin@acme.com',
        status: 'active',
        theme: {
          primaryColor: '#FF6B35',
          secondaryColor: '#004E89',
          accentColor: '#FFC857',
          logo: 'https://via.placeholder.com/200x60/FF6B35/FFFFFF?text=ACME'
        },
        domains: [
          { id: '1', domain: 'acme.orquestra.com', isCustomDomain: false, isPrimary: true, sslEnabled: true, status: 'active' },
          { id: '2', domain: 'learn.acme.com', isCustomDomain: true, isPrimary: false, sslEnabled: true, status: 'active' }
        ],
        subscriptions: [
          { id: '1', moduleId: 'trails', moduleName: 'Trilhas de Aprendizado', isActive: true, startDate: '2024-01-01', features: [] },
          { id: '2', moduleId: 'businessquest', moduleName: 'Business Quest', isActive: true, startDate: '2024-01-01', features: [] }
        ],
        settings: {
          allowedModules: ['trails', 'businessquest'],
          maxUsers: 500,
          storageLimit: 10240,
          customBranding: true,
          apiAccess: true,
          supportLevel: 'premium',
          maintenanceMode: false
        },
        analytics: {
          activeUsers: 342,
          totalSessions: 1250,
          storageUsed: 2560,
          lastActivity: '2024-01-15T10:30:00Z',
          topModules: [
            { moduleId: 'trails', name: 'Trilhas', usage: 78 },
            { moduleId: 'businessquest', name: 'Business Quest', usage: 65 }
          ]
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'techstart',
        brandName: 'TechStart Academy',
        companyName: 'TechStart Educação Ltda',
        contactEmail: 'admin@techstart.com',
        status: 'trial',
        theme: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
          accentColor: '#F59E0B'
        },
        domains: [
          { id: '3', domain: 'techstart.orquestra.com', isCustomDomain: false, isPrimary: true, sslEnabled: true, status: 'active' }
        ],
        subscriptions: [
          { id: '3', moduleId: 'trails', moduleName: 'Trilhas de Aprendizado', isActive: true, startDate: '2024-01-10', endDate: '2024-02-10', features: [] }
        ],
        settings: {
          allowedModules: ['trails'],
          maxUsers: 50,
          storageLimit: 1024,
          customBranding: false,
          apiAccess: false,
          supportLevel: 'basic',
          maintenanceMode: false
        },
        analytics: {
          activeUsers: 23,
          totalSessions: 89,
          storageUsed: 156,
          lastActivity: '2024-01-14T16:20:00Z',
          topModules: [
            { moduleId: 'trails', name: 'Trilhas', usage: 45 }
          ]
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-14T16:20:00Z',
        trialEndsAt: '2024-02-10T00:00:00Z'
      }
    ];
    setTenants(mockTenants);
  }, []);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'trial': return 'Trial';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestão de Clientes White-Label
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie todos os clientes, domínios e módulos contratados
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente White-Label</DialogTitle>
              <DialogDescription>
                Configure um novo cliente com domínio personalizado e módulos específicos
              </DialogDescription>
            </DialogHeader>
            <CreateTenantForm onClose={() => setIsCreateDialogOpen(false)} />
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
                  placeholder="Buscar por nome, empresa ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {tenant.theme.logo ? (
                    <img 
                      src={tenant.theme.logo} 
                      alt={tenant.brandName}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: tenant.theme.primaryColor }}
                    >
                      {tenant.brandName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{tenant.brandName}</h3>
                    <p className="text-sm text-gray-600">{tenant.name}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(tenant.status)}>
                  {getStatusLabel(tenant.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{tenant.analytics.activeUsers}</div>
                  <div className="text-xs text-gray-600">Usuários</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{tenant.subscriptions.length}</div>
                  <div className="text-xs text-gray-600">Módulos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{tenant.domains.length}</div>
                  <div className="text-xs text-gray-600">Domínios</div>
                </div>
              </div>

              {/* Primary Domain */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">
                  {tenant.domains.find(d => d.isPrimary)?.domain || 'Sem domínio'}
                </span>
              </div>

              {/* Active Modules */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Módulos Ativos</div>
                <div className="flex flex-wrap gap-1">
                  {tenant.subscriptions.filter(s => s.isActive).map((sub) => (
                    <Badge key={sub.id} variant="outline" className="text-xs">
                      {sub.moduleName}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {tenants.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            {tenants.length === 0 
              ? 'Comece criando seu primeiro cliente white-label.'
              : 'Tente ajustar os filtros para encontrar clientes.'
            }
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {selectedTenant && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente: {selectedTenant.brandName}</DialogTitle>
              <DialogDescription>
                Gerencie configurações, módulos e domínios do cliente
              </DialogDescription>
            </DialogHeader>
            <EditTenantForm 
              tenant={selectedTenant} 
              onClose={() => {
                setIsEditDialogOpen(false);
                setSelectedTenant(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente para criar novo tenant
function CreateTenantForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    companyName: '',
    contactEmail: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#06B6D4',
    customDomain: '',
    selectedModules: [] as string[],
    maxUsers: 100,
    supportLevel: 'basic' as 'basic' | 'premium' | 'enterprise'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar criação do tenant
    console.log('Creating tenant:', formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Tenant (slug)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ex: acme-corp"
                required
              />
            </div>
            <div>
              <Label htmlFor="brandName">Nome da Marca</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                placeholder="ex: ACME Corporation"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="companyName">Razão Social</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="ex: ACME Corporation Ltda"
              required
            />
          </div>

          <div>
            <Label htmlFor="contactEmail">Email de Contato</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="admin@acme.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="customDomain">Domínio Personalizado (opcional)</Label>
            <Input
              id="customDomain"
              value={formData.customDomain}
              onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
              placeholder="learn.acme.com"
            />
            <p className="text-sm text-gray-600 mt-1">
              Se não informado, será usado: {formData.name}.orquestra.com
            </p>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accentColor">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Preview das Cores</h4>
            <div className="flex gap-2">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.primaryColor }}
              >
                P
              </div>
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                S
              </div>
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.accentColor }}
              >
                A
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div>
            <Label>Selecione os Módulos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {AVAILABLE_MODULES.map((module) => (
                <div key={module.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={module.id}
                    checked={formData.selectedModules.includes(module.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          selectedModules: [...prev.selectedModules, module.id]
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          selectedModules: prev.selectedModules.filter(id => id !== module.id)
                        }));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <label htmlFor={module.id} className="font-medium cursor-pointer">
                      {module.name}
                      {module.isPopular && (
                        <Badge className="ml-2 bg-orange-100 text-orange-800">Popular</Badge>
                      )}
                    </label>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <p className="text-sm font-medium text-green-600">
                      R$ {module.pricing.monthly}/mês
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUsers">Limite de Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="supportLevel">Nível de Suporte</Label>
              <Select value={formData.supportLevel} onValueChange={(value: 'basic' | 'premium' | 'enterprise') => setFormData(prev => ({ ...prev, supportLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Criar Cliente
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente para editar tenant (implementação similar)
function EditTenantForm({ tenant, onClose }: { tenant: WhiteLabelTenant; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <p>Implementar edição do tenant: {tenant.brandName}</p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </div>
  );
}