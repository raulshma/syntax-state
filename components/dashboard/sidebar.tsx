import { getIterationStatus, getUserProfile } from "@/lib/actions/user";
import { isAdmin } from "@/lib/auth/get-user";
import { SidebarUi } from "./sidebar-ui";

export interface SidebarData {
  isAdmin: boolean;
  usage: {
    iterations: { count: number; limit: number };
    interviews: { count: number; limit: number };
    plan: string;
    isByok: boolean;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  };
}

/**
 * Fetch sidebar data independently (used when not on dashboard page)
 * For dashboard page, use getDashboardData() which includes sidebar data
 *
 * Optimized: Uses parallel queries and cached functions to minimize latency
 */
export async function getSidebarData(): Promise<SidebarData> {
  // All three calls use React cache() internally, so they deduplicate
  // and share the same underlying auth/DB calls
  const [userIsAdmin, iterationResult, profileResult] = await Promise.all([
    isAdmin(),
    getIterationStatus(),
    getUserProfile(),
  ]);

  const iterationData = iterationResult.success
    ? iterationResult.data
    : {
        count: 0,
        limit: 20,
        remaining: 20,
        resetDate: new Date(),
        plan: "FREE",
        isByok: false,
        interviews: { count: 0, limit: 3, resetDate: new Date() },
      };

  const profile = profileResult.success
    ? profileResult.data
    : {
        firstName: null,
        lastName: null,
        email: null,
        imageUrl: null,
      };

  return {
    isAdmin: userIsAdmin,
    usage: {
      iterations: { count: iterationData.count, limit: iterationData.limit },
      interviews: {
        count: iterationData.interviews.count,
        limit: iterationData.interviews.limit,
      },
      plan: iterationData.plan,
      isByok: iterationData.isByok,
    },
    user: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      imageUrl: profile.imageUrl,
    },
  };
}

export async function Sidebar() {
  const data = await getSidebarData();

  return <SidebarUi data={data} />;
}
