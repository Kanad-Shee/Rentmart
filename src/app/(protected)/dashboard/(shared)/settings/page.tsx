import { DashboardSettingsContent } from '@/components/features/dashboard/dashboard-settings-content';
import { requireUser } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Settings page for user where they can view their credentials and modify some other details.'
};

export default async function DashboardSettingsPage() {
  const user = await requireUser();
  return <DashboardSettingsContent initialUser={user} />;
}

