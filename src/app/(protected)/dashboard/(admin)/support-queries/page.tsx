import { AdminSupportQueries } from '@/components/features/dashboard/admin-support-queries';
import { requireUserRole } from '@/lib/user';

export default async function DashboardSupportQueriesPage() {
  await requireUserRole(['ADMIN']);

  return <AdminSupportQueries />;
}
