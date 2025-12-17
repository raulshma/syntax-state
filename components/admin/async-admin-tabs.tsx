import { getAdminUsers } from "@/lib/actions/admin-data";
import { AdminTabsLazy } from "@/components/admin/admin-tabs-lazy";

// Only fetch the default tab (Users) data on initial load
// Other tabs will lazy load when selected
export async function AsyncAdminTabs() {
  const users = await getAdminUsers();

  return <AdminTabsLazy initialUsersData={{ users }} />;
}
