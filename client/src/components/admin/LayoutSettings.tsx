import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Layout,
  Sidebar,
  Navigation,
  Settings,
  Palette,
  Zap,
  Eye,
  RotateCcw,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react';
import { useLayoutStore } from '@/store/layout';
import { cn } from '@/lib/utils';

export default function LayoutSettings() {
  const {
    layoutType,
    themeMode,
    sidebarCollapsed,
    compactMode,
    showBreadcrumbs,
    animationsEnabled,
    setLayoutType,
    setThemeMode,
    setSidebarCollapsed,
    setCompactMode,
    setShowBreadcrumbs,
    setAnimationsEnabled,
    resetToDefaults
  } = useLayoutStore();

  const [previewLayout, setPreviewLayout] = useState(layoutType);

  const layoutOptions = [
    {
      id: 'top-navigation',
      name: 'Navegação Superior',
      description: 'Menu horizontal no topo da página',
      icon: Navigation,
      preview: '/api/placeholder/300/200',
      features: ['Menu dropdown', 'Responsivo', 'Mais espaço vertical']
    },
    {
      id: 'left-sidebar',
      name: 'Sidebar Esquerda (LTR)',
      description: 'Menu lateral fixo à esquerda',
      icon: Sidebar,
      preview: '/api/placeholder/300/200',
      features: ['Sempre visível', 'Navegação rápida', 'Layout profissional'],
      badge: 'Novo'
    }
  ];

  const themeOptions = [
    { id: 'light', name: 'Claro', icon: Sun },
    { id: 'dark', name: 'Escuro', icon: Moon },
    { id: 'system', name: 'Sistema', icon: Monitor }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layout className="h-6 w-6 text-blue-600" />
          Configurações de Layout
        </h2>
        <p className="text-gray-600 mt-1">
          Personalize a aparência e comportamento da interface
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Layout Type Selection */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Tipo de Layout
              </CardTitle>
              <CardDescription>
                Escolha como a navegação será exibida na interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={layoutType} 
                onValueChange={(value) => {
                  setLayoutType(value as any);
                  setPreviewLayout(value as any);
                }}
                className="space-y-4"
              >
                {layoutOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = layoutType === option.id;
                  
                  return (
                    <div key={option.id} className="relative">
                      <div className={cn(
                        "flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-all",
                        isSelected 
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                          : "border-gray-200 hover:border-gray-300"
                      )}>
                        <RadioGroupItem value={option.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={cn("h-5 w-5", isSelected ? "text-blue-600" : "text-gray-600")} />
                            <Label className="text-base font-medium cursor-pointer">
                              {option.name}
                            </Label>
                            {option.badge && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {option.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                          
                          {/* Features */}
                          <div className="flex flex-wrap gap-1">
                            {option.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Preview Image */}
                        <div className="w-24 h-16 bg-gray-100 rounded border overflow-hidden">
                          <img 
                            src={option.preview} 
                            alt={`Preview ${option.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Opções adicionais de personalização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Sidebar Settings (only for left-sidebar layout) */}
              {layoutType === 'left-sidebar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Sidebar Recolhida por Padrão</Label>
                      <p className="text-sm text-gray-600">Inicia com a sidebar minimizada</p>
                    </div>
                    <Switch 
                      checked={sidebarCollapsed}
                      onCheckedChange={setSidebarCollapsed}
                    />
                  </div>
                  <Separator />
                </div>
              )}
              
              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Modo Compacto</Label>
                  <p className="text-sm text-gray-600">Reduz espaçamentos para aproveitar melhor a tela</p>
                </div>
                <Switch 
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
              
              <Separator />
              
              {/* Breadcrumbs */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Mostrar Breadcrumbs</Label>
                  <p className="text-sm text-gray-600">Exibe o caminho de navegação atual</p>
                </div>
                <Switch 
                  checked={showBreadcrumbs}
                  onCheckedChange={setShowBreadcrumbs}
                />
              </div>
              
              <Separator />
              
              {/* Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Animações</Label>
                  <p className="text-sm text-gray-600">Habilita transições e efeitos visuais</p>
                </div>
                <Switch 
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Theme */}
        <div className="space-y-6">
          
          {/* Theme Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Modo de Tema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={themeMode} 
                onValueChange={(value) => setThemeMode(value as any)}
                className="space-y-2"
              >
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} />
                      <Icon className="h-4 w-4" />
                      <Label className="cursor-pointer">{option.name}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                Visualização do layout selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Layout className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Preview do Layout</p>
                  <p className="text-xs">{layoutOptions.find(l => l.id === previewLayout)?.name}</p>
                </div>
              </div>
              
              {/* Responsive Preview Icons */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Tablet className="h-4 w-4" />
                  Tablet
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Laptop className="h-4 w-4" />
                  Desktop
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Impacto na Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Velocidade de carregamento:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Ótima</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Uso de memória:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Baixo</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Responsividade:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Excelente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Aplicar Mudanças
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={resetToDefaults}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}