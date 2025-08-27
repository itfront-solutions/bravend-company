import { type Tenant } from "@shared/schema";

const TENANT_KEY = 'current_tenant';

export class TenantService {
  static async getTenants(): Promise<Tenant[]> {
    const response = await fetch('/api/tenants');
    if (!response.ok) {
      throw new Error('Failed to fetch tenants');
    }
    return response.json();
  }

  static async getTenant(id: string): Promise<Tenant> {
    const response = await fetch(`/api/tenants/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tenant');
    }
    return response.json();
  }

  static setCurrentTenant(tenant: Tenant): void {
    localStorage.setItem(TENANT_KEY, JSON.stringify(tenant));
    this.applyTenantTheme(tenant);
  }

  static getCurrentTenant(): Tenant | null {
    const tenantStr = localStorage.getItem(TENANT_KEY);
    if (!tenantStr) return null;
    
    try {
      return JSON.parse(tenantStr);
    } catch {
      return null;
    }
  }

  static applyTenantTheme(tenant: Tenant): void {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    body.classList.remove('cvo-theme', 'carvion-theme');

    if (tenant.theme) {
      // Determine theme class based on tenant
      const themeClass = tenant.name.toLowerCase().includes('cvo') ? 'cvo-theme' : 'carvion-theme';
      body.classList.add(themeClass);

      // Apply custom colors if available
      if (tenant.theme.primaryColor) {
        root.style.setProperty('--primary', tenant.theme.primaryColor);
      }
      if (tenant.theme.secondaryColor) {
        root.style.setProperty('--secondary', tenant.theme.secondaryColor);
      }
      if (tenant.theme.accentColor) {
        root.style.setProperty('--accent', tenant.theme.accentColor);
      }
    }
  }

  static initializeTenantFromUser(tenantId: string): Promise<void> {
    return this.getTenant(tenantId).then(tenant => {
      this.setCurrentTenant(tenant);
    });
  }
}
