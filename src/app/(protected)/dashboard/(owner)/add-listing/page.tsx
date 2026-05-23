import { DashboardAddListingContent } from '@/components/features/dashboard/dashboard-add-listing-content';
import { requireUserRole } from '@/lib/user';

export default async function DashboardAddListingPage() {
  await requireUserRole(['OWNER']);

  return <DashboardAddListingContent />;
}
