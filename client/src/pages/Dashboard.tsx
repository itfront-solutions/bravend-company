import { useAuthStore } from '@/store/auth';
import { useTenantStore } from '@/store/tenant';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ActiveTrails from '@/components/dashboard/ActiveTrails';
import RecentAchievements from '@/components/dashboard/RecentAchievements';
import LearningProgress from '@/components/dashboard/LearningProgress';
import LeaderboardRanking from '@/components/dashboard/LeaderboardRanking';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();

  if (!user || !currentTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in" data-testid="dashboard-page">
      <DashboardHeader />
      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActiveTrails />
          <RecentAchievements />
        </div>
        
        <div className="space-y-8">
          <LearningProgress />
          <LeaderboardRanking />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
}
