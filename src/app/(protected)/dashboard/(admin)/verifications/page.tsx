import { AdminVerifications } from '@/components/features/dashboard/admin-verifications';
import { requireUserRole } from '@/lib/user';

export default async function DashboardVerificationsPage() {
  await requireUserRole(['ADMIN']);

  return <AdminVerifications />;
}
