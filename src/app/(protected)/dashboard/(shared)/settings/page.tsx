import { DashboardSettingsContent } from '@/components/features/dashboard/dashboard-settings-content';
import { requireUser } from '@/lib/user';

export default async function DashboardSettingsPage() {
  const user = await requireUser();
  return <DashboardSettingsContent initialUser={user} />;
}
