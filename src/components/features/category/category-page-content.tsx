'use client';

import type {
  CategoryFilter,
  CategoryProduct,
  CategoryTab
} from './category-data';
import { CategoryFilters } from './category-filters';
import { CategoryFooter } from './category-footer';
import { CategoryGrid } from './category-grid';
import { CategoryHeader } from './category-header';
import { CategoryHero } from './category-hero';
import { CategoryPagination } from './category-pagination';
import { CategoryTabs } from './category-tabs';
import { useCurrentUserQuery } from '@/hooks/use-auth';
import { useCategoriesQuery, useCategoryQuery } from '@/hooks/use-category';
import { usePublicEquipmentListingsQuery } from '@/hooks/use-equipment';
import type { EquipmentListing } from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const PAGE_SIZE = 8;
const DELIVERY_RADIUS_BUCKETS = [10, 25, 50, 100] as const;

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

function toCategoryProduct(listing: EquipmentListing): CategoryProduct {
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

function sortListings(listings: EquipmentListing[], sortValue: string) {
  const nextListings = [...listings];

  nextListings.sort((left, right) => {
    switch (sortValue) {
      case 'Price: Low to High':
        return left.price - right.price;
      case 'Price: High to Low':
        return right.price - left.price;
      case 'Title: A to Z':
        return left.title.localeCompare(right.title);
      case 'Newest':
      default:
        return (
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
        );
    }
  });

  return nextListings;
}

function filterByRadius(listings: EquipmentListing[], radiusValue: string) {
  if (radiusValue === 'Any Radius') {
    return listings;
  }

  const selectedRadius = Number.parseInt(radiusValue.replace(/[^\d]/g, ''), 10);

  if (!Number.isFinite(selectedRadius)) {
    return listings;
  }

  const selectedBucketIndex = DELIVERY_RADIUS_BUCKETS.findIndex(
    (bucket) => bucket === selectedRadius
  );

  if (selectedBucketIndex === -1) {
    return listings;
  }

  return listings.filter((listing) => {
    const assignedBucketIndex = DELIVERY_RADIUS_BUCKETS.findIndex(
      (bucket) => listing.deliveryRadius <= bucket
    );
    const normalizedBucketIndex =
      assignedBucketIndex === -1
        ? DELIVERY_RADIUS_BUCKETS.length - 1
        : assignedBucketIndex;

    return selectedBucketIndex <= normalizedBucketIndex;
  });
}

function filterByAvailability(
  listings: EquipmentListing[],
  availabilityValue: string
) {
  switch (availabilityValue) {
    case 'Verified Owners':
      return listings.filter((listing) => listing.owner.phoneVerified);
    case 'Available Now':
    case 'All Active Listings':
    default:
      return listings;
  }
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CategoryHeader />
      <main>
        <section className="border-b border-border bg-[#f8f8f1]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-6 h-12 w-80 rounded bg-muted" />
            <div className="mt-4 h-6 w-[42rem] max-w-full rounded bg-muted" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-11 w-36 rounded-md bg-muted"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-[repeat(3,minmax(0,180px))_1fr]">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 rounded bg-muted"
              />
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden border border-[#dfe4eb] bg-white">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="space-y-4 p-4">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-8 w-40 rounded bg-muted" />
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <CategoryFooter />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
      <div className="flex items-center gap-3 text-[#7a120c]">
        <AlertTriangle className="h-5 w-5" />
        <h2 className="text-xl font-semibold tracking-[-0.03em]">
          We couldn&apos;t load this category
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
        {message}
      </p>
    </div>
  );
}

function ExploreMoreCategories({
  currentCategoryId
}: {
  currentCategoryId: string;
}) {
  const categoriesQuery = useCategoriesQuery();

  if (categoriesQuery.isPending || categoriesQuery.isError) {
    return null;
  }

  const categories = categoriesQuery.data
    .filter((category) => category.id !== currentCategoryId)
    .slice(0, 4);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-[#f7f8f4]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
              Explore More
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              Check Out Other Categories
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#5d6f8f]">
            Discover more verified equipment types across the marketplace.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              prefetch
              key={category.id}
              href={`/category/${category.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
              <div className="relative aspect-[5/3] overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  loading={'lazy'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-primary">
                  {category.title}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6f8f]">
                  {category.activeListingCount} active listing
                  {category.activeListingCount === 1 ? '' : 's'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryPageContent({ categoryId }: { categoryId: string }) {
  const currentUserQuery = useCurrentUserQuery();
  const categoryQuery = useCategoryQuery(categoryId);
  const categoriesQuery = useCategoriesQuery();
  const equipmentQuery = usePublicEquipmentListingsQuery(categoryId);
  const [sortValue, setSortValue] = useState('Newest');
  const [radiusValue, setRadiusValue] = useState('Any Radius');
  const [availabilityValue, setAvailabilityValue] = useState('Available Now');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = useMemo<CategoryFilter[]>(
    () => [
      {
        label: 'Sort By',
        value: sortValue,
        options: [
          'Newest',
          'Price: Low to High',
          'Price: High to Low',
          'Title: A to Z'
        ]
      },
      {
        label: 'Delivery Radius',
        value: radiusValue,
        options: [
          'Any Radius',
          'Within 10km',
          'Within 25km',
          'Within 50km',
          'Within 100km'
        ]
      },
      {
        label: 'Availability',
        value: availabilityValue,
        options: ['Available Now', 'Verified Owners', 'All Active Listings']
      }
    ],
    [availabilityValue, radiusValue, sortValue]
  );

  const tabs = useMemo<CategoryTab[]>(
    () => [
      { label: 'All Listings', active: true },
      { label: 'Verified Owners' },
      { label: 'Ready to Rent' }
    ],
    []
  );

  const filteredListings = useMemo(() => {
    const listings = equipmentQuery.data ?? [];

    return sortListings(
      filterByAvailability(
        filterByRadius(listings, radiusValue),
        availabilityValue
      ),
      sortValue
    );
  }, [availabilityValue, equipmentQuery.data, radiusValue, sortValue]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / PAGE_SIZE)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(
    () =>
      filteredListings
        .slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE)
        .map(toCategoryProduct),
    [filteredListings, safeCurrentPage]
  );

  if (
    categoryQuery.isPending ||
    equipmentQuery.isPending ||
    categoriesQuery.isPending
  ) {
    return <CategorySkeleton />;
  }

  if (categoryQuery.isError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <CategoryHeader />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            message={
              categoryQuery.error instanceof ApiError
                ? categoryQuery.error.message
                : 'Try refreshing this page in a moment.'
            }
          />
        </main>
        <CategoryFooter />
      </div>
    );
  }

  if (equipmentQuery.isError) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <CategoryHeader />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState
            message={
              equipmentQuery.error instanceof ApiError
                ? equipmentQuery.error.message
                : 'Try refreshing this page in a moment.'
            }
          />
        </main>
        <CategoryFooter />
      </div>
    );
  }

  const category = categoryQuery.data;
  const allListingCount = equipmentQuery.data?.length ?? 0;
  const userRole = currentUserQuery.data?.role;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CategoryHeader />

      <main>
        <CategoryHero
          title={category.title}
          description={category.description}
          itemCount={`${filteredListings.length} item${filteredListings.length === 1 ? '' : 's'} found`}
        />

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <CategoryTabs tabs={tabs} />
          <CategoryFilters
            filters={filters}
            onChange={(label, value) => {
              if (label === 'Sort By') {
                setSortValue(value);
                setCurrentPage(1);
                return;
              }

              if (label === 'Delivery Radius') {
                setRadiusValue(value);
                setCurrentPage(1);
                return;
              }

              if (label === 'Availability') {
                setAvailabilityValue(value);
                setCurrentPage(1);
              }
            }}
          />

          <div className="mt-6 text-sm text-[#5d6f8f]">
            Showing {paginatedProducts.length} of {filteredListings.length}{' '}
            active listing
            {filteredListings.length === 1 ? '' : 's'} in {category.title}.
            Total live inventory: {allListingCount}.
          </div>

          <div className="mt-10">
            <CategoryGrid
              userRole={userRole}
              products={paginatedProducts}
            />
          </div>

          <CategoryPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>

        <ExploreMoreCategories currentCategoryId={categoryId} />
      </main>

      <CategoryFooter />
    </div>
  );
}
