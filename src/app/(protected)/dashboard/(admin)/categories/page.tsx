import { AdminCategoryManagement } from '@/components/features/dashboard/admin-category-management';
import { requireUserRole } from '@/lib/user';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description:
    'Category page where user can do CRUD opearation with existing ones or create new.'
};

export default async function DashboardCategoriesPage() {
  await requireUserRole(['ADMIN']);

  return <AdminCategoryManagement />;
}

