import { getDashboardRole } from '@/components/features/dashboard/dashboard-config';
import { DashboardOverviewContent } from '@/components/features/dashboard/dashboard-overview-content';
import { requireUser } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Overview',
  description:
    'A dashboard overview page for users for overall status of their account.'
};

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const role = getDashboardRole(user);

  return <DashboardOverviewContent role={role} />;
}

