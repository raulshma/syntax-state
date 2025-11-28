import { redirect } from 'next/navigation';
import { getAuthUserId } from '@/lib/auth/get-user';
import { userRepository } from '@/lib/db/repositories/user-repository';
import { getUserAnalyticsDashboardData } from '@/lib/actions/user-analytics';
import { UserAnalyticsDashboard } from '@/components/settings/user-analytics-dashboard';
import { AnalyticsPageContent } from '@/components/settings/analytics-page-content';
import { AnalyticsUpgradePrompt } from '@/components/settings/analytics-upgrade-prompt';

export default async function AnalyticsPage() {
  const clerkId = await getAuthUserId();
  const user = await userRepository.findByClerkId(clerkId);

  if (!user) {
    redirect('/dashboard');
  }

  // Check if user has PRO or MAX plan
  if (user.plan === 'FREE') {
    return <AnalyticsUpgradePrompt />;
  }

  const data = await getUserAnalyticsDashboardData();

  if (!data) {
    redirect('/dashboard');
  }

  return (
    <AnalyticsPageContent>
      <UserAnalyticsDashboard data={data} />
    </AnalyticsPageContent>
  );
}
