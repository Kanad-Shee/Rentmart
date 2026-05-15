import { AdminTransactionsContent } from "@/components/features/dashboard/admin-transactions-content";
import { DashboardRoutePlaceholder } from "@/components/features/dashboard/dashboard-route-placeholder";
import { OwnerTransactionsContent } from "@/components/features/dashboard/owner-transactions-content";
import { RenterTransactionsContent } from "@/components/features/dashboard/renter-transactions-content";
import { requireUser } from "@/lib/user";

export default async function DashboardTransactionsPage() {
  const user = await requireUser();

  if (user.role === "RENTER") {
    return <RenterTransactionsContent />;
  }

  if (user.role === "ADMIN") {
    return <AdminTransactionsContent />;
  }

  if (user.role === "OWNER") {
    return <OwnerTransactionsContent />;
  }

  return <DashboardRoutePlaceholder title="Transactions" description="Transaction view unavailable." />;
}
