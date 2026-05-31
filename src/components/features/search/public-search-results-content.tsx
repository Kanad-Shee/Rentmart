'use client';

import { CategoryCard } from '@/components/features/category/category-card';
import { CategoryFooter } from '@/components/features/category/category-footer';
import { CategoryHeader } from '@/components/features/category/category-header';
import { CategoryPagination } from '@/components/features/category/category-pagination';
import { PublicEquipmentSearch } from './public-equipment-search';
import { useCurrentUserQuery } from '@/hooks/use-auth';
import { usePublicEquipmentSearchPageQuery } from '@/hooks/use-equipment';
import type { EquipmentListing } from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import { AlertTriangle, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PublicSearchResultsContentProps = {
  searchParams: {
    q?: string | string[];
    categoryId?: string | string[];
    page?: string | string[];
  };
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getLocationLabel(listing: EquipmentListing) {
  const parts = listing.normalizedAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }

  return listing.normalizedAddress;
}

function toCategoryProduct(listing: EquipmentListing) {
  return {
    id: listing.id,
    href: `/details/${listing.id}`,
    title: listing.title,
    rating: listing.owner.phoneVerified ? '5.0' : '4.8',
    reviews: listing.owner.phoneVerified ? '(Verified Owner)' : '(Listed)',
    location: getLocationLabel(listing),
    price: formatPrice(listing.price),
    image: listing.images[0]?.url ?? listing.category.imageUrl,
    alt: listing.title,
    favorite: listing.isWishlisted
  };
}

function SearchResultsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CategoryHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-40 rounded-3xl bg-muted" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-md border border-border bg-white">
              <div className="aspect-[4/3] bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-8 w-44 rounded bg-muted" />
                <div className="h-4 w-36 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <CategoryFooter />
    </div>
  );
}

function SearchResultsError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CategoryHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h1 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t load search results
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-[#7a120c]">{message}</p>
        </div>
      </main>
      <CategoryFooter />
    </div>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function PublicSearchResultsContent({
  searchParams
}: PublicSearchResultsContentProps) {
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const query = getSingleParam(searchParams.q)?.trim() ?? '';
  const categoryId = getSingleParam(searchParams.categoryId)?.trim() ?? '';
  const pageValue = Number.parseInt(
    getSingleParam(searchParams.page) ?? '1',
    10
  );
  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const searchQuery = usePublicEquipmentSearchPageQuery(
    {
      search: query,
      categoryId: categoryId || undefined,
      page,
      pageSize: 12
    },
    query.length > 0
  );

  if (!query) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <CategoryHeader />
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-primary">
              Search active equipment
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Search by machine name, category, or city to explore live
              marketplace inventory.
            </p>
            <div className="mx-auto mt-8 max-w-3xl">
              <PublicEquipmentSearch
                variant="expanded"
                autoFocus
              />
            </div>
          </section>
        </main>
        <CategoryFooter />
      </div>
    );
  }

  if (searchQuery.isPending) {
    return <SearchResultsSkeleton />;
  }

  if (searchQuery.isError) {
    return (
      <SearchResultsError
        message={
          searchQuery.error instanceof ApiError
            ? searchQuery.error.message
            : 'Try refreshing this page in a moment.'
        }
      />
    );
  }

  const results = searchQuery.data;
  const userRole = currentUserQuery.data?.role;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CategoryHeader />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-border bg-linear-to-br from-white via-[#fbfcfa] to-[#f2f5f1] p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
            Marketplace Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl">
            Results for &quot;{query}&quot;
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Explore active equipment matches and refine by browsing deeper into
            listing details.
          </p>
          <div className="mt-6">
            <PublicEquipmentSearch
              variant="expanded"
              initialValue={query}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#5d6f8f]">
              Showing {results.items.length} of {results.totalItems} active
              listing{results.totalItems === 1 ? '' : 's'}
              {categoryId ? ' in the selected category' : ''}.
            </p>
            {categoryId ? (
              <button
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                className="self-start rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted">
                Clear category filter
              </button>
            ) : null}
          </div>

          {results.items.length > 0 ? (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {results.items.map((listing) => (
                  <CategoryCard
                    key={listing.id}
                    userRole={userRole}
                    product={toCategoryProduct(listing)}
                  />
                ))}
              </div>

              <CategoryPagination
                currentPage={results.page}
                totalPages={results.totalPages}
                onPageChange={(nextPage) => {
                  const nextParams = new URLSearchParams();
                  nextParams.set('q', query);
                  if (categoryId) {
                    nextParams.set('categoryId', categoryId);
                  }
                  nextParams.set('page', String(nextPage));
                  router.push(`/search?${nextParams.toString()}`);
                }}
              />
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                No active equipment matched this search
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Try a broader machine name, category, or city. You can also
                jump back to the marketplace and browse live inventory by
                category.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  prefetch
                  href="/#featured"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  Browse Featured Machinery
                </Link>
                <Link
                  prefetch
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                  Back to Marketplace
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <CategoryFooter />
    </div>
  );
}
