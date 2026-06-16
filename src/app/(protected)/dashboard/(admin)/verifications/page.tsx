import { AdminVerifications } from '@/components/features/dashboard/admin-verifications';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment Verification',
  description:
    'An admin page where admin can verify listing compoent from owner to be displayed in website.'
};

export default async function DashboardVerificationsPage() {
  await requireUserRole(['ADMIN']);

  return <AdminVerifications />;
}

