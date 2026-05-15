import { AdminCategoryManagement } from "@/components/features/dashboard/admin-category-management";
import { requireUserRole } from "@/lib/user";

export default async function DashboardCategoriesPage() {
  await requireUserRole(["ADMIN"]);

  return <AdminCategoryManagement />;
}
