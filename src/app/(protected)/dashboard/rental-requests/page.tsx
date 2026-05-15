import { OwnerRentalRequestsContent } from "@/components/features/dashboard/owner-rental-requests-content";
import { requireUserRole } from "@/lib/user";

export default async function DashboardRentalRequestsPage() {
  await requireUserRole(["OWNER"]);

  return <OwnerRentalRequestsContent />;
}
