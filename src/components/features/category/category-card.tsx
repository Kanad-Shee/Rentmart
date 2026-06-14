'use client';

import type { CategoryProduct } from './category-data';
import { useToggleWishlistMutation } from '@/hooks/use-wishlist';
import { ApiError } from '@/lib/http';
import { Heart, MapPin, ShieldCheckIcon, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';

type CategoryCardProps = {
  product: CategoryProduct;
  userRole?: string;
};

export function CategoryCard({ product, userRole }: CategoryCardProps) {
  const toggleWishlistMutation = useToggleWishlistMutation();
  const canToggleWishlist = userRole === 'RENTER';

  async function handleWishlistToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!canToggleWishlist || toggleWishlistMutation.isPending) {
      return;
    }

    try {
      await toggleWishlistMutation.mutateAsync({
        equipmentId: product.id,
        isWishlisted: Boolean(product.favorite)
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/sign-in';
      }
    }
  }

  return (
    <article
      // className="group min-h-full rounded-md overflow-hidden border border-[#dfe4eb] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
      className="group overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-md shadow-primary/8 ring-1 ring-inset ring-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/15 hover:border-primary/20 hover:-translate-y-2">
      <Link
        prefetch
        href={product.href}
        className="block">
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            loading={'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1280px) 50vw, 25vw"
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white/80 backdrop-blur-3xl p-2 text-[10px] font-bold uppercase text-emerald-600 shadow-md ring-1 ring-inset ring-emerald-600">
            <ShieldCheckIcon className="size-4 shrink-0 fill-current" />
            {/* Verified */}
          </div>
          {canToggleWishlist && (
            <button
              type="button"
              aria-label={
                product.favorite ? 'Remove from wishlist' : 'Add to wishlist'
              }
              onClick={handleWishlistToggle}
              disabled={toggleWishlistMutation.isPending}
              className={[
                'absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#8aa0be] shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                product.favorite ? 'text-primary' : 'group-hover:text-primary'
              ].join(' ')}>
              <Heart
                className={[
                  'h-4 w-4',
                  product.favorite ? 'fill-current' : ''
                ].join(' ')}
              />
            </button>
          )}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-primary shadow-lg">
              Quick View
            </span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-center gap-1 text-xs text-[#f08a2c]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium text-[#34435a]">{product.rating}</span>
            {/* <span className="text-muted-foreground">{product.reviews}</span> */}
          </div>

          <h3 className="text-xl truncate font-semibold tracking-[-0.03em] text-primary">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-[#5d6f8f]">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{product.location}</span>
          </div>

          <div className="flex items-end gap-1 pt-1">
            <p className="text-xl font-bold tracking-[-0.04em] text-primary">
              {product.price}
            </p>
            <span className="pb-1 text-xs font-medium uppercase tracking-[0.18em] text-[#5d6f8f]">
              /day
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
