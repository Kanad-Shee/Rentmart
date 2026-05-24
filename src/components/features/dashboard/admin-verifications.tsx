'use client';

import { DashboardPaginationControls } from './dashboard-pagination-controls';
import { DashboardAddListingMapPreview } from '@/components/features/dashboard/dashboard-add-listing-map-preview';
import {
  useApproveEquipmentMutation,
  usePendingEquipmentPageQuery,
  useRejectEquipmentMutation
} from '@/hooks/use-equipment';
import type { EquipmentListing } from '@/lib/equipment';
import { ApiError } from '@/lib/http';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  LoaderCircle,
  MapPinned,
  MoreVertical,
  Search,
  ShieldCheck,
  UserRound,
  X,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import { useDeferredValue, useMemo, useState } from 'react';
import { toast } from 'sonner';

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Recently';
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

function formatLongDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function buildReferenceId(id: string) {
  return `RM-${id.slice(-6).toUpperCase()}`;
}

function getInitials(fullName: string) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'RM';
}

function getPrimaryImage(listing: EquipmentListing) {
  return listing.images[0]?.url ?? null;
}

function VerificationsSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-6">
            <div className="h-10 w-40 rounded bg-muted" />
            <div className="mt-3 h-5 w-56 rounded bg-muted" />
          </div>
          <div className="space-y-0">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex gap-4 border-b border-border p-4">
                <div className="h-16 w-16 rounded-lg bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="h-5 w-40 rounded bg-muted" />
                  <div className="mt-2 h-4 w-32 rounded bg-muted" />
                  <div className="mt-3 h-6 w-24 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background">
          <div className="border-b border-border p-8">
            <div className="h-7 w-48 rounded bg-muted" />
            <div className="mt-4 h-14 w-3/4 rounded bg-muted" />
          </div>
          <div className="space-y-6 p-8">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="h-80 rounded-xl bg-muted" />
              <div className="grid gap-4">
                <div className="h-48 rounded-xl bg-muted" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 rounded-xl bg-muted" />
                  <div className="h-28 rounded-xl bg-muted" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 rounded-xl border border-border bg-muted/20"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VerificationsErrorState({ message }: { message: string }) {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          Verifications
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Review new listings and equipment data before they go live.
        </p>
      </div>
      <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
        <div className="flex items-center gap-3 text-[#7a120c]">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-xl font-semibold tracking-[-0.03em]">
            We couldn&apos;t load the verification queue
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]">
          {message}
        </p>
      </div>
    </section>
  );
}

function EmptyVerificationsState() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          Verifications
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Review new listings and equipment data before they go live.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-background p-12 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c1ecd4] text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-primary">
          No pending listings right now
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          New equipment submissions will appear here automatically when owners
          send listings for verification.
        </p>
      </div>
    </section>
  );
}

