'use client';

import { getDashboardRevealProps } from './dashboard-motion';
import {
  useMyWishlistQuery,
  useRemoveFromWishlistMutation
} from '@/hooks/use-wishlist';
import type { EquipmentListing } from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  ChevronDown,
  Heart,
  MapPin
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getLocationLabel(address: string) {
  const segments = address
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[segments.length - 2]}, ${segments[segments.length - 1]}`;
  }

  return address;
}

type WishlistSortOption = 'recent' | 'price-low' | 'price-high';

function getAvailabilityMeta(status: EquipmentListing['status']) {
  if (status === 'ACTIVE') {
    return {
      dotClassName: 'bg-emerald-500',
      textClassName: 'text-emerald-700',
      label: 'Available Now'
    };
  }

  if (status === 'PENDING_VERIFICATION') {
    return {
      dotClassName: 'bg-amber-500',
      textClassName: 'text-amber-700',
      label: 'Pending Verification'
    };
  }

  if (status === 'REJECTED') {
    return {
      dotClassName: 'bg-[#ba1a1a]',
      textClassName: 'text-[#93000a]',
      label: 'Unavailable'
    };
  }

  return {
    dotClassName: 'bg-[#717973]',
    textClassName: 'text-[#5c5f60]',
    label: 'Draft Listing'
  };
}

function sortListings(
  listings: EquipmentListing[],
  sortOption: WishlistSortOption
) {
  const sortedListings = [...listings];

  sortedListings.sort((left, right) => {
    if (sortOption === 'price-low') {
      return left.price - right.price;
    }

    if (sortOption === 'price-high') {
      return right.price - left.price;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });

  return sortedListings;
}

function WishlistSkeleton() {
  return (
    <section className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-12 w-80 rounded bg-muted" />
        <div className="h-6 w-[520px] rounded bg-muted" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-border bg-white p-5">
            <div className="flex gap-5">
              <div className="h-28 w-28 rounded-xl bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-8 w-48 rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-6 w-28 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#dbe4e0] bg-white/70 px-8 py-16 text-center md:px-12 md:py-20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#f3f4f1] text-[#94a3b8]">
        <Bookmark className="h-7 w-7" />
      </div>
      <h2 className="mt-8 text-3xl font-semibold tracking-[-0.03em] text-primary">
        No saved machinery yet
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base  text-[#5c5f60]">
        Build your wishlist for upcoming projects. Browse our marketplace to
        find the best heavy equipment for your needs.
      </p>
      <Link
        prefetch
        href="/dashboard/overview"
        className="mt-8 inline-flex items-center gap-2 rounded-[4px] bg-[#1b4332] px-8 py-3.5 text-sm font-semibold text-white shadow-[0px_12px_30px_rgba(1,45,29,0.12)] transition-colors hover:bg-[#274e3d]">
        Explore Marketplace
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function RenterWishlistContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const wishlistQuery = useMyWishlistQuery();
  const removeMutation = useRemoveFromWishlistMutation();
  const [sortOption, setSortOption] = useState<WishlistSortOption>('recent');

  if (wishlistQuery.isPending) {
    return <WishlistSkeleton />;
  }

  if (wishlistQuery.isError) {
    return (
      <section className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            My Wishlist
          </h1>
          <p className="max-w-3xl text-base  text-[#5c5f60]">
            Keep your saved equipment close so you can compare and revisit it
            any time.
          </p>
        </div>

        <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-[#7a120c]">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold tracking-[-0.03em]">
              We couldn&apos;t load your wishlist
            </h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm  text-[#7a120c]">
            {wishlistQuery.error instanceof ApiError
              ? wishlistQuery.error.message
              : 'Try refreshing this page in a moment.'}
          </p>
        </div>
      </section>
    );
  }

  const listings = sortListings(wishlistQuery.data, sortOption);

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            Saved Machinery
          </h1>
          <p className="max-w-3xl text-base  text-[#5c5f60]">
            {listings.length === 0
              ? 'Start saving equipment to compare options and revisit them quickly.'
              : `You have ${listings.length} saved item${listings.length === 1 ? '' : 's'} in your wishlist.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold uppercase tracking-tight text-[#5c5f60]">
            Sort By:
          </span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as WishlistSortOption)
              }
              className="appearance-none rounded-lg border border-[#d8dfdb] bg-white py-2 pl-4 pr-11 text-sm text-primary outline-none transition-colors focus:border-[#1b4332]">
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717973]" />
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, index) => {
            const isRemoving =
              removeMutation.isPending &&
              removeMutation.variables === listing.id;
            const availability = getAvailabilityMeta(listing.status);

            return (
              <motion.article
                key={listing.id}
                {...getDashboardRevealProps(shouldReduceMotion, index)}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -5, transition: { duration: 0.2 } }
                }
                className="group overflow-hidden rounded-2xl border border-[#d8dfdb] bg-white transition-shadow duration-300 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
                <div className="relative h-64 overflow-hidden bg-[#f3f4f1]">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      loading={'lazy'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#717973]">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(listing.id)}
                    disabled={isRemoving}
                    aria-label={`Remove ${listing.title} from wishlist`}
                    className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-xl bg-red-500/10 ring ring-red-400 text-[#f72020] shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full shadow-sm bg-[#f3f4f1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5c5f60]">
                        {listing.category.title}
                      </span>
                      <h2 className="mt-3 truncate text-xl font-semibold leading-none tracking-tight text-primary">
                        {listing.title}
                      </h2>
                    </div>

                    <div className="flex shrink-0 items-start gap-1 text-sm text-[#64748b]">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <span className="max-w-24 ">
                        {getLocationLabel(listing.normalizedAddress)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${availability.dotClassName}`}
                    />
                    <span
                      className={`text-sm font-medium ${availability.textClassName}`}>
                      {availability.label}
                    </span>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-[#edf1ee] pt-5">
                    <p className="text-[2rem] font-semibold tracking-tight text-primary">
                      {formatPrice(listing.price)}
                      <span className="ml-2 text-base font-medium text-[#5c5f60]">
                        /day
                      </span>
                    </p>

                    <Link
                      prefetch
                      href={`/details/${listing.id}`}
                      className="inline-flex items-center rounded-lg border border-[#1b4332] px-5 py-3 text-sm font-medium text-[#e5fff5] hover:text-primary transition-colors hover:bg-[#eef5f1] bg-primary">
                      View & Rent
                    </Link>
                  </div>

                  {isRemoving ? (
                    <p className="mt-3 text-sm text-[#9c1f16]">
                      Removing from wishlist...
                    </p>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

