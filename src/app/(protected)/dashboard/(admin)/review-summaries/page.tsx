import { AdminReviewSummaries } from '@/components/features/dashboard/admin-review-summaries';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Summary',
  description:
    'An admin page where admin can create, show or hide overall review for equipments accroding to all reviews through AI.'
};

export default async function DashboardReviewSummariesPage() {
  await requireUserRole(['ADMIN']);

  return <AdminReviewSummaries />;
}
