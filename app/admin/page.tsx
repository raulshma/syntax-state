import { redirect } from "next/navigation";
import {
  getAdminStats,
  getAILogs,
  getAILogsCount,
  getSearchToolStatus,
  getAIUsageByAction,
  getAdminUsers,
  getUsageTrends,
  getPopularTopics,
  getPlanDistribution,
  getTokenUsageTrends,
  getTopCompanies,
  getModelUsageDistribution,
  getAIConcurrencyLimit,
  getTieredModelConfig,
} from "@/lib/actions/admin";
import { isAdmin } from "@/lib/auth/get-user";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { AdminTabs } from "@/components/admin/admin-tabs";

// Type guard to check if response is valid data (not UnauthorizedResponse)
function isValidData<T>(
  data: T | { success: false; error: string }
): data is T {
  return (
    !data ||
    typeof data !== "object" ||
    !("success" in data && data.success === false)
  );
}

// Server component for fetching all admin data
async function getAdminData() {
  const [
    statsRaw,
    aiLogsRaw,
    aiLogsCountRaw,
    searchStatusRaw,
    usageByActionRaw,
    usersRaw,
    usageTrendsRaw,
    popularTopicsRaw,
    planDistributionRaw,
    tokenUsageTrendsRaw,
    topCompaniesRaw,
    modelUsageRaw,
    concurrencyLimitRaw,
    tieredModelConfigRaw,
  ] = await Promise.all([
    getAdminStats(),
    getAILogs({ limit: 10 }),
    getAILogsCount({}),
    getSearchToolStatus(),
    getAIUsageByAction(),
    getAdminUsers(),
    getUsageTrends(30),
    getPopularTopics(10),
    getPlanDistribution(),
    getTokenUsageTrends(30),
    getTopCompanies(10),
    getModelUsageDistribution(),
    getAIConcurrencyLimit(),
    getTieredModelConfig(),
  ]);

  // Apply type guards with defaults for unauthorized responses
  const stats = isValidData(statsRaw)
    ? statsRaw
    : {
        totalUsers: 0,
        activeThisWeek: 0,
        totalInterviews: 0,
        totalAIRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        avgLatencyMs: 0,
        totalCost: 0,
        errorCount: 0,
        errorRate: 0,
        avgTimeToFirstToken: 0,
      };
  const aiLogs = isValidData(aiLogsRaw) ? aiLogsRaw : [];
  const aiLogsCount = isValidData(aiLogsCountRaw) ? aiLogsCountRaw : 0;
  const searchStatus = isValidData(searchStatusRaw)
    ? searchStatusRaw
    : { enabled: false };
  const usageByAction = isValidData(usageByActionRaw) ? usageByActionRaw : [];
  const users = isValidData(usersRaw) ? usersRaw : [];
  const usageTrends = isValidData(usageTrendsRaw) ? usageTrendsRaw : [];
  const popularTopics = isValidData(popularTopicsRaw) ? popularTopicsRaw : [];
  const planDistribution = isValidData(planDistributionRaw)
    ? planDistributionRaw
    : [];
  const tokenUsageTrends = isValidData(tokenUsageTrendsRaw)
    ? tokenUsageTrendsRaw
    : [];
  const topCompanies = isValidData(topCompaniesRaw) ? topCompaniesRaw : [];
  const modelUsage = isValidData(modelUsageRaw) ? modelUsageRaw : [];
  const concurrencyLimit = isValidData(concurrencyLimitRaw)
    ? concurrencyLimitRaw
    : 3;
  const tieredModelConfig = isValidData(tieredModelConfigRaw)
    ? tieredModelConfigRaw
    : {
        high: {
          primaryModel: null,
          fallbackModel: null,
          temperature: 0.7,
          maxTokens: 4096,
        },
        medium: {
          primaryModel: null,
          fallbackModel: null,
          temperature: 0.7,
          maxTokens: 4096,
        },
        low: {
          primaryModel: null,
          fallbackModel: null,
          temperature: 0.7,
          maxTokens: 4096,
        },
      };

  return {
    stats,
    aiLogs,
    aiLogsCount,
    searchStatus,
    usageByAction,
    users,
    usageTrends,
    popularTopics,
    planDistribution,
    tokenUsageTrends,
    topCompanies,
    modelUsage,
    concurrencyLimit,
    tieredModelConfig,
  };
}

export default async function AdminPage() {
  // Server-side admin check
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect("/dashboard");
  }

  const data = await getAdminData();

  return (
    <main className="flex-1 overflow-auto relative">
      {/* Background effects matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

      {/* Floating gradient orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="relative">
        <AdminHeader />

        <div className="p-6 space-y-8">
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
            concurrencyLimit={data.concurrencyLimit}
            tieredModelConfig={data.tieredModelConfig}
          />
        </div>
      </div>
    </main>
  );
}
