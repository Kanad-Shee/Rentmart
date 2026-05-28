'use client';

import { useCategoriesQuery } from '@/hooks/use-category';
import { useFeaturedEquipmentQuery } from '@/hooks/use-equipment';
import type { Category } from '@/lib/category';
import type { EquipmentListing } from '@/lib/equipment';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
    <div className="absolute inset-x-3 bottom-3 rounded-xl border border-border bg-background/95 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur sm:inset-x-5 sm:bottom-5 sm:p-5">
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
      <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
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
        <div className="group overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-md shadow-primary/8 ring-1 ring-inset ring-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/15 hover:border-primary/20 hover:-translate-y-1">
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
        <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-foreground group-hover:text-primary transition-colors duration-300">
          {category.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
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
      className="group overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-md shadow-primary/8 ring-1 ring-inset ring-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/20 hover:-translate-y-2">
      <Link
        prefetch
        href={`/details/${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          {listing.images[0] ? (
            <motion.div
              className="h-full w-full"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-white/95 to-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-md ring-1 ring-inset ring-white/50 backdrop-blur-sm">
            <ShieldCheck className="h-3 w-3 fill-current" />
            Verified
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground group-hover:text-primary transition-colors duration-300">
            {listing.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
            {getLocationLabel(listing)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {specs.map((spec) => (
              <motion.div
                key={spec.label}
                className="rounded-lg bg-gradient-to-br from-muted/60 to-muted/40 p-3 border border-primary/5 ring-1 ring-inset ring-primary/5 transition-all duration-300 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:border-primary/10"
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.2 }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {spec.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {spec.value}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-primary/10 pt-5">
            <p className="text-lg font-bold text-primary">
              {formatPrice(listing.price)}{' '}
              <span className="text-xs font-medium text-muted-foreground">
                / day
              </span>
            </p>
            <span className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors duration-300">
              Rent Now
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function HomepageMarketplaceSections() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const categoriesQuery = useCategoriesQuery();
  const featuredEquipmentQuery = useFeaturedEquipmentQuery();
  const featuredListings = useMemo(
    () => featuredEquipmentQuery.data ?? [],
    [featuredEquipmentQuery.data]
  );
  const heroListings = useMemo(
    () =>
      [...featuredListings]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )
        .slice(0, 3),
    [featuredListings]
  );
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const heroListing = heroListings[activeHeroIndex] ?? null;

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

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-linear-to-br from-emerald-50 via-slate-100 to-background">
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
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:justify-start lg:gap-12 lg:px-8 lg:py-24">
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
              className="max-w-xl text-4xl font-bold font-display leading-[1.08] tracking-[-0.05em] text-center text-primary sm:text-5xl lg:text-start lg:text-5xl xl:text-7xl">
              Rent the Power You Need.
              <span className="mt-4 block text-[#86af99] font-display">
                Monetize the Fleet You Own.
              </span>
            </motion.h1>

            <motion.p
              variants={{
                initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
              className="mt-7 max-w-xl text-center text-sm font-medium leading-7 tracking-tight text-muted-foreground sm:text-base lg:mt-8 lg:text-start lg:text-lg lg:leading-8">
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
              className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap lg:items-start">
              <div className="flex -space-x-3 group">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-[#e2e3e0] to-[#d9dbd7] text-xs font-bold text-primary shadow-md ring-1 ring-inset ring-black/5 transition-all duration-300 group-hover:scale-105"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -3, scale: 1.08 }
                  }>
                  RM
                </motion.div>
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-[#c1c8c2] to-[#b3b9b4] text-xs font-bold text-primary shadow-md ring-1 ring-inset ring-black/5 transition-all duration-300 group-hover:scale-105"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -3, scale: 1.08 }
                  }>
                  FM
                </motion.div>
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-[#a5d0b9] to-[#8fc7a8] text-xs font-bold text-[#002114] shadow-md ring-1 ring-inset ring-primary/10 transition-all duration-300 group-hover:scale-105"
                  whileHover={
                    shouldReduceMotion ? undefined : { y: -3, scale: 1.08 }
                  }>
                  AG
                </motion.div>
              </div>
              <p className="text-sm font-medium text-muted-foreground leading-6">
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
              className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-primary/10 bg-card shadow-lg shadow-primary/15 ring-1 ring-inset ring-primary/5 lg:mx-0 transition-all duration-300"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -8, boxShadow: '0 40px 100px rgba(27,67,50,0.2)' }
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
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-primary/15 bg-background/97 p-5 shadow-lg shadow-black/10 backdrop-blur-md ring-1 ring-inset ring-white/50 sm:inset-x-5 sm:bottom-5 sm:p-6">
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
                        <span className="rounded-lg bg-gradient-to-r from-[#c1ecd4] to-[#b0e6c7] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#002114] shadow-sm ring-1 ring-inset ring-primary/20">
                          Available
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
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
                    <div className="mt-5 flex items-center gap-2.5 border-t border-primary/10 pt-5">
                      {heroListings.map((listing, index) => (
                        <button
                          key={listing.id}
                          type="button"
                          aria-label={`Show featured listing ${index + 1}`}
                          onClick={() => setActiveHeroIndex(index)}
                          className={[
                            'rounded-full transition-all duration-300',
                            index === activeHeroIndex
                              ? 'h-3 w-10 bg-primary shadow-md'
                              : 'h-3 w-3 bg-primary/30 hover:bg-primary/50'
                          ].join(' ')}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-primary/15 bg-background/97 p-5 shadow-lg shadow-black/10 backdrop-blur-md ring-1 ring-inset ring-white/50 sm:inset-x-5 sm:bottom-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
                    Featured Unit
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
                    New listings coming soon
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    As owners publish active equipment, the freshest listing
                    will appear here automatically.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f9faf6] py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
            viewport={{ once: true, amount: 0.3 }}
            {...fadeUp(shouldReduceMotion)}>
            <div>
              <SectionEyebrow>Marketplace</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                Browse by Category
              </h2>
            </div>
            <span className="hidden items-center gap-2 border-b border-primary pb-1 text-sm font-semibold text-muted-foreground/50 sm:inline-flex">
              More to come
              {/* <ArrowUpRight className="h-4 w-4" /> */}
            </span>
          </motion.div>

          {categoriesQuery.isPending ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <CategoryCardSkeleton key={item} />
              ))}
            </div>
          ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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
        className="bg-gradient-to-b from-muted/40 to-background py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-14 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
            viewport={{ once: true, amount: 0.3 }}
            {...fadeUp(shouldReduceMotion)}>
            <div>
              <SectionEyebrow>High Demand</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                Featured Machinery
              </h2>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <button
                aria-label="Previous"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-background text-foreground shadow-sm ring-1 ring-inset ring-primary/10 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:border-primary">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-background text-foreground shadow-sm ring-1 ring-inset ring-primary/10 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:border-primary">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          {featuredEquipmentQuery.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <FeaturedCardSkeleton key={item} />
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
