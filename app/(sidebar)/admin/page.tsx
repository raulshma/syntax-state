import { redirect } from 'next/navigation';
import { getAdminDashboardData } from '@/lib/actions/admin-optimized';
import { isAdmin } from '@/lib/auth/get-user';
import { AdminPageContent } from '@/components/admin/admin-page-content';
import { AdminStatsGrid } from '@/components/admin/admin-stats-grid';
import { AdminTabs } from '@/components/admin/admin-tabs';
import type { AIProviderType } from '@/lib/ai';

function isValidData<T>(data: T | { success: false; error: string }): data is T {
  return !data || typeof data !== 'object' || !('success' in data && data.success === false);
}

const defaultData = {
  stats: { totalUsers: 0, activeThisWeek: 0, totalInterviews: 0, totalAIRequests: 0, totalInputTokens: 0, totalOutputTokens: 0, avgLatencyMs: 0, totalCost: 0, errorCount: 0, errorRate: 0, avgTimeToFirstToken: 0 },
  aiLogs: [],
  aiLogsCount: 0,
  searchStatus: { enabled: false },
  usageByAction: [],
  users: [],
  usageTrends: [],
  popularTopics: [],
  planDistribution: [],
  tokenUsageTrends: [],
  topCompanies: [],
  modelUsage: [],
  journeyStats: { totalActiveJourneys: 0, journeysStarted30d: 0, activeJourneyUsers7d: 0, nodeCompletions30d: 0, avgOverallProgressActive7d: 0 },
  journeyTrends: [],
  popularJourneys: [],
  concurrencyLimit: 3,
  tieredModelConfig: {
    high: { provider: 'openrouter' as AIProviderType, primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096, fallbackMaxTokens: 4096, toolsEnabled: true },
    medium: { provider: 'openrouter' as AIProviderType, primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096, fallbackMaxTokens: 4096, toolsEnabled: true },
    low: { provider: 'openrouter' as AIProviderType, primaryModel: null, fallbackModel: null, temperature: 0.7, maxTokens: 4096, fallbackMaxTokens: 4096, toolsEnabled: true },
  },
  aiToolsConfig: [],
  visibilityOverview: {
    journeys: [],
    stats: { totalJourneys: 0, publicJourneys: 0, totalMilestones: 0, publicMilestones: 0, totalObjectives: 0, publicObjectives: 0 },
  },
};

export default async function AdminPage() {
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect('/dashboard');
  }

  // Single optimized call instead of 14 separate calls
  const result = await getAdminDashboardData();
  const data = isValidData(result) ? result : defaultData;

  return (
    <AdminPageContent>
      <div className="space-y-8 overflow-hidden">
        <AdminStatsGrid stats={data.stats} />
        <AdminTabs
          stats={data.stats}
          aiLogs={data.aiLogs}
          aiLogsCount={data.aiLogsCount}
          searchStatus={data.searchStatus}
          usageByAction={data.usageByAction}
          users={data.users}
          usageTrends={data.usageTrends}
          popularTopics={data.popularTopics}
          planDistribution={data.planDistribution}
          tokenUsageTrends={data.tokenUsageTrends}
          topCompanies={data.topCompanies}
          modelUsage={data.modelUsage}
          journeyStats={data.journeyStats}
          journeyTrends={data.journeyTrends}
          popularJourneys={data.popularJourneys}
          concurrencyLimit={data.concurrencyLimit}
          tieredModelConfig={data.tieredModelConfig}
          aiToolsConfig={data.aiToolsConfig}
          visibilityOverview={data.visibilityOverview}
        />
      </div>
    </AdminPageContent>
  );
}
