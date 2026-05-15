"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  LoaderCircle,
  MapPinned,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useDeleteOwnerEquipmentMutation,
  useOwnerEquipmentQuery,
  useSubmitOwnerEquipmentMutation,
} from "@/hooks/use-equipment";
import type { EquipmentListing } from "@/lib/equipment";
import { ApiError } from "@/lib/http";
import { getDashboardRevealProps } from "./dashboard-motion";

type EquipmentTab = "live" | "pending" | "draft";
const EMPTY_LISTINGS: EquipmentListing[] = [];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTabLabel(tab: EquipmentTab) {
  switch (tab) {
    case "live":
      return "Live";
    case "pending":
      return "Pending";
    case "draft":
      return "Draft";
  }
}

function getStatusPresentation(listing: EquipmentListing) {
  switch (listing.status) {
    case "ACTIVE":
      return {
        label: "Active",
        dotClassName: "bg-[#10b981]",
        textClassName: "text-[#0f7a52]",
      };
    case "PENDING_VERIFICATION":
      return {
        label: "Pending Review",
        dotClassName: "bg-[#d97706]",
        textClassName: "text-[#9a6700]",
      };
    case "REJECTED":
      return {
        label: "Needs Changes",
        dotClassName: "bg-[#ba1a1a]",
        textClassName: "text-[#9c1f16]",
      };
    case "DRAFT":
      return {
        label: "Draft",
        dotClassName: "bg-[#6b7280]",
        textClassName: "text-[#4b5563]",
      };
  }
}

function filterListings(listings: EquipmentListing[], tab: EquipmentTab) {
  switch (tab) {
    case "live":
      return listings.filter((listing) => listing.status === "ACTIVE");
    case "pending":
      return listings.filter(
        (listing) =>
          listing.status === "PENDING_VERIFICATION" ||
          listing.status === "REJECTED",
      );
    case "draft":
      return listings.filter((listing) => listing.status === "DRAFT");
  }
}

