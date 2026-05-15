import { RenterBookingsContent } from "@/components/features/dashboard/renter-bookings-content";
import { requireUserRole } from "@/lib/user";

export default async function DashboardBookingsPage() {
  await requireUserRole(["RENTER"]);

  return <RenterBookingsContent />;
}
