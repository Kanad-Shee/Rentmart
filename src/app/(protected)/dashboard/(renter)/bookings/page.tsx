import { RenterBookingsContent } from '@/components/features/dashboard/renter-bookings-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookings',
  description:
    'A renter page where they can view, manage their bookings and its status.'
};

export default async function DashboardBookingsPage() {
  await requireUserRole(['RENTER']);

  return <RenterBookingsContent />;
}

