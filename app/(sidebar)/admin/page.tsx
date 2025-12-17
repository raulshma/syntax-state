import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/get-user';
import { AdminPageContent } from '@/components/admin/admin-page-content';
import { AsyncAdminStats } from '@/components/admin/async-admin-stats';
import { AsyncAdminTabs } from '@/components/admin/async-admin-tabs';
import { StatsGridSkeleton, TabsSkeleton } from '@/components/admin/admin-skeletons';

export default async function AdminPage() {
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect('/dashboard');
  }

  return (
    <AdminPageContent>
      <div className="space-y-8 overflow-hidden">
        <Suspense fallback={<StatsGridSkeleton />}>
          <AsyncAdminStats />
        </Suspense>
        <Suspense fallback={<TabsSkeleton />}>
          <AsyncAdminTabs />
        </Suspense>
      </div>
    </AdminPageContent>
  );
}
