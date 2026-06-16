import { OwnerRentalRequestsContent } from '@/components/features/dashboard/owner-rental-requests-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Requests',
  description:
    'An owner page where owner can approve or reject renters request for rent their equipment.'
};

export default async function DashboardRentalRequestsPage() {
  await requireUserRole(['OWNER']);

  return <OwnerRentalRequestsContent />;
}

