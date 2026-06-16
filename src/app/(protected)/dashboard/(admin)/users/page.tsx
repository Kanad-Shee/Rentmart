import { AdminUserManagement } from '@/components/features/dashboard/admin-user-management';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
  description: 'An admin page where admin can check user status.'
};

export default async function DashboardUsersPage() {
  await requireUserRole(['ADMIN']);

  return <AdminUserManagement />;
}

