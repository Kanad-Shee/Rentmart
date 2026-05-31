'use client';

import { PublicEquipmentSearch } from './public-equipment-search';
import { Search } from 'lucide-react';

type MarketplaceSearchSurfaceProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
};

export function MarketplaceSearchSurface({
  eyebrow = 'Marketplace Search',
  title,
  description,
  className = ''
}: MarketplaceSearchSurfaceProps) {
  return (
    <section
      className={[
        'rounded-2xl border border-border bg-linear-to-br from-white via-[#fbfcfa] to-[#f3f6f2] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.05)] sm:p-5',
        className
      ].join(' ')}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#86af99]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-primary sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <Search className="h-3.5 w-3.5" />
          Active Listings Only
        </div>
      </div>

      <div className="mt-4">
        <PublicEquipmentSearch
          variant="expanded"
          showSubmitButton={false}
        />
      </div>
    </section>
  );
}
