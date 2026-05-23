import { OwnerEquipmentContent } from '@/components/features/dashboard/owner-equipment-content';
import { requireUserRole } from '@/lib/user';

export default async function DashboardEquipmentPage() {
  await requireUserRole(['OWNER']);

  return <OwnerEquipmentContent />;
}
