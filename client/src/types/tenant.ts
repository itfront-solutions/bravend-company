export interface TenantSubscription {
  id: string;
  moduleId: string;
  moduleName: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  maxUsers?: number;
  features: string[];
}

export interface TenantDomain {
  id: string;
  domain: string;
  isCustomDomain: boolean;
  isPrimary: boolean;
  sslEnabled: boolean;
  status: 'active' | 'pending' | 'inactive';
}

export interface TenantSettings {
  allowedModules: string[];
  maxUsers: number;
  storageLimit: number; // in MB
  customBranding: boolean;
  apiAccess: boolean;
  supportLevel: 'basic' | 'premium' | 'enterprise';
  maintenanceMode: boolean;
}

export interface TenantAnalytics {
  activeUsers: number;
  totalSessions: number;
  storageUsed: number;
  lastActivity: string;
  topModules: Array<{
    moduleId: string;
    name: string;
    usage: number;
  }>;
}

export interface CompanyNews {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  author: string;
  publishedAt: string;
  tags: string[];
  targetTenants?: string[]; // Empty means all tenants
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isVisible: boolean;
}

export interface WhiteLabelTenant {
  id: string;
  name: string;
  brandName: string;
  companyName: string;
  contactEmail: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  
  // Branding
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
    favicon?: string;
    customCss?: string;
  };
  
  // Domains
  domains: TenantDomain[];
  
  // Subscription & Modules
  subscriptions: TenantSubscription[];
  settings: TenantSettings;
  
  // Analytics
  analytics: TenantAnalytics;
  
  // Dates
  createdAt: string;
  updatedAt: string;
  trialEndsAt?: string;
}

export interface AvailableModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'business' | 'analytics' | 'communication' | 'tools';
  features: string[];
  pricing: {
    monthly: number;
    yearly: number;
    setup?: number;
  };
  requirements?: string[];
  isPopular?: boolean;
}

// Available modules in the system
export const AVAILABLE_MODULES: AvailableModule[] = [
  {
    id: 'trails',
    name: 'Trilhas de Aprendizado',
    description: 'Sistema completo de trilhas educacionais e certificações',
    icon: 'BookOpen',
    category: 'learning',
    features: [
      'Criação ilimitada de trilhas',
      'Sistema de certificações',
      'Acompanhamento de progresso',
      'Gamificação',
      'Relatórios detalhados'
    ],
    pricing: { monthly: 29, yearly: 290 }
  },
  {
    id: 'communities',
    name: 'Comunidades',
    description: 'Fóruns de discussão e networking entre usuários',
    icon: 'Users',
    category: 'communication',
    features: [
      'Fóruns de discussão',
      'Sistema de moderação',
      'Grupos privados',
      'Notificações em tempo real',
      'Integração com gamificação'
    ],
    pricing: { monthly: 19, yearly: 190 }
  },
  {
    id: 'businessquest',
    name: 'Business Quest',
    description: 'Simulador de negócios interativo para aprendizado prático',
    icon: 'Gamepad2',
    category: 'business',
    features: [
      'Simulações empresariais',
      'Cenários customizáveis',
      'Competições entre equipes',
      'Analytics de desempenho',
      'Relatórios executivos'
    ],
    pricing: { monthly: 49, yearly: 490, setup: 200 },
    isPopular: true
  },
  {
    id: 'conselho-digital',
    name: 'Conselho Digital',
    description: 'Escola de formação de conselheiros e governança corporativa',
    icon: 'Brain',
    category: 'business',
    features: [
      'Cursos de governança',
      'Mentoria especializada',
      'Networking executivo',
      'Certificações reconhecidas',
      'Biblioteca de casos'
    ],
    pricing: { monthly: 99, yearly: 990, setup: 500 }
  },
  {
    id: 'reports',
    name: 'Relatórios e Analytics',
    description: 'Dashboard executivo com métricas avançadas e insights',
    icon: 'BarChart3',
    category: 'analytics',
    features: [
      'Dashboards personalizáveis',
      'Relatórios automatizados',
      'Exportação de dados',
      'KPIs customizados',
      'Alertas inteligentes'
    ],
    pricing: { monthly: 39, yearly: 390 }
  },
  {
    id: 'api-access',
    name: 'Acesso à API',
    description: 'Integração completa via REST API para sistemas externos',
    icon: 'Code',
    category: 'tools',
    features: [
      'REST API completa',
      'Webhooks',
      'SDK para desenvolvedores',
      'Documentação técnica',
      'Suporte técnico prioritário'
    ],
    pricing: { monthly: 79, yearly: 790 }
  }
];