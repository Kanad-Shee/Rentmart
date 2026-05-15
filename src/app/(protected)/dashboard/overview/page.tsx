import { DashboardOverviewContent } from "@/components/features/dashboard/dashboard-overview-content";
import { getDashboardRole } from "@/components/features/dashboard/dashboard-config";
import { requireUser } from "@/lib/user";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const role = getDashboardRole(user);

  return <DashboardOverviewContent role={role} />;
}
