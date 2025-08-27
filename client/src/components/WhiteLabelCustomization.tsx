import { useState } from 'react';
import { useTenantStore } from '@/store/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Palette, Upload, Save, RotateCcw } from 'lucide-react';

export default function WhiteLabelCustomization() {
  const { currentTenant, setCurrentTenant } = useTenantStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    brandName: currentTenant?.brandName || '',
    welcomeMessage: currentTenant?.settings?.welcomeMessage || '',
    primaryColor: currentTenant?.theme?.primaryColor || '#3b82f6',
    secondaryColor: currentTenant?.theme?.secondaryColor || '#10b981',
    accentColor: currentTenant?.theme?.accentColor || '#f59e0b',
    logo: currentTenant?.theme?.logo || '',
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!currentTenant) return;

    // Update the current tenant with new customization
    const updatedTenant = {
      ...currentTenant,
      brandName: formData.brandName,
      theme: {
        ...currentTenant.theme,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        logo: formData.logo,
      },
      settings: {
        ...currentTenant.settings,
        welcomeMessage: formData.welcomeMessage,
      }
    };

    setCurrentTenant(updatedTenant);
    
    toast({
      title: "Personalização salva!",
      description: "As mudanças foram aplicadas com sucesso.",
    });
  };

  const handleReset = () => {
    if (!currentTenant) return;

    setFormData({
      brandName: currentTenant.brandName,
      welcomeMessage: currentTenant.settings?.welcomeMessage || '',
      primaryColor: currentTenant.theme?.primaryColor || '#3b82f6',
      secondaryColor: currentTenant.theme?.secondaryColor || '#10b981',
      accentColor: currentTenant.theme?.accentColor || '#f59e0b',
      logo: currentTenant.theme?.logo || '',
    });

    toast({
      title: "Formulário resetado",
      description: "Os valores foram restaurados.",
    });
  };

  const applyPreview = () => {
    if (!currentTenant) return;

    const tempTenant = {
      ...currentTenant,
      brandName: formData.brandName,
      theme: {
        ...currentTenant.theme,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
      },
      settings: {
        ...currentTenant.settings,
        welcomeMessage: formData.welcomeMessage,
      }
    };

    setCurrentTenant(tempTenant);
    setPreviewMode(true);
  };

  const presetThemes = [
    {
      name: 'CVO Company',
      primary: 'hsl(147, 51%, 47%)',
      secondary: 'hsl(197, 71%, 52%)',
      accent: 'hsl(45, 93%, 58%)',
    },
    {
      name: 'Carvion Tech',
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(348, 83%, 58%)',
      accent: 'hsl(31, 81%, 56%)',
    },
    {
      name: 'Ocean Blue',
      primary: 'hsl(200, 100%, 40%)',
      secondary: 'hsl(180, 80%, 50%)',
      accent: 'hsl(220, 90%, 60%)',
    },
    {
      name: 'Forest Green',
      primary: 'hsl(120, 60%, 40%)',
      secondary: 'hsl(140, 70%, 45%)',
      accent: 'hsl(60, 80%, 50%)',
    },
  ];

  const applyPresetTheme = (theme: typeof presetThemes[0]) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      accentColor: theme.accent,
    }));
  };

  return (
    <div className="space-y-6" data-testid="white-label-customization">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Personalização White-Label</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Customize a aparência e identidade da sua plataforma
              </p>
            </div>
            {previewMode && (
              <Badge variant="secondary">Modo Pré-visualização</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações da Marca</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brandName">Nome da Marca</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="Nome da sua empresa"
                  data-testid="brand-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Logo URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="URL do logo"
                    data-testid="logo-url-input"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                placeholder="Mensagem personalizada para o dashboard"
                rows={2}
                data-testid="welcome-message-input"
              />
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Esquema de Cores</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-20 h-12 p-1 border rounded cursor-pointer"
                    data-testid="primary-color-input"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-20 h-12 p-1 border rounded cursor-pointer"
                    data-testid="secondary-color-input"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-20 h-12 p-1 border rounded cursor-pointer"
                    data-testid="accent-color-input"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preset Themes */}
            <div>
              <Label>Temas Predefinidos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {presetThemes.map((theme, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPresetTheme(theme)}
                    className="justify-start space-x-2"
                    data-testid={`preset-theme-${index}`}
                  >
                    <div className="flex space-x-1">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <span className="text-xs">{theme.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={applyPreview}
                data-testid="preview-changes-button"
              >
                Pré-visualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleReset}
                data-testid="reset-customization-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
            </div>
            
            <Button 
              onClick={handleSave}
              data-testid="save-customization-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Personalização
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg border-2 border-dashed"
            style={{
              background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
              color: 'white'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {formData.brandName || 'Nome da Marca'}
                </h2>
                <p className="opacity-90">
                  {formData.welcomeMessage || 'Mensagem de boas-vindas personalizada'}
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: formData.accentColor, color: '#000' }}
                  >
                    Elemento de Destaque
                  </div>
                </div>
              </div>
              {formData.logo && (
                <img 
                  src={formData.logo} 
                  alt="Logo preview"
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white/20"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
