import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

export default function DashboardHeader() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();

  if (!user || !currentTenant) return null;

  const welcomeMessage = currentTenant.settings?.welcomeMessage || 
    `Continue sua jornada de aprendizado`;

  return (
    <div className="mb-8" data-testid="dashboard-header">
      <div className="gradient-bg rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="welcome-message">
              Bem-vindo, {user.firstName}!
            </h1>
            <p className="text-lg opacity-90" data-testid="tenant-welcome">
              {welcomeMessage}
            </p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center">
                <Trophy className="text-accent mr-2 h-5 w-5" />
                <span data-testid="user-total-points">{user.totalPoints} pontos</span>
              </div>
              <div className="flex items-center">
                <Medal className="text-accent mr-2 h-5 w-5" />
                <span data-testid="user-badges">12 badges</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="text-accent mr-2 h-5 w-5" />
                <span data-testid="user-level">Nível {user.level}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="Professional avatar" 
                className="w-32 h-32 rounded-full border-4 border-white/20 object-cover"
                data-testid="user-avatar-image"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-white/80">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
