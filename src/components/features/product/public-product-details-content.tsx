'use client';

import { ProductDeliveryMap } from '@/components/features/product/product-delivery-map';
import { ProductFooter } from '@/components/features/product/product-footer';
import { ProductGallery } from '@/components/features/product/product-gallery';
import { ProductHeader } from '@/components/features/product/product-header';
import { ProductOwnerSummary } from '@/components/features/product/product-owner-summary';
import { ProductRentalCard } from '@/components/features/product/product-rental-card';
import { ProductReviewsSection } from '@/components/features/product/product-reviews-section';
import { ProductSpecGrid } from '@/components/features/product/product-spec-grid';
import { usePublicEquipmentQuery } from '@/hooks/use-equipment';
import { ApiError } from '@/lib/http';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';

function getRevealProps(shouldReduceMotion: boolean, index = 0) {
  return {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 18
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: shouldReduceMotion
      ? {
          duration: 0,
          delay: 0
        }
      : {
          duration: 0.42,
          delay: Math.min(index * 0.08, 0.4),
          ease: [0.22, 1, 0.36, 1] as const
        }
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function formatLongDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function buildDescription(
  listingTitle: string,
  categoryTitle: string,
  address: string,
  deliveryRadius: number
) {
  return [
    `${listingTitle} is listed in the ${categoryTitle} category and is available for verified industrial rental through Rentmart. The owner has published this machine with delivery coverage configured around ${address}.`,
    `This listing currently supports a delivery radius of ${deliveryRadius} km. Use the rental card to review the daily rate and proceed once your project timing and location are confirmed.`
  ];
}

function getDescriptionParagraphs(input: {
  ownerDescription: string | null;
  listingTitle: string;
  categoryTitle: string;
  address: string;
  deliveryRadius: number;
}) {
  const ownerDescription = input.ownerDescription?.trim();

  if (ownerDescription) {
    return ownerDescription
      .split(/\n\s*\n/g)
      .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
      .filter((paragraph) => paragraph.length > 0);
  }

  return buildDescription(
    input.listingTitle,
    input.categoryTitle,
    input.address,
    input.deliveryRadius
  );
}

function buildSpecs(
  categoryTitle: string,
  price: number,
  deliveryRadius: number,
  createdAt: string
) {
  return [
    { label: 'Category', value: categoryTitle },
    { label: 'Daily Rate', value: formatCurrency(price) },
    { label: 'Delivery Radius', value: `${deliveryRadius} km` },
    { label: 'Listed On', value: formatLongDate(createdAt) }
  ] as const;
}

function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-4 w-60 rounded bg-muted" />
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <article className="space-y-8 lg:col-span-8">
            <div className="h-130 rounded-md bg-muted" />
            <div className="space-y-4">
              <div className="h-6 w-36 rounded bg-muted" />
              <div className="h-14 w-3/4 rounded bg-muted" />
            </div>
            <div className="h-24 rounded-md bg-muted" />
            <div className="space-y-4">
              <div className="h-10 w-48 rounded bg-muted" />
              <div className="h-5 w-full rounded bg-muted" />
              <div className="h-5 w-5/6 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-md bg-muted"
                />
              ))}
            </div>
          </article>
          <div className="lg:col-span-4">
            <div className="h-105 rounded-md bg-muted" />
          </div>
        </div>
      </main>
      <ProductFooter />
    </div>
  );
}

function ProductUnavailableState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductHeader />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-background p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <h1 className="text-4xl font-semibold text-primary">
            Listing unavailable
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {message}
          </p>
          <Link
            prefetch
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Back to Marketplace
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <ProductFooter />
    </div>
  );
}

export function PublicProductDetailsContent({ id }: { id: string }) {
  const productQuery = usePublicEquipmentQuery(id);
  const shouldReduceMotion = useReducedMotion() ?? false;

  if (productQuery.isPending) {
    return <ProductDetailsSkeleton />;
  }

  if (productQuery.isError) {
    return (
      <ProductUnavailableState
        message={
          productQuery.error instanceof ApiError &&
          productQuery.error.status === 404
            ? 'This equipment listing does not exist or is not publicly available right now.'
            : "We couldn't load this equipment listing right now. Please try again in a moment."
        }
      />
    );
  }

  const product = productQuery.data;
  const gallery = product.images.map((image, index) => ({
    src: image.url,
    alt: `${product.title} image ${index + 1}`
  }));
  const description = getDescriptionParagraphs({
    ownerDescription: product.description,
    listingTitle: product.title,
    categoryTitle: product.category.title,
    address: product.normalizedAddress,
    deliveryRadius: product.deliveryRadius
  });
  const specs = buildSpecs(
    product.category.title,
    product.price,
    product.deliveryRadius,
    product.createdAt
  );
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductHeader />

      <motion.main
        className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1]
        }}>
        <motion.nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs text-muted-foreground"
          {...getRevealProps(shouldReduceMotion, 0)}>
          <Link
            prefetch
            href="/"
            className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="transition-colors hover:text-primary">
            {product.category.title}
          </span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{product.title}</span>
        </motion.nav>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <article className="space-y-8 lg:col-span-8">
            <motion.div {...getRevealProps(shouldReduceMotion, 1)}>
              <ProductGallery
                images={gallery}
                title={product.title}
              />
            </motion.div>

            <motion.div
              className="space-y-4"
              {...getRevealProps(shouldReduceMotion, 2)}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-sm bg-[#c1ecd4] px-3 py-1 text-xs font-bold uppercase text-[#002114]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Active
                </span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Listing ID: {product.id}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold text-primary sm:text-5xl">
                {product.title}
              </h1>
            </motion.div>

            <motion.div {...getRevealProps(shouldReduceMotion, 3)}>
              <ProductOwnerSummary
                name={product.owner.fullName}
                avatar={null}
                meta={`Member since ${formatLongDate(product.owner.createdAt)}`}
                responseRate={
                  product.owner.phoneVerified
                    ? 'Phone Verified'
                    : 'Owner Listed'
                }
              />
            </motion.div>

            <motion.section
              className="space-y-4"
              {...getRevealProps(shouldReduceMotion, 4)}>
              <h2 className="text-3xl font-semibold text-primary">
                Description
              </h2>
              <div className="max-w-4xl space-y-4 text-base leading-8 text-muted-foreground">
                {description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.section>

            <motion.div {...getRevealProps(shouldReduceMotion, 5)}>
              <ProductSpecGrid specs={specs} />
            </motion.div>

            <motion.section
              className="space-y-4"
              {...getRevealProps(shouldReduceMotion, 6)}>
              <h2 className="text-3xl font-semibold text-primary">
                Delivery Area
              </h2>
              <ProductDeliveryMap
                deliveryRadiusKm={product.deliveryRadius}
                location={{
                  normalizedAddress: product.normalizedAddress,
                  latitude: product.latitude,
                  longitude: product.longitude
                }}
              />
            </motion.section>

            <motion.div {...getRevealProps(shouldReduceMotion, 7)}>
              <ProductReviewsSection product={product} />
            </motion.div>
          </article>

          <div className="lg:col-span-4">
            <motion.div
              className="lg:sticky lg:top-24"
              {...getRevealProps(shouldReduceMotion, 3)}>
              <ProductRentalCard
                equipmentId={product.id}
                pricePerDay={product.price}
              />
            </motion.div>
          </div>
        </div>
      </motion.main>

      <ProductFooter />
    </div>
  );
}
