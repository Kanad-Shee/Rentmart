import { AdminUserManagement } from '@/components/features/dashboard/admin-user-management';
import { requireUserRole } from '@/lib/user';

export default async function DashboardUsersPage() {
  await requireUserRole(['ADMIN']);

  return <AdminUserManagement />;
}