function getLocationLabel(address: string) {
  const segments = address
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[segments.length - 2]}, ${segments[segments.length - 1]}`;
  }

  return address;
}

function EmptyState({ tab }: { tab: EquipmentTab }) {
  const copy =
    tab === "live"
      ? {
          title: "No live listings yet",
          description:
            "Listings you publish after approval will appear here for quick management.",
        }
      : tab === "pending"
        ? {
            title: "No pending items right now",
            description:
              "Draft submissions and listings waiting on admin review will show up here.",
          }
        : {
            title: "No drafts saved yet",
            description:
              "Save a listing as draft from the editor and come back to finish it later.",
          };

  return (
    <div className='rounded-lg border border-dashed border-[#c1c8c2] bg-white px-8 py-16 text-center'>
      <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#f3f4f1] text-primary'>
        <Clock3 className='h-6 w-6' />
      </div>
      <h3 className='mt-5 text-2xl font-semibold tracking-[-0.03em] text-primary'>
        {copy.title}
      </h3>
      <p className='mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5c5f60]'>
        {copy.description}
      </p>
      <Link
        href='/dashboard/add-listing'
        className='mt-6 inline-flex items-center gap-2 rounded-[4px] bg-[#1b4332] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d]'
      >
        Add New Listing
        <ChevronRight className='h-4 w-4' />
      </Link>
    </div>
  );
}

function EquipmentSkeleton() {
  return (
    <section className='space-y-8 animate-pulse'>
      <div className='flex items-end justify-between gap-4'>
        <div className='space-y-3'>
          <div className='h-12 w-80 rounded bg-muted' />
          <div className='h-6 w-[540px] rounded bg-muted' />
        </div>
        <div className='h-14 w-56 rounded bg-muted' />
      </div>

      <div className='flex gap-8 border-b border-[#c1c8c2] pb-4'>
        {[0, 1, 2].map((tab) => (
          <div key={tab} className='h-8 w-24 rounded bg-muted' />
        ))}
      </div>

      <div className='space-y-5'>
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className='rounded-lg border border-border bg-white p-5'
          >
            <div className='flex gap-6'>
              <div className='h-24 w-24 rounded-lg bg-muted' />
              <div className='flex-1 space-y-3'>
                <div className='h-10 w-72 rounded bg-muted' />
                <div className='h-5 w-36 rounded bg-muted' />
              </div>
              <div className='h-16 w-40 rounded bg-muted' />
              <div className='h-20 w-40 rounded bg-muted' />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EquipmentErrorState({ message }: { message: string }) {
  return (
    <section className='space-y-8'>
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
          Owner Workspace
        </p>
        <h1 className='text-4xl font-extrabold tracking-[-0.04em] text-primary'>
          My Machinery
        </h1>
        <p className='max-w-3xl text-sm leading-7 text-muted-foreground'>
          Manage your active listings, pending approvals, and draft equipment.
        </p>
      </div>

      <div className='rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm'>
        <div className='flex items-center gap-3 text-[#7a120c]'>
          <AlertTriangle className='h-5 w-5' />
          <h2 className='text-xl font-semibold tracking-[-0.03em]'>
            We couldn&apos;t load your equipment
          </h2>
        </div>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]'>
          {message}
        </p>
      </div>
    </section>
  );
}

export function OwnerEquipmentContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const equipmentQuery = useOwnerEquipmentQuery();
  const submitMutation = useSubmitOwnerEquipmentMutation();
  const deleteMutation = useDeleteOwnerEquipmentMutation();
  const [activeTab, setActiveTab] = useState<EquipmentTab>("live");
  const [actionError, setActionError] = useState<string | null>(null);

  const listings = equipmentQuery.data ?? EMPTY_LISTINGS;
  const counts = useMemo(
    () => ({
      live: filterListings(listings, "live").length,
      pending: filterListings(listings, "pending").length,
      draft: filterListings(listings, "draft").length,
    }),
    [listings],
  );
  const filteredListings = useMemo(
    () => filterListings(listings, activeTab),
    [activeTab, listings],
  );

  if (equipmentQuery.isPending) {
    return <EquipmentSkeleton />;
  }

  if (equipmentQuery.isError) {
    return (
      <EquipmentErrorState
        message={
          equipmentQuery.error instanceof ApiError
            ? equipmentQuery.error.message
            : "Try refreshing this page in a moment."
        }
      />
    );
  }

  async function handleDelete(listingId: string) {
    if (!window.confirm("Delete this listing permanently?")) {
      return;
    }

    setActionError(null);

    try {
      await deleteMutation.mutateAsync(listingId);
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to delete the listing.",
      );
    }
  }

  async function handleSubmit(listing: EquipmentListing) {
    setActionError(null);

    try {
      await submitMutation.mutateAsync({
        id: listing.id,
        input: {
          title: listing.title,
          categoryId: listing.category.id,
          price: listing.price,
          deliveryRadius: listing.deliveryRadius,
          address: listing.address,
          images: [],
          retainedImageIds: listing.images.map((image) => image.id),
        },
      });
      setActiveTab("pending");
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to submit the listing for verification.",
      );
    }
  }

  return (
    <section className='space-y-8'>
      <div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
        <div className='space-y-2'>
          <h1 className='text-4xl font-extrabold tracking-[-0.04em] text-primary md:text-5xl'>
            My Machinery
          </h1>
          <p className='max-w-3xl text-base leading-8 text-[#5c5f60]'>
            Manage your active listings, pending approvals, and draft equipment.
          </p>
        </div>

        <Link
          href='/dashboard/add-listing'
          className='inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#1b4332] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#274e3d]'
        >
          <Plus className='h-5 w-5' />
          Add New Listing
        </Link>
      </div>

      <div className='border-b border-[#c1c8c2]'>
        <div className='flex flex-wrap gap-3 sm:gap-8'>
          {(["live", "pending", "draft"] as EquipmentTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = counts[tab];

            return (
              <button
                key={tab}
                type='button'
                onClick={() => setActiveTab(tab)}
                className={[
                  "inline-flex items-center gap-3 border-b-2 px-3 py-4 text-lg transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-[#5c5f60] hover:text-primary",
                ].join(" ")}
              >
                <span>{getTabLabel(tab)}</span>
                <span
                  className={[
                    "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                    isActive
                      ? "bg-[#1b4332] text-white"
                      : "bg-[#e8e8e5] text-[#414844]",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {actionError ? (
        <div className='rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-5 text-sm font-medium text-[#7a120c] shadow-sm'>
          {actionError}
        </div>
      ) : null}

      {filteredListings.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className='space-y-5'>
          {filteredListings.map((listing, index) => {
            const status = getStatusPresentation(listing);
            const isSubmitting =
              submitMutation.isPending &&
              submitMutation.variables?.id === listing.id;
            const isDeleting =
              deleteMutation.isPending &&
              deleteMutation.variables === listing.id;

            return (
              <motion.article
                key={listing.id}
                {...getDashboardRevealProps(shouldReduceMotion, index)}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -4, transition: { duration: 0.18 } }
                }
                className='rounded-lg border border-[#c1c8c2] bg-white p-5 transition-shadow hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)]'
              >
                <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
                  <div className='flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center'>
                    <div className='relative h-24 w-24 overflow-hidden rounded-lg bg-[#f3f4f1]'>
                      {listing.images[0] ? (
                        <Image
                          src={listing.images[0].url}
                          alt={listing.title}
                          fill
                          className='object-cover'
                          unoptimized
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-[#717973]'>
                          <MapPinned className='h-5 w-5' />
                        </div>
                      )}
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <h2 className='text-2xl font-bold tracking-[-0.04em] text-primary'>
                          {listing.title}
                        </h2>
                        <span className='rounded-full bg-[#e8e8e5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5c5f60]'>
                          {listing.category.title}
                        </span>
                      </div>
                      <div className='mt-3 flex items-center gap-2 text-[#5c5f60]'>
                        <MapPinned className='h-4 w-4' />
                        <span>
                          {getLocationLabel(listing.normalizedAddress)}
                        </span>
                      </div>
                      {listing.status === "REJECTED" &&
                      listing.rejectionReason ? (
                        <p className='mt-3 max-w-2xl text-sm leading-6 text-[#9c1f16]'>
                          Rejection reason: {listing.rejectionReason}
                        </p>
                      ) : null}
                    </div>

                    <div className='shrink-0 border-[#c1c8c2] xl:border-r xl:px-8'>
                      <div className='mb-2 flex items-center gap-2 xl:justify-end'>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${status.dotClassName}`}
                        />
                        <span
                          className={`text-base font-medium ${status.textClassName}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className='text-2xl font-bold tracking-[-0.04em] text-primary xl:text-right'>
                        {formatPrice(listing.price)}
                        <span className='ml-2 text-base font-normal text-[#5c5f60]'>
                          / day
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className='flex min-w-[180px] flex-col items-stretch gap-3'>
                    <Link
                      href={`/dashboard/add-listing?listingId=${listing.id}`}
                      className='inline-flex items-center justify-center rounded-[4px] border border-[#c1c8c2] px-6 py-3 text-base font-semibold text-primary transition-colors hover:bg-[#f3f4f1]'
                    >
                      Edit
                    </Link>

                    {listing.status === "DRAFT" ||
                    listing.status === "REJECTED" ? (
                      <button
                        type='button'
                        onClick={() => handleSubmit(listing)}
                        disabled={isSubmitting || isDeleting}
                        className='inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className='h-4 w-4 animate-spin' />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className='h-4 w-4' />
                            Submit for Review
                          </>
                        )}
                      </button>
                    ) : null}

                    <button
                      type='button'
                      onClick={() => handleDelete(listing.id)}
                      disabled={isSubmitting || isDeleting}
                      className='inline-flex items-center justify-center gap-2 text-sm font-medium text-[#5c5f60] transition-colors hover:text-[#ba1a1a] disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {isDeleting ? (
                        <>
                          <LoaderCircle className='h-4 w-4 animate-spin' />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className='h-4 w-4' />
                          Delete Listing
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <div className='flex flex-col gap-3 border-t border-[#c1c8c2] pt-8 text-[#5c5f60] sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-sm'>
          Showing {filteredListings.length} of {counts[activeTab]}{" "}
          {getTabLabel(activeTab).toLowerCase()} listing
          {counts[activeTab] === 1 ? "" : "s"}
        </span>
        <span className='text-sm font-medium'>Page 1 of 1</span>
      </div>
    </section>
  );
}
