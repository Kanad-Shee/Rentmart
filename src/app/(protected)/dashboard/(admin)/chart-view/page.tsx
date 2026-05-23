import { AdminChartViewContent } from '@/components/features/dashboard/admin-chart-view-content';
import { requireUserRole } from '@/lib/user';

export default async function DashboardChartViewPage() {
  await requireUserRole(['ADMIN']);

  return <AdminChartViewContent />;
}
