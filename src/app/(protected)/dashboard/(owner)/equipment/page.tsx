import { OwnerEquipmentContent } from '@/components/features/dashboard/owner-equipment-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equipment Overview',
  description:
    'An owner page where owner can have overview of all the existing listings.'
};

export default async function DashboardEquipmentPage() {
  await requireUserRole(['OWNER']);

  return <OwnerEquipmentContent />;
}