export function AdminVerifications() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const pendingEquipmentQuery = usePendingEquipmentPageQuery({
    page,
    pageSize: 10,
    search: deferredSearchTerm
  });
  const approveMutation = useApproveEquipmentMutation();
  const rejectMutation = useRejectEquipmentMutation();
  const filteredListings = useMemo(
    () => pendingEquipmentQuery.data?.items ?? [],
    [pendingEquipmentQuery.data]
  );

  const resolvedSelectedId =
    selectedId && filteredListings.some((listing) => listing.id === selectedId)
      ? selectedId
      : (filteredListings[0]?.id ?? null);

  const selectedListing =
    filteredListings.find((listing) => listing.id === resolvedSelectedId) ??
    null;

  function handleSelectListing(listingId: string) {
    setSelectedId(listingId);
    setIsRejectMode(false);
    setRejectionReason('');
    setActionError(null);
  }

  if (pendingEquipmentQuery.isPending) {
    return <VerificationsSkeleton />;
  }

  if (pendingEquipmentQuery.isError) {
    return (
      <VerificationsErrorState
        message={
          pendingEquipmentQuery.error instanceof ApiError
            ? pendingEquipmentQuery.error.message
            : 'Try refreshing this page in a moment.'
        }
      />
    );
  }

  const listings = pendingEquipmentQuery.data.items;

  if (listings.length === 0) {
    return <EmptyVerificationsState />;
  }

  async function handleApprove() {
    if (!selectedListing) {
      return;
    }

    setActionError(null);
    setActionNotice(null);

    try {
      await approveMutation.mutateAsync(selectedListing.id);
      setActionNotice(`Approved ${selectedListing.title}.`);
      toast.success(`Approved ${selectedListing.title}.`);
      setSelectedId(null);
      if (filteredListings.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to approve the listing.'
      );
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to approve the listing.'
      );
    }
  }

  async function handleReject() {
    if (!selectedListing) {
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setActionError(
        'Add a short rejection reason so the owner knows what to fix.'
      );
      return;
    }

    setActionError(null);
    setActionNotice(null);

    try {
      await rejectMutation.mutateAsync({
        id: selectedListing.id,
        input: {
          reason: rejectionReason.trim()
        }
      });
      setActionNotice(`Rejected ${selectedListing.title}.`);
      setIsRejectMode(false);
      setRejectionReason('');
      toast.success(`Rejected ${selectedListing.title}.`);
      setSelectedId(null);
      if (filteredListings.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Unable to reject the listing.'
      );
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to reject the listing.'
      );
    }
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
          Admin Workspace
        </p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
          Verifications
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Review new listings, inspect equipment media, and moderate submissions
          before they go live.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="border-b border-border xl:border-b-0 xl:border-r">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-primary">
                    Pending Verifications
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Review new listings and equipment data.
                  </p>
                </div>
                <span className="rounded-md bg-[#c1ecd4] px-3 py-2 text-sm font-bold text-[#002114]">
                  {listings.length}
                </span>
              </div>

              <label className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-[#f3f4f1] px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search verifications..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
            </div>

            {filteredListings.length > 0 ? (
              <div className="max-h-[980px] overflow-y-auto">
                {filteredListings.map((listing) => {
                  const isSelected = listing.id === selectedListing?.id;
                  const imageUrl = getPrimaryImage(listing);

                  return (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => handleSelectListing(listing.id)}
                      className={`flex w-full items-start gap-4 border-b border-border px-5 py-5 text-left transition-colors ${
                        isSelected
                          ? 'bg-[#c1ecd4]/65 shadow-[inset_4px_0_0_0_#1b4332]'
                          : 'bg-background hover:bg-muted/40'
                      }`}>
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {imageUrl ? (
                          <Image
                            loading={'lazy'}
                            src={imageUrl}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <MapPinned className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="truncate text-xl font-semibold tracking-[-0.02em] text-primary">
                            {listing.title}
                          </h3>
                          <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8da0b8]">
                            {formatRelativeDate(listing.createdAt)}
                          </span>
                        </div>
                        <div className="space-y-1 text-base text-[#44505d]">
                          <p className="truncate">
                            Owner: {listing.owner.fullName}
                          </p>
                          {listing.owner.phone ? (
                            <p className="truncate text-sm text-[#5b6976]">
                              Verified phone: {listing.owner.phone}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-3">
                          <span className="inline-flex rounded-sm border border-[#d7dde3] bg-[#f3f4f1] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5b6976]">
                            {listing.category.title}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No listings matched your search.
              </div>
            )}
            {pendingEquipmentQuery.data ? (
              <div className="border-t border-border p-4">
                <DashboardPaginationControls
                  page={pendingEquipmentQuery.data.page}
                  totalPages={pendingEquipmentQuery.data.totalPages}
                  totalItems={pendingEquipmentQuery.data.totalItems}
                  pageSize={pendingEquipmentQuery.data.pageSize}
                  onPageChange={setPage}
                />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 bg-background">
            {selectedListing ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border px-6 py-6 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#f3d48b] bg-[#fff4e5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b45309]">
                          Pending Review
                        </span>
                        <span className="text-sm font-medium text-[#8da0b8]">
                          Ref ID: {buildReferenceId(selectedListing.id)}
                        </span>
                      </div>
                      <h2 className="max-w-4xl text-3xl font-extrabold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
                        {selectedListing.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg border border-border p-3 text-muted-foreground transition-colors hover:bg-muted"
                      aria-label="Listing actions">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 px-6 py-6 sm:px-8">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
                      {selectedListing.images[0] ? (
                        <div className="relative h-[300px] sm:h-[420px]">
                          <Image
                            loading={'lazy'}
                            src={selectedListing.images[0].url}
                            alt={selectedListing.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-[300px] items-center justify-center text-muted-foreground sm:h-[420px]">
                          No image available
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
                        {selectedListing.images[1] ? (
                          <div className="relative h-[180px] sm:h-[248px]">
                            <Image
                              loading={'lazy'}
                              src={selectedListing.images[1].url}
                              alt={`${selectedListing.title} detail view`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground sm:h-[248px]">
                            Additional media pending
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          selectedListing.images[2],
                          selectedListing.images[3]
                        ].map((image, index) => {
                          const hasRemainingImages =
                            index === 1 && selectedListing.images.length > 4;

                          return (
                            <div
                              key={image?.id ?? `image-slot-${index}`}
                              className="relative overflow-hidden rounded-xl border border-border bg-muted">
                              {image ? (
                                <div className="relative h-[120px] sm:h-[156px]">
                                  <Image
                                    loading={'lazy'}
                                    src={image.url}
                                    alt={`${selectedListing.title} gallery ${index + 3}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  {hasRemainingImages ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-lg font-bold text-[#53657a] backdrop-blur-[1px]">
                                      +{selectedListing.images.length - 4} more
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground sm:h-[156px]">
                                  No image
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <article className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d7b7a]">
                        Owner Information
                      </h3>
                      <div className="mt-5 flex items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#c1ecd4] text-primary">
                          <span className="text-lg font-bold">
                            {getInitials(selectedListing.owner.fullName)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-semibold tracking-[-0.02em] text-primary">
                            {selectedListing.owner.fullName}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {selectedListing.owner.phoneVerified ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-[#1f9d55]" />
                                <span>Phone verified</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 text-[#b45309]" />
                                <span>Phone not verified</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Member Since
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {formatLongDate(selectedListing.owner.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Email
                          </p>
                          <p className="mt-1 break-all text-sm font-medium text-foreground">
                            {selectedListing.owner.email}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Registered Address
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-foreground">
                            {selectedListing.owner.address}
                          </p>
                        </div>
                        {selectedListing.owner.phone ? (
                          <div className="sm:col-span-2">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                              Contact Number
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                              {selectedListing.owner.phone}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d7b7a]">
                        Equipment Info
                      </h3>
                      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Category
                          </p>
                          <p className="mt-1 text-base font-semibold text-foreground">
                            {selectedListing.category.title}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Daily Rate
                          </p>
                          <p className="mt-1 text-base font-bold text-primary">
                            {formatPrice(selectedListing.price)} / day
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Submitted
                          </p>
                          <p className="mt-1 text-base font-medium text-foreground">
                            {formatLongDate(selectedListing.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9ba6b2]">
                            Queue Status
                          </p>
                          <p className="mt-1 text-base font-medium text-foreground">
                            Pending verification
                          </p>
                        </div>
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d7b7a]">
                        Logistics & Range
                      </h3>
                      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/20">
                        <div className="relative h-40">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(165,208,185,0.6),_transparent_36%),linear-gradient(135deg,_rgba(27,67,50,0.65),_rgba(249,250,246,0.1))]" />
                          <DashboardAddListingMapPreview
                            location={{
                              normalizedAddress:
                                selectedListing.normalizedAddress,
                              latitude: selectedListing.latitude,
                              longitude: selectedListing.longitude
                            }}
                            deliveryRadiusKm={selectedListing.deliveryRadius}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-muted-foreground">
                            Pickup address
                          </span>
                          <span className="max-w-[60%] text-right font-medium text-foreground">
                            {selectedListing.normalizedAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Delivery radius
                          </span>
                          <span className="font-bold text-primary">
                            {selectedListing.deliveryRadius} km
                          </span>
                        </div>
                      </div>
                    </article>

                    <article className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d7b7a]">
                        Category Guidance
                      </h3>
                      <p className="mt-5 text-sm leading-7 text-foreground">
                        {selectedListing.category.description}
                      </p>
                      {selectedListing.rejectionReason ? (
                        <div className="mt-5 rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9c1f16]">
                            Latest Rejection Reason
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#7a120c]">
                            {selectedListing.rejectionReason}
                          </p>
                        </div>
                      ) : null}
                    </article>
                  </div>

                  {actionError ? (
                    <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-4 text-sm font-medium text-[#7a120c]">
                      {actionError}
                    </div>
                  ) : null}

                  {actionNotice ? (
                    <div className="rounded-xl border border-[#c1ecd4] bg-[#f4fbf7] p-4 text-sm font-medium text-[#0a3925]">
                      {actionNotice}
                    </div>
                  ) : null}

                  {isRejectMode ? (
                    <div className="rounded-2xl border border-[#ffd9d4] bg-[#fffaf9] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#7a120c]">
                            Reject Listing
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-[#7a120c]">
                            Share a clear reason so the owner can fix the
                            submission and resubmit it.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRejectMode(false);
                            setRejectionReason('');
                            setActionError(null);
                          }}
                          className="rounded-md border border-[#ffd9d4] p-2 text-[#7a120c] transition-colors hover:bg-[#fff4f2]"
                          aria-label="Close rejection form">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        rows={4}
                        placeholder="Example: The uploaded images do not clearly show the equipment model and the pickup address needs correction."
                        className="mt-4 w-full rounded-xl border border-[#f1c9c4] bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#b08b87] focus:border-[#c96d63]"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="sticky bottom-0 border-t border-border bg-background/95 px-6 py-4 backdrop-blur sm:px-8">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    {/* <label className="inline-flex items-center gap-3 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={notifyOwner}
                        onChange={(event) =>
                          setNotifyOwner(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      Notify owner via email
                    </label> */}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {isRejectMode ? (
                        <button
                          type="button"
                          onClick={handleReject}
                          disabled={
                            rejectMutation.isPending ||
                            approveMutation.isPending
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#ba1a1a] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#ba1a1a] transition-colors hover:bg-[#fff4f2] disabled:cursor-not-allowed disabled:opacity-60">
                          {rejectMutation.isPending ? (
                            <>
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Confirm Reject
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsRejectMode(true);
                            setActionError(null);
                            setActionNotice(null);
                          }}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#ba1a1a] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#ba1a1a] transition-colors hover:bg-[#fff4f2] disabled:cursor-not-allowed disabled:opacity-60">
                          <XCircle className="h-4 w-4" />
                          Reject Listing
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-60">
                        {approveMutation.isPending ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Approve & Publish
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[480px] items-center justify-center p-8 text-center">
                <div>
                  <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-base font-medium text-foreground">
                    Select a listing to review its details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
