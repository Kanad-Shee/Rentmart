import { getRoleConfigForUser } from '@/components/features/dashboard/dashboard-config';
import { NotificationsContent } from '@/components/features/dashboard/notifications-content';
import { requireUser } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'A page for incoming notification according to user role.'
};

export default async function NotificationPage() {
  const user = await requireUser();
  const { config } = getRoleConfigForUser(user);

  return <NotificationsContent profileRole={config.profileRole} />;
}

