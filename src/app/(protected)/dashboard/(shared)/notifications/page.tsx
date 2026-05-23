import { getRoleConfigForUser } from '@/components/features/dashboard/dashboard-config';
import { NotificationsContent } from '@/components/features/dashboard/notifications-content';
import { requireUser } from '@/lib/user';

export default async function NotificationPage() {
  const user = await requireUser();
  const { config } = getRoleConfigForUser(user);

  return <NotificationsContent profileRole={config.profileRole} />;
}
