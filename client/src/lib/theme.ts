import { useTenantStore } from '@/store/tenant';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}

export interface TenantTheme {
  colors: ThemeColors;
  logo?: string;
  brandName: string;
  favicon?: string;
}

// Temas padrão para diferentes tipos de tenant
export const defaultThemes: Record<string, TenantTheme> = {
  orquestra: {
    brandName: 'Plataforma Orquestra',
    colors: {
      primary: '#3B82F6', // blue-500
      secondary: '#8B5CF6', // violet-500
      accent: '#06B6D4', // cyan-500
      background: '#F9FAFB', // gray-50
      surface: '#FFFFFF' // white
    }
  },
  businessquest: {
    brandName: 'Business Quest',
    colors: {
      primary: '#059669', // emerald-600
      secondary: '#DC2626', // red-600
      accent: '#D97706', // amber-600
      background: '#F3F4F6', // gray-100
      surface: '#FFFFFF'
    }
  },
  conselhodigital: {
    brandName: 'Conselho Digital',
    colors: {
      primary: '#7C3AED', // violet-600
      secondary: '#EC4899', // pink-500
      accent: '#F59E0B', // amber-500
      background: '#FAF5FF', // purple-50
      surface: '#FFFFFF'
    }
  },
  cvocompany: {
    brandName: 'CVO Company',
    colors: {
      primary: '#1F2937', // gray-800
      secondary: '#374151', // gray-700
      accent: '#F59E0B', // amber-500
      background: '#F9FAFB', // gray-50
      surface: '#FFFFFF'
    }
  }
};

export function useWhiteLabelTheme() {
  const { currentTenant } = useTenantStore();
  
  const getThemeForTenant = (tenantId?: string): TenantTheme => {
    if (!tenantId || !currentTenant) {
      return defaultThemes.orquestra;
    }

    // Se o tenant tem tema customizado, use ele
    if (currentTenant.theme) {
      return {
        brandName: currentTenant.brandName,
        colors: {
          primary: currentTenant.theme.primaryColor,
          secondary: currentTenant.theme.secondaryColor,
          accent: currentTenant.theme.accentColor,
          background: '#F9FAFB',
          surface: '#FFFFFF'
        },
        logo: currentTenant.theme.logo
      };
    }

    // Senão, use um tema baseado no nome do tenant
    const tenantKey = currentTenant.name.toLowerCase().replace(/\s+/g, '');
    return defaultThemes[tenantKey] || defaultThemes.orquestra;
  };

  const applyThemeToDocument = (theme: TenantTheme) => {
    const root = document.documentElement;
    
    // Aplicar variáveis CSS customizadas
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    
    // Atualizar título da página
    document.title = theme.brandName;
    
    // Atualizar favicon se disponível
    if (theme.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = theme.favicon;
      }
    }
  };

  const currentTheme = getThemeForTenant(currentTenant?.id);
  
  return {
    theme: currentTheme,
    applyTheme: () => applyThemeToDocument(currentTheme),
    getThemeForTenant
  };
}

// CSS custom properties para usar nos componentes
export const themeClasses = {
  primary: 'text-primary bg-primary border-primary',
  secondary: 'text-secondary bg-secondary border-secondary',
  accent: 'text-accent bg-accent border-accent',
  background: 'bg-background',
  surface: 'bg-surface'
};