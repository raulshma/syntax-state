import { getIterationStatus } from '@/lib/actions/user';
import { NewInterviewForm } from '@/components/interview/new-interview-form';
import type { UserPlan } from '@/lib/db/schemas/user';

/**
 * New Interview Page
 * 
 * Performance: getIterationStatus() uses React cache() internally,
 * so this call shares data with the sidebar's getSidebarData() call
 * in the parent layout - no duplicate DB/API requests.
 */
export default async function NewInterviewPage() {
  const result = await getIterationStatus();
  
  const usageData = result.success
    ? {
        interviews: {
          count: result.data.interviews.count,
          limit: result.data.interviews.limit,
        },
        plan: result.data.plan as UserPlan,
        isByok: result.data.isByok,
      }
    : {
        interviews: { count: 0, limit: 3 },
        plan: 'FREE' as UserPlan,
        isByok: false,
      };

  return <NewInterviewForm usageData={usageData} />;
}
