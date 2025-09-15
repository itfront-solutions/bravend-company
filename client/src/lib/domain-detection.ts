import { WhiteLabelTenant } from '@/types/tenant';

export interface DomainConfig {
  hostname: string;
  tenantId: string | null;
  isCustomDomain: boolean;
  requiresSSL: boolean;
}

// Mock data - em produção virá do banco/API
const DOMAIN_MAPPINGS: Record<string, string | null> = {
  'acme.orquestra.com': '1',
  'learn.acme.com': '1',
  'techstart.orquestra.com': '2',
  'educacao.techcorp.com': '3',
  'plataforma.inovacorp.com.br': '4',
  // Domínio principal da Orquestra (empresa mãe)
  'orquestra.com': null,
  'admin.orquestra.com': null,
  'localhost': null, // Para desenvolvimento
  '127.0.0.1': null
};

/**
 * Detecta o tenant baseado no domínio atual
 */
export function detectTenantFromDomain(): DomainConfig {
  const hostname = window.location.hostname;
  const tenantId = DOMAIN_MAPPINGS[hostname] || null;
  
  const isCustomDomain = !hostname.includes('orquestra.com') && 
                        !hostname.includes('localhost') && 
                        !hostname.includes('127.0.0.1');
  
  const requiresSSL = isCustomDomain || (hostname !== 'localhost' && hostname !== '127.0.0.1');
  
  return {
    hostname,
    tenantId,
    isCustomDomain,
    requiresSSL
  };
}

/**
 * Verifica se o SSL é obrigatório para o domínio
 */
export function requiresSSL(hostname: string): boolean {
  return !hostname.includes('localhost') && !hostname.includes('127.0.0.1');
}

/**
 * Gera URL de subdomínio para um tenant
 */
export function generateTenantSubdomain(tenantSlug: string): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://orquestra.com' 
    : 'http://localhost:3000';
  
  return `${baseUrl.replace('orquestra.com', `${tenantSlug}.orquestra.com`)}`;
}

/**
 * Valida se um domínio personalizado é válido
 */
export function validateCustomDomain(domain: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Verifica formato básico
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain)) {
    errors.push('Formato de domínio inválido');
  }
  
  // Verifica se não é um domínio reservado
  const reservedDomains = ['orquestra.com', 'admin.orquestra.com', 'api.orquestra.com'];
  if (reservedDomains.some(reserved => domain.includes(reserved))) {
    errors.push('Domínio reservado do sistema');
  }
  
  // Verifica se não está em uso
  if (DOMAIN_MAPPINGS[domain]) {
    errors.push('Domínio já está em uso por outro cliente');
  }
  
  // Verifica comprimento
  if (domain.length > 253) {
    errors.push('Domínio muito longo (máximo 253 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Configura redirecionamento automático para HTTPS em domínios personalizados
 */
export function enforceHTTPS(): void {
  if (window.location.protocol === 'http:' && requiresSSL(window.location.hostname)) {
    window.location.replace(window.location.href.replace('http:', 'https:'));
  }
}

/**
 * Middleware de detecção de tenant
 */
export class TenantDetectionMiddleware {
  private static instance: TenantDetectionMiddleware;
  private currentDomainConfig: DomainConfig;
  
  private constructor() {
    this.currentDomainConfig = detectTenantFromDomain();
    this.enforceSSL();
  }
  
  public static getInstance(): TenantDetectionMiddleware {
    if (!TenantDetectionMiddleware.instance) {
      TenantDetectionMiddleware.instance = new TenantDetectionMiddleware();
    }
    return TenantDetectionMiddleware.instance;
  }
  
  public getDomainConfig(): DomainConfig {
    return this.currentDomainConfig;
  }
  
  public getTenantId(): string | null {
    return this.currentDomainConfig.tenantId;
  }
  
  public isMainDomain(): boolean {
    return this.currentDomainConfig.tenantId === null;
  }
  
  public isCustomDomain(): boolean {
    return this.currentDomainConfig.isCustomDomain;
  }
  
  private enforceSSL(): void {
    if (this.currentDomainConfig.requiresSSL && window.location.protocol === 'http:') {
      window.location.replace(window.location.href.replace('http:', 'https:'));
    }
  }
  
  /**
   * Obtém configuração de branding baseada no domínio
   */
  public async getBrandingConfig(): Promise<Partial<WhiteLabelTenant> | null> {
    const tenantId = this.getTenantId();
    if (!tenantId) return null;
    
    // Mock data - em produção faria chamada à API
    const mockTenants: Record<string, Partial<WhiteLabelTenant>> = {
      '1': {
        id: '1',
        name: 'acme-corp',
        brandName: 'ACME Corporation',
        theme: {
          primaryColor: '#FF6B35',
          secondaryColor: '#004E89',
          accentColor: '#FFC857',
          logo: 'https://via.placeholder.com/200x60/FF6B35/FFFFFF?text=ACME'
        }
      },
      '2': {
        id: '2',
        name: 'techstart',
        brandName: 'TechStart Academy',
        theme: {
          primaryColor: '#8B5CF6',
          secondaryColor: '#06B6D4',
          accentColor: '#F59E0B'
        }
      }
    };
    
    return mockTenants[tenantId] || null;
  }
  
  /**
   * Aplica configurações de DNS/SSL para domínio personalizado
   */
  public async configureDomain(domain: string, tenantId: string): Promise<{
    success: boolean;
    dnsRecords?: Array<{ type: string; name: string; value: string }>;
    sslStatus?: 'pending' | 'active' | 'failed';
    errors?: string[];
  }> {
    const validation = validateCustomDomain(domain);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // Mock da configuração DNS
    return {
      success: true,
      dnsRecords: [
        { type: 'CNAME', name: domain, value: 'proxy.orquestra.com' },
        { type: 'TXT', name: `_orquestra-verification.${domain}`, value: `tenant=${tenantId}` }
      ],
      sslStatus: 'pending'
    };
  }
}

/**
 * Hook React para usar o middleware de detecção de tenant
 */
export function useDomainDetection() {
  const middleware = TenantDetectionMiddleware.getInstance();
  
  return {
    domainConfig: middleware.getDomainConfig(),
    tenantId: middleware.getTenantId(),
    isMainDomain: middleware.isMainDomain(),
    isCustomDomain: middleware.isCustomDomain(),
    getBrandingConfig: middleware.getBrandingConfig.bind(middleware),
    configureDomain: middleware.configureDomain.bind(middleware)
  };
}