import { AdminReviewSummaries } from '@/components/features/dashboard/admin-review-summaries';
import { requireUserRole } from '@/lib/user';

export default async function DashboardReviewSummariesPage() {
  await requireUserRole(['ADMIN']);

  return <AdminReviewSummaries />;
}
