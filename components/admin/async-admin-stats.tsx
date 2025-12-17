import { getAdminStats } from "@/lib/actions/admin-data";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";

export async function AsyncAdminStats() {
  const stats = await getAdminStats();
  return <AdminStatsGrid stats={stats} />;
}
