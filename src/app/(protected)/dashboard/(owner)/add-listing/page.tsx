import { DashboardAddListingContent } from '@/components/features/dashboard/dashboard-add-listing-content';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Listing',
  description: 'An owner page where owner can draft or publish their listing.'
};

export default async function DashboardAddListingPage() {
  await requireUserRole(['OWNER']);

  return <DashboardAddListingContent />;
}

