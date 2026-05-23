'use client';

import { useCurrentUserQuery } from '@/hooks/use-auth';
import { useCategoriesQuery } from '@/hooks/use-category';
import {
  useFeaturedEquipmentQuery,
  usePublicEquipmentListingsQuery
} from '@/hooks/use-equipment';
import type { Category } from '@/lib/category';
import type { EquipmentListing } from '@/lib/equipment';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HERO_FALLBACK_IMAGE = '/assets/landing/landing-tractor.webp';

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
      {children}
    </p>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getCategoryCountLabel(count: number) {
  return `${count} Unit${count === 1 ? '' : 's'} Available`;
}

function getLocationLabel(listing: EquipmentListing) {
  const parts = listing.normalizedAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${listing.category.title} • ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
  }

  return `${listing.category.title} • ${listing.normalizedAddress}`;
}

function getListingSpecs(listing: EquipmentListing) {
  return [
    { label: 'Radius', value: `${listing.deliveryRadius}km` },
    {
      label: 'Owner',
      value: listing.owner.phoneVerified ? 'Verified' : 'Listed'
    }
  ];
}

function HeroFeaturedSkeleton() {
  return (
    <div className="absolute inset-x-5 bottom-5 rounded-xl border border-border bg-background/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-6 w-20 rounded bg-muted" />
      </div>
      <div className="mt-3 h-8 w-56 rounded bg-muted" />
      <div className="mt-2 h-4 w-40 rounded bg-muted" />
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
        <div className="h-6 w-24 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

function HeroFallbackImage() {
  return (
    <div className="absolute inset-0">
      <Image
        src={HERO_FALLBACK_IMAGE}
        alt="Featured machinery preview"
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,31,24,0.08),rgba(14,31,24,0.18))]" />
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="aspect-square animate-pulse bg-muted" />
      </div>
      <div className="mt-4 h-6 w-32 rounded bg-muted" />
      <div className="mt-2 h-4 w-28 rounded bg-muted" />
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="p-5">
        <div className="h-6 w-36 rounded bg-muted" />
        <div className="mt-2 h-4 w-32 rounded bg-muted" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="rounded bg-muted p-2">
              <div className="h-3 w-12 rounded bg-background/70" />
              <div className="mt-2 h-4 w-16 rounded bg-background/70" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="h-5 w-20 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background px-8 py-16 text-center">
      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function fadeUp(shouldReduceMotion: boolean, delay = 0, distance = 24) {
  if (shouldReduceMotion) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0 }
    };
  }

  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1] as const
    }
  };
}

function CategoryCard({ category }: { category: Category }) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -6, transition: { duration: 0.22 } }
      }>
      <Link
        prefetch
        href={`/category/${category.id}` as Route}>
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_12px_30px_rgba(27,67,50,0.05)] transition-shadow duration-300 hover:shadow-[0_22px_45px_rgba(27,67,50,0.12)]">
          <div className="relative aspect-square">
            <motion.div
              className="h-full w-full"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Image
                src={category.imageUrl}
                alt={category.title}
                loading={'lazy'}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 50vw, 25vw"
              />
            </motion.div>
          </div>
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-foreground">
          {category.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {getCategoryCountLabel(category.activeListingCount)}
        </p>
      </Link>
    </motion.div>
  );
}

