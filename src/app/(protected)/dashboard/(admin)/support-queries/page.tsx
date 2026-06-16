import { AdminSupportQueries } from '@/components/features/dashboard/admin-support-queries';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'An admin page where admin can give responses to customer queries.'
};

export default async function DashboardSupportQueriesPage() {
  await requireUserRole(['ADMIN']);

  return <AdminSupportQueries />;
}

