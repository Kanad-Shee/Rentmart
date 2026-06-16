import { CategoryPageContent } from '@/components/features/category/category-page-content';
import { getCategoryFromId } from '@/utils/get-category-name';
import type { Metadata } from 'next';

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function generateMetadata({
  params
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const normalizedCategory = getCategoryFromId({ categoryId });

  return {
    title: `${normalizedCategory}`,
    description: 'Browse verified active listings in this equipment category.'
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryPageContent categoryId={categoryId} />;
}

