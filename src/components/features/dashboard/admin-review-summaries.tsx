'use client';

import { DashboardPaginationControls } from './dashboard-pagination-controls';
import { Button } from '@/components/ui/button';
import {
  useAdminEquipmentReviewSummariesPageQuery,
  useGenerateEquipmentReviewSummaryMutation,
  useUpdateEquipmentReviewSummaryVisibilityMutation
} from '@/hooks/use-equipment';
import type { AdminEquipmentReviewSummaryItem } from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star
} from 'lucide-react';
import Image from 'next/image';
import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

function formatRelativeDate(value: string | null) {
  if (!value) {
    return 'Not generated yet';
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Unknown time';
  }

  const diffMs = timestamp - Date.now();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const absoluteDiff = Math.abs(diffMs);

  if (absoluteDiff < hourMs) {
    return rtf.format(Math.round(diffMs / minuteMs), 'minute');
  }

  if (absoluteDiff < dayMs) {
    return rtf.format(Math.round(diffMs / hourMs), 'hour');
  }

  return rtf.format(Math.round(diffMs / dayMs), 'day');
}

function formatLongDate(value: string | null) {
  if (!value) {
    return 'Not generated yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getPrimaryImage(listing: AdminEquipmentReviewSummaryItem) {
  return listing.images[0]?.url ?? listing.category.imageUrl;
}

function ReviewSummarySkeleton() {
  return (
    <section className="animate-pulse">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-6">
            <div className="h-10 rounded bg-muted" />
          </div>
          <div className="space-y-0">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="border-b border-border p-4">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="mt-3 h-4 w-28 rounded bg-muted" />
                <div className="mt-3 h-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-8">
          <div className="h-8 w-56 rounded bg-muted" />
          <div className="mt-6 h-36 rounded bg-muted" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewSummaryErrorState({ message }: { message: string }) {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          Review Summaries
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Generate compact AI summaries for public product review sections.
        </p>
      </div>
      <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
        <div className="flex items-center gap-3 text-[#7a120c]">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            We couldn&apos;t load review summary listings
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
          {message}
        </p>
      </div>
    </section>
  );
}

export function AdminReviewSummaries() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const summariesQuery = useAdminEquipmentReviewSummariesPageQuery({
    page,
    pageSize: 10,
    search: deferredSearchTerm
  });
  const generateSummaryMutation = useGenerateEquipmentReviewSummaryMutation();
  const updateVisibilityMutation =
    useUpdateEquipmentReviewSummaryVisibilityMutation();
  const listings = useMemo(
    () => summariesQuery.data?.items ?? [],
    [summariesQuery.data]
  );
  const resolvedSelectedId =
    selectedId && listings.some((listing) => listing.id === selectedId)
      ? selectedId
      : (listings[0]?.id ?? null);
  const selectedListing =
    listings.find((listing) => listing.id === resolvedSelectedId) ?? null;

  async function handleGenerateSummary(
    listing: AdminEquipmentReviewSummaryItem
  ) {
    try {
      const result = await generateSummaryMutation.mutateAsync(listing.id);
      toast.success('Review summary generated.', {
        description: `Based on ${result.reviewCount} review${result.reviewCount === 1 ? '' : 's'}.`
      });
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to generate the review summary right now.'
      );
    }
  }

  async function handleToggleVisibility(
    listing: AdminEquipmentReviewSummaryItem,
    visible: boolean
  ) {
    try {
      await updateVisibilityMutation.mutateAsync({
        id: listing.id,
        visible
      });
      toast.success(
        visible
          ? 'Summary is now visible on the details page.'
          : 'Summary is now hidden from the details page.'
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to update summary visibility right now.'
      );
    }
  }

  if (summariesQuery.isPending) {
    return <ReviewSummarySkeleton />;
  }

  if (summariesQuery.isError) {
    return (
      <ReviewSummaryErrorState
        message={
          summariesQuery.error instanceof ApiError
            ? summariesQuery.error.message
            : 'Try refreshing this page in a moment.'
        }
      />
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          Review Summaries
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Generate short public summaries from review text only. Ratings and
          review counts continue to come from application data.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-background shadow-sm">
          <div className="border-b border-border p-6">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setPage(1);
                  setSearchTerm(event.target.value);
                }}
                placeholder="Search active listings..."
                className="h-11 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
          </div>

          <div className="max-h-180 overflow-y-auto">
            {listings.length > 0 ? (
              listings.map((listing) => {
                const isSelected = listing.id === resolvedSelectedId;
                const hasSummary = Boolean(listing.reviewSummary);
                const isVisible = listing.reviewSummaryVisible;

                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedId(listing.id)}
                    className={[
                      'w-full border-b border-border px-5 py-4 text-left transition-colors hover:bg-[#f8faf7]',
                      isSelected ? 'bg-[#edf6f0]' : 'bg-transparent'
                    ].join(' ')}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-semibold text-primary">
                        {listing.title}
                      </p>
                      <span
                        className={[
                          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
                          !hasSummary
                            ? 'bg-[#f0efe9] text-[#5c5f60]'
                            : isVisible
                              ? 'bg-[#c1ecd4] text-[#002114]'
                              : 'bg-[#fff1c2] text-[#5b4300]'
                        ].join(' ')}>
                        {!hasSummary
                          ? 'Pending'
                          : isVisible
                            ? 'Visible'
                            : 'Hidden'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#5c5f60]">
                      {listing.category.title} by {listing.owner.fullName}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5c5f60]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#ffb800] text-[#ffb800]" />
                        {listing.averageRating?.toFixed(1) ?? '0.0'}
                      </span>
                      <span>
                        {listing.reviewCount} review
                        {listing.reviewCount === 1 ? '' : 's'}
                      </span>
                      <span>
                        {formatRelativeDate(
                          listing.reviewSummary?.generatedAt ?? null
                        )}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-sm text-[#5c5f60]">
                No active listings matched this search.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          {selectedListing ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                      src={getPrimaryImage(selectedListing)}
                      alt={selectedListing.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c5f60]">
                      {selectedListing.category.title}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary">
                      {selectedListing.title}
                    </h2>
                    <p className="mt-2 text-sm text-[#5c5f60]">
                      {selectedListing.owner.fullName} •{' '}
                      {formatCurrency(selectedListing.price)}/day
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => handleGenerateSummary(selectedListing)}
                  disabled={
                    generateSummaryMutation.isPending ||
                    selectedListing.reviewCount === 0
                  }
                  className="rounded-lg text-sm font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {generateSummaryMutation.isPending &&
                  generateSummaryMutation.variables === selectedListing.id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : selectedListing.reviewSummary ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {selectedListing.reviewSummary
                    ? 'Refresh Summary'
                    : 'Generate Summary'}
                </Button>
              </div>

              <div className="rounded-2xl border border-[#d8dfdb] bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c5f60]">
                      Public visibility
                    </p>
                    <p className="mt-1 text-sm text-[#5c5f60]">
                      {selectedListing.reviewSummary
                        ? selectedListing.reviewSummaryVisible
                          ? 'Summary is currently shown on the details page.'
                          : 'Summary is stored but hidden from the details page.'
                        : 'Generate a summary first to control its public visibility.'}
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 self-start sm:self-auto">
                    <span
                      className={[
                        'text-sm font-medium',
                        selectedListing.reviewSummaryVisible
                          ? 'text-primary'
                          : 'text-[#5c5f60]'
                      ].join(' ')}>
                      {selectedListing.reviewSummaryVisible ? 'On' : 'Off'}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedListing.reviewSummaryVisible}
                      disabled={
                        !selectedListing.reviewSummary ||
                        updateVisibilityMutation.isPending
                      }
                      onChange={(event) =>
                        void handleToggleVisibility(
                          selectedListing,
                          event.target.checked
                        )
                      }
                      className="h-5 w-5 rounded border border-border text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c5f60]">
                    Average rating
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-primary">
                    {selectedListing.averageRating?.toFixed(1) ?? '0.0'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c5f60]">
                    Review count
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-primary">
                    {selectedListing.reviewCount}
                  </p>
                </div>
                <div className="rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5c5f60]">
                    Summary snapshot
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-primary">
                    {selectedListing.reviewSummary?.reviewCount ?? 0}
                  </p>
                </div>
              </div>

              {selectedListing.reviewCount === 0 ? (
                <div className="rounded-xl border border-[#fff1c2] bg-[#fffaf0] p-5 text-sm leading-7 text-[#5b4300]">
                  This active listing does not have any reviews yet, so a public
                  summary cannot be generated.
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#d8dfdb] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c5f60]">
                      Current public summary
                    </p>
                    <p className="mt-1 text-xs text-[#717973]">
                      Generated{' '}
                      {formatLongDate(
                        selectedListing.reviewSummary?.generatedAt ?? null
                      )}
                    </p>
                  </div>
                  {selectedListing.reviewSummary ? (
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
                        selectedListing.reviewSummaryVisible
                          ? 'bg-[#c1ecd4] text-[#002114]'
                          : 'bg-[#fff1c2] text-[#5b4300]'
                      ].join(' ')}>
                      {selectedListing.reviewSummaryVisible
                        ? 'Live on details page'
                        : 'Hidden from details page'}
                    </span>
                  ) : null}
                </div>

                {selectedListing.reviewSummary ? (
                  <p className="mt-4 text-sm leading-7 text-[#414844]">
                    {selectedListing.reviewSummary.text}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[#5c5f60]">
                    No summary has been generated for this listing yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-105 items-center justify-center rounded-2xl border border-dashed border-border text-center text-sm text-[#5c5f60]">
              Select an active listing to manage its public review summary.
            </div>
          )}
        </div>
      </div>

      {summariesQuery.data ? (
        <DashboardPaginationControls
          page={summariesQuery.data.page}
          totalPages={summariesQuery.data.totalPages}
          totalItems={summariesQuery.data.totalItems}
          pageSize={summariesQuery.data.pageSize}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}
