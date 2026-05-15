import { RenterWishlistContent } from "@/components/features/dashboard/renter-wishlist-content";
import { requireUserRole } from "@/lib/user";

export default async function DashboardSavedPage() {
  await requireUserRole(["RENTER"]);

  return <RenterWishlistContent />;
}
