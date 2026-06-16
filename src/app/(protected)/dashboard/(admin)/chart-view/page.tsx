import { AdminChartViewContent } from '@/components/features/dashboard/admin-chart-view-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Chart View',
  description:
    'A graphical representation of multiple processess or transaction happening inside applications.'
};

export default async function DashboardChartViewPage() {
  await requireUserRole(['ADMIN']);

  return <AdminChartViewContent />;
}

