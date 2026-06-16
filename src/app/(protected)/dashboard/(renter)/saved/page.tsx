import { RenterWishlistContent } from '@/components/features/dashboard/renter-wishlist-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlists',
  description: 'A renter page where they can view their wishlisted equipments.'
};

export default async function DashboardSavedPage() {
  await requireUserRole(['RENTER']);

  return <RenterWishlistContent />;
}

