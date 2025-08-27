import { create } from 'zustand';
import { TenantService } from '@/lib/tenant';
import { type Tenant } from '@shared/schema';

interface TenantState {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  isLoading: boolean;
  setCurrentTenant: (tenant: Tenant) => void;
  loadTenants: () => Promise<void>;
  initializeTenant: (tenantId: string) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: null,
  tenants: [],
  isLoading: false,

  setCurrentTenant: (tenant) => {
    TenantService.setCurrentTenant(tenant);
    set({ currentTenant: tenant });
  },

  loadTenants: async () => {
    set({ isLoading: true });
    try {
      const tenants = await TenantService.getTenants();
      set({ tenants, isLoading: false });
    } catch (error) {
      console.error('Failed to load tenants:', error);
      set({ isLoading: false });
    }
  },

  initializeTenant: async (tenantId) => {
    try {
      const tenant = await TenantService.getTenant(tenantId);
      get().setCurrentTenant(tenant);
    } catch (error) {
      console.error('Failed to initialize tenant:', error);
    }
  },
}));