function FeaturedCard({ listing }: { listing: EquipmentListing }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const specs = getListingSpecs(listing);

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -8,
              transition: { duration: 0.24, ease: 'easeOut' }
            }
      }
      className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_8px_24px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(27,67,50,0.12)]">
      <Link
        prefetch
        href={`/details/${listing.id}`}>
        <div className="relative aspect-[4/3]">
          {listing.images[0] ? (
            <motion.div
              className="h-full w-full"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Image
                src={listing.images[0].url}
                alt={listing.title}
                fill
                loading={'lazy'}
                className="object-cover"
                sizes="(max-width: 1280px) 50vw, 25vw"
              />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-background/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
            <ShieldCheck className="h-3 w-3 fill-current" />
            Verified
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
            {listing.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {getLocationLabel(listing)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {specs.map((spec) => (
              <motion.div
                key={spec.label}
                className="rounded bg-muted p-2"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -2, backgroundColor: 'rgba(226,227,224,0.7)' }
                }
                transition={{ duration: 0.2 }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {spec.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {spec.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
            <p className="text-lg font-bold text-primary">
              {formatPrice(listing.price)}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                / day
              </span>
            </p>
            <span className="text-sm font-semibold text-primary">Rent Now</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function HomepageMarketplaceSections() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion() ?? false;
  const currentUserQuery = useCurrentUserQuery();
  const categoriesQuery = useCategoriesQuery();
  const featuredEquipmentQuery = useFeaturedEquipmentQuery();
  const publicListingsQuery = usePublicEquipmentListingsQuery();
  const featuredListings = featuredEquipmentQuery.data ?? [];
  const publicListings = publicListingsQuery.data ?? [];
  const [heroListings, setHeroListings] = useState<EquipmentListing[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const heroListing = heroListings[activeHeroIndex] ?? null;
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const recentListings = [...featuredListings]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      )
      .slice(0, 3);

    setHeroListings(recentListings);
    setActiveHeroIndex(0);
  }, [featuredListings]);

  useEffect(() => {
    if (shouldReduceMotion || heroListings.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroIndex(
        (currentIndex) => (currentIndex + 1) % heroListings.length
      );
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [heroListings, shouldReduceMotion]);

  function handleSearch() {
    const normalizedEquipment = equipmentSearch.trim().toLowerCase();
    const normalizedLocation = locationSearch.trim().toLowerCase();

    const listingMatch = publicListings.find((listing) => {
      const matchesEquipment =
        normalizedEquipment.length === 0 ||
        `${listing.title} ${listing.category.title}`
          .toLowerCase()
          .includes(normalizedEquipment);
      const matchesLocation =
        normalizedLocation.length === 0 ||
        listing.normalizedAddress.toLowerCase().includes(normalizedLocation);

      return matchesEquipment && matchesLocation;
    });

    if (listingMatch) {
      setSearchError(null);
      router.push(`/details/${listingMatch.id}`);
      return;
    }

    const categoryMatch = (categoriesQuery.data ?? []).find((category) =>
      normalizedEquipment.length > 0
        ? category.title.toLowerCase().includes(normalizedEquipment)
        : false
    );

    if (categoryMatch) {
      setSearchError(null);
      router.push(`/category/${categoryMatch.id}`);
      return;
    }

    setSearchError(
      'No live listing matched that search yet. Try a category like tractors or a city from an active listing.'
    );
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8 }}>
          <motion.div
            className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#cfe3d7]/55 blur-3xl"
            animate={
              shouldReduceMotion
                ? undefined
                : { x: [0, 20, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }
            }
            transition={{
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-[#e6eee7] blur-3xl"
            animate={
              shouldReduceMotion
                ? undefined
                : { x: [0, -18, 0], y: [0, 14, 0], scale: [1.04, 1, 1.04] }
            }
            transition={{
              duration: 16,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center justify-center lg:justify-start lg:px-8 lg:py-24">
          <motion.div
            className="relative z-10"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: shouldReduceMotion
                  ? undefined
                  : { staggerChildren: 0.1, delayChildren: 0.08 }
              }
            }}>
            <motion.h1
              variants={{
                initial: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
              className="max-w-xl text-4xl font-display leading-[0.98] tracking-[-0.04em] text-center lg:text-start text-primary sm:text-5xl lg:text-6xl font-bold">
              Rent the Power You Need.
              <span className="mt-3 block text-[#86af99]">
                Monetize the Fleet You Own.
              </span>
            </motion.h1>

            <motion.p
              variants={{
                initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
              className="mt-6 max-w-xl text-center lg:text-start text-base font-medium text-muted-foreground sm:text-lg tracking-tight">
              The world&apos;s premier industrial marketplace for heavy
              machinery. High-capacity equipment, verified owners, and
              comprehensive protection for every project.
            </motion.p>

            <motion.div
              variants={{
                initial: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#e2e3e0] text-xs font-bold text-primary"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }
                  }>
                  RM
                </motion.div>
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#c1c8c2] text-xs font-bold text-primary"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }
                  }>
                  FM
                </motion.div>
                <motion.div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-[#a5d0b9] text-xs font-bold text-[#002114]"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }
                  }>
                  AG
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">
                  Live inventory
                </span>{' '}
                updates automatically from verified active listings
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{
              opacity: 0,
              x: shouldReduceMotion ? 0 : 32,
              y: shouldReduceMotion ? 0 : 18
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              delay: shouldReduceMotion ? 0 : 0.2
            }}>
            <motion.div
              className="relative mx-auto lg:mx-0 max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -6, boxShadow: '0 34px 90px rgba(27,67,50,0.16)' }
              }
              transition={{ duration: 0.35, ease: 'easeOut' }}>
              <div className="relative aspect-4/4.25 w-full">
                {heroListings.length > 0 ? (
                  <AnimatePresence mode="wait">
                    {heroListing?.images[0] ? (
                      <motion.div
                        key={heroListing.id}
                        className="absolute inset-0"
                        initial={{
                          opacity: 0,
                          scale: shouldReduceMotion ? 1 : 1.035
                        }}
                        animate={{
                          opacity: 1,
                          scale: shouldReduceMotion ? 1 : 1
                        }}
                        exit={{
                          opacity: 0,
                          scale: shouldReduceMotion ? 1 : 0.985
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.6,
                          ease: [0.22, 1, 0.36, 1]
                        }}>
                        <motion.div
                          className="h-full w-full"
                          animate={
                            shouldReduceMotion
                              ? undefined
                              : { scale: [1, 1.03, 1] }
                          }
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut'
                          }}>
                          <Image
                            src={heroListing.images[0].url}
                            alt={heroListing.title}
                            fill
                            unoptimized
                            loading={'lazy'}
                            priority={activeHeroIndex === 0}
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={heroListing?.id ?? 'hero-empty-image'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                        No image available
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : featuredEquipmentQuery.isPending ? (
                  <HeroFallbackImage />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                    New listings coming soon
                  </div>
                )}
              </div>

              {featuredEquipmentQuery.isPending ? (
                <HeroFeaturedSkeleton />
              ) : heroListing ? (
                <div className="absolute inset-x-5 bottom-5 rounded-xl border border-border bg-background/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={heroListing.id}
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : 18
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : -12
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.55,
                        delay: shouldReduceMotion ? 0 : 0.12
                      }}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
                          Featured Unit
                        </p>
                        <span className="rounded bg-[#c1ecd4] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#002114]">
                          Available
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                        {heroListing.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {heroListing.category.title} • Recently added
                      </p>
                      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(heroListing.price)}{' '}
                          <span className="text-sm font-normal text-muted-foreground">
                            / day
                          </span>
                        </p>
                        <Link
                          prefetch
                          href={`/details/${heroListing.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          View Details
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {heroListings.length > 1 ? (
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                      {heroListings.map((listing, index) => (
                        <button
                          key={listing.id}
                          type="button"
                          aria-label={`Show featured listing ${index + 1}`}
                          onClick={() => setActiveHeroIndex(index)}
                          className={[
                            'h-2.5 rounded-full transition-all',
                            index === activeHeroIndex
                              ? 'w-8 bg-primary'
                              : 'w-2.5 bg-primary/25 hover:bg-primary/45'
                          ].join(' ')}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="absolute inset-x-5 bottom-5 rounded-xl border border-border bg-background/95 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
                    Featured Unit
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                    New listings coming soon
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    As owners publish active equipment, the freshest listing
                    will appear here automatically.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f9faf6] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mb-10 flex items-end justify-between gap-6"
            viewport={{ once: true, amount: 0.3 }}
            {...fadeUp(shouldReduceMotion)}>
            <div>
              <SectionEyebrow>Marketplace</SectionEyebrow>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Browse by Category
              </h2>
            </div>
            <span className="hidden items-center gap-2 border-b border-primary pb-1 text-sm font-semibold text-primary sm:inline-flex">
              Live inventory from the marketplace
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </motion.div>

          {categoriesQuery.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <CategoryCardSkeleton key={item} />
              ))}
            </div>
          ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {categoriesQuery.data.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active categories yet"
              description="Categories will populate here automatically as owners publish verified active equipment."
            />
          )}
        </div>
      </section>

      <section
        id="featured"
        className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mb-10 flex items-end justify-between gap-6"
            viewport={{ once: true, amount: 0.3 }}
            {...fadeUp(shouldReduceMotion)}>
            <div>
              <SectionEyebrow>High Demand</SectionEyebrow>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                Featured Machinery
              </h2>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                aria-label="Previous"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {featuredEquipmentQuery.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <FeaturedCardSkeleton key={item} />
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {featuredListings.map((listing) => (
                <FeaturedCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No featured listings yet"
              description="Verified active equipment will appear here automatically once owners publish inventory."
            />
          )}
        </div>
      </section>
    </>
  );
}
