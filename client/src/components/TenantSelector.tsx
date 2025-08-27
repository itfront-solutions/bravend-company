import { useEffect } from 'react';
import { useTenantStore } from '@/store/tenant';
import { useAuthStore } from '@/store/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TenantSelector() {
  const { tenants, currentTenant, loadTenants, setCurrentTenant } = useTenantStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  if (!user || user.role !== 'super_admin' || tenants.length <= 1) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50" data-testid="tenant-selector">
      <Select 
        value={currentTenant?.id || ''} 
        onValueChange={(value) => {
          const tenant = tenants.find(t => t.id === value);
          if (tenant) setCurrentTenant(tenant);
        }}
      >
        <SelectTrigger className="w-48 bg-card border border-border shadow-sm">
          <SelectValue placeholder="Select tenant" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.brandName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
