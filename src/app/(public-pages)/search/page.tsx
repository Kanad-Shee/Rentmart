import { PublicSearchResultsContent } from '@/components/features/search/public-search-results-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search active equipment listings across the Rentmart marketplace.'
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    categoryId?: string | string[];
    page?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  return <PublicSearchResultsContent searchParams={resolvedSearchParams} />;
}
