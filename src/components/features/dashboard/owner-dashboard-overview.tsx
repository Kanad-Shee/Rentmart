"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarCheck2,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  Wrench,
} from "lucide-react";
import { useOwnerBookingsQuery } from "@/hooks/use-bookings";
import { useOwnerEquipmentQuery } from "@/hooks/use-equipment";
import { ApiError } from "@/lib/http";
import type { EquipmentListing, EquipmentStatus } from "@/lib/equipment";
import type { BookingSummary } from "@/lib/booking";
import { getDashboardRevealProps } from "./dashboard-motion";

type OverviewMetric = {
  label: string;
  value: number;
  helper: string;
};

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
        {eyebrow}
      </p>
      <h1 className='mt-3 text-4xl font-extrabold tracking-[-0.04em] text-primary'>
        {title}
      </h1>
      <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground'>
        {description}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className='rounded-xl border border-border bg-emerald-700/5 h-full p-6 shadow-sm'>
      <p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
        {label}
      </p>
      <p className='mt-3 text-3xl font-bold tracking-[-0.04em] text-primary'>
        {value}
      </p>
      <p className='mt-2 text-sm text-muted-foreground'>{helper}</p>
    </article>
  );
}

function OwnerOverviewSkeleton() {
  return (
    <section className='space-y-8 animate-pulse'>
      <div>
        <div className='h-3 w-28 rounded bg-muted' />
        <div className='mt-3 h-10 w-72 rounded bg-muted' />
        <div className='mt-3 h-5 max-w-3xl rounded bg-muted' />
      </div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        {[0, 1, 2, 3].map((item) => (
          <article
            key={item}
            className='rounded-xl border border-border bg-background p-6 shadow-sm'
          >
            <div className='h-3 w-24 rounded bg-muted' />
            <div className='mt-3 h-9 w-16 rounded bg-muted' />
            <div className='mt-3 h-4 w-full rounded bg-muted' />
          </article>
        ))}
      </div>

      <div className='grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
          <div className='flex items-center justify-between gap-4 border-b border-border pb-5'>
            <div className='w-full'>
              <div className='h-7 w-56 rounded bg-muted' />
              <div className='mt-3 h-4 w-72 rounded bg-muted' />
            </div>
            <div className='h-5 w-5 rounded bg-muted' />
          </div>

          <div className='mt-6 space-y-4'>
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className='rounded-lg border border-border bg-muted/20 p-4'
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className='w-full'>
                    <div className='h-5 w-48 rounded bg-muted' />
                    <div className='mt-2 h-4 w-40 rounded bg-muted' />
                  </div>
                  <div className='h-7 w-28 rounded-full bg-muted' />
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className='space-y-5'>
          <div className='rounded-xl border border-primary bg-primary px-6 py-6 shadow-sm'>
            <div className='h-3 w-24 rounded bg-primary-foreground/25' />
            <div className='mt-3 h-8 w-40 rounded bg-primary-foreground/25' />
            <div className='mt-3 h-4 w-full rounded bg-primary-foreground/25' />
          </div>

          <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
            <div className='h-3 w-20 rounded bg-muted' />
            <div className='mt-5 space-y-3'>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className='rounded-lg border border-border bg-muted/20 px-4 py-3'
                >
                  <div className='h-4 w-32 rounded bg-muted' />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function getStatusPresentation(status: EquipmentStatus) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        className: "bg-[#e1e2e4] text-[#191c1e]",
      };
    case "ACTIVE":
      return {
        label: "Live",
        className: "bg-[#c1ecd4] text-[#002114]",
      };
    case "PENDING_VERIFICATION":
      return {
        label: "Pending review",
        className: "bg-[#fff1c2] text-[#5b4300]",
      };
    case "REJECTED":
      return {
        label: "Needs attention",
        className: "bg-[#ffd9d4] text-[#7a120c]",
      };
  }
}

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "Updated recently";
  }

  const diffMs = timestamp - Date.now();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const absoluteDiff = Math.abs(diffMs);

  if (absoluteDiff < hourMs) {
    return rtf.format(Math.round(diffMs / minuteMs), "minute");
  }

  if (absoluteDiff < dayMs) {
    return rtf.format(Math.round(diffMs / hourMs), "hour");
  }

  return rtf.format(Math.round(diffMs / dayMs), "day");
}

function buildMetrics(listings: EquipmentListing[]): OverviewMetric[] {
  const activeCount = listings.filter(
    (listing) => listing.status === "ACTIVE",
  ).length;
  const pendingCount = listings.filter(
    (listing) => listing.status === "PENDING_VERIFICATION",
  ).length;
  const rejectedCount = listings.filter(
    (listing) => listing.status === "REJECTED",
  ).length;
  const draftCount = listings.filter(
    (listing) => listing.status === "DRAFT",
  ).length;

  return [
    {
      label: "Active Listings",
      value: activeCount,
      helper:
        activeCount > 0
          ? `${activeCount} listing${activeCount === 1 ? "" : "s"} currently visible to renters.`
          : "No live listings yet.",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      helper:
        pendingCount > 0
          ? `${pendingCount} listing${pendingCount === 1 ? "" : "s"} waiting for admin verification.`
          : "No listings are waiting for review.",
    },
    {
      label: "Needs Attention",
      value: rejectedCount,
      helper:
        rejectedCount > 0
          ? `${rejectedCount} listing${rejectedCount === 1 ? "" : "s"} require updates before going live.`
          : "No listings currently need changes.",
    },
    {
      label: "Draft Listings",
      value: draftCount,
      helper:
        draftCount > 0
          ? `${draftCount} draft${draftCount === 1 ? "" : "s"} saved for later edits and review submission.`
          : "No saved drafts right now.",
    },
  ];
}

function buildBookingMetrics(bookings: BookingSummary[]) {
  return {
    pendingApprovals: bookings.filter(
      (booking) => booking.status === "PENDING_OWNER_APPROVAL",
    ).length,
    awaitingPayment: bookings.filter(
      (booking) => booking.status === "PENDING_RENTER_PAYMENT",
    ).length,
    activeRentals: bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS",
    ).length,
    history: bookings.filter(
      (booking) =>
        booking.status === "COMPLETED" || booking.status === "DISPUTED",
    ).length,
  };
}

function OwnerOverviewContent({
  listings,
  bookings,
}: {
  listings: EquipmentListing[];
  bookings: BookingSummary[];
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const metrics = buildMetrics(listings);
  const bookingMetrics = buildBookingMetrics(bookings);
  const recentListings = [...listings].sort((left, right) => {
    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });

  return (
    <section className='space-y-8'>
      <motion.div {...getDashboardRevealProps(shouldReduceMotion, 0)}>
        <SectionTitle
          eyebrow='Owner Workspace'
          title='Fleet Overview'
          description='Track your listings, verification pipeline, and equipment that needs updates from one dashboard.'
        />
      </motion.div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            {...getDashboardRevealProps(shouldReduceMotion, index + 1)}
          >
            <StatCard
              label={metric.label}
              value={metric.value.toString()}
              helper={metric.helper}
            />
          </motion.div>
        ))}
      </div>

      <div className='grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <motion.section
          {...getDashboardRevealProps(shouldReduceMotion, 2)}
          className='rounded-xl border border-border bg-emerald-950/2 p-6 shadow-sm'
        >
          <div className='flex items-center justify-between gap-4 border-b border-border pb-5'>
            <div>
              <h2 className='text-2xl font-semibold tracking-[-0.03em] text-foreground'>
                Recent Listing Activity
              </h2>
              <p className='mt-2 text-sm text-muted-foreground'>
                Real-time listing status and latest equipment changes from your
                fleet.
              </p>
            </div>
            <BarChart3 className='h-5 w-5 text-primary' />
          </div>

          {recentListings.length > 0 ? (
            <div className='mt-6 space-y-4'>
              {recentListings.slice(0, 5).map((listing, index) => {
                const status = getStatusPresentation(listing.status);
                const timestampSource =
                  listing.updatedAt !== listing.createdAt
                    ? `Updated ${formatRelativeDate(listing.updatedAt)}`
                    : `Created ${formatRelativeDate(listing.createdAt)}`;

                return (
                  <motion.div
                    key={listing.id}
                    {...getDashboardRevealProps(shouldReduceMotion, index)}
                    className='flex items-center justify-between gap-4 rounded-lg border border-border bg-emerald-200/10 p-4'
                  >
                    <div>
                      <p className='font-semibold text-foreground'>
                        {listing.title}
                      </p>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {timestampSource}
                      </p>
                    </div>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                        status.className,
                      ].join(" ")}
                    >
                      {status.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className='mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <AlertTriangle className='h-5 w-5' />
              </div>
              <h3 className='mt-4 text-xl font-semibold tracking-[-0.03em] text-foreground'>
                No listing activity yet
              </h3>
              <p className='mt-3 text-sm leading-7 text-muted-foreground'>
                Your overview will populate automatically once you create
                equipment listings and they move through review.
              </p>
              <Link
                href='/dashboard/add-listing'
                className='mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]'
              >
                Create your first listing
                <ChevronRight className='h-4 w-4' />
              </Link>
            </div>
          )}
        </motion.section>

        <motion.aside
          {...getDashboardRevealProps(shouldReduceMotion, 3)}
          className='space-y-5'
        >
          <motion.div {...getDashboardRevealProps(shouldReduceMotion, 0)}>
            <Link
              href='/dashboard/rental-requests'
              className='block rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-6 py-6 text-foreground shadow-sm transition-colors hover:bg-[#eef5ef]'
            >
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
                    Rental Demand
                  </p>
                  <h2 className='mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary'>
                    {bookingMetrics.pendingApprovals} Pending Approval
                    {bookingMetrics.pendingApprovals === 1 ? "" : "s"}
                  </h2>
                </div>
                <CalendarCheck2 className='h-5 w-5 text-primary' />
              </div>
              <div className='mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground'>
                <div className='rounded-lg bg-background px-4 py-3'>
                  Awaiting payment: {bookingMetrics.awaitingPayment}
                </div>
                <div className='rounded-lg bg-background px-4 py-3'>
                  Active: {bookingMetrics.activeRentals}
                </div>
                <div className='rounded-lg bg-background px-4 py-3'>
                  Resolved: {bookingMetrics.history}
                </div>
                <div className='rounded-lg bg-background px-4 py-3'>
                  Total requests: {bookings.length}
                </div>
              </div>
              <p className='mt-4 text-sm text-muted-foreground'>
                Review renter requests, track payment windows, and manage the
                full booking lifecycle.
              </p>
            </Link>
          </motion.div>

          <motion.div {...getDashboardRevealProps(shouldReduceMotion, 1)}>
            <Link
              href='/dashboard/add-listing'
              className='block rounded-xl border border-primary bg-primary px-6 py-6 text-primary-foreground shadow-sm transition-colors hover:bg-[#274e3d]'
            >
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/80'>
                    Quick Action
                  </p>
                  <h2 className='mt-2 text-2xl font-semibold tracking-[-0.03em]'>
                    Add New Listing
                  </h2>
                </div>
                <FilePlus2 className='h-5 w-5' />
              </div>
              <p className='mt-3 text-sm text-primary-foreground/85'>
                Create a new equipment listing and send it for verification.
              </p>
            </Link>
          </motion.div>

          <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
              Shortcuts
            </h3>
            <div className='mt-5 space-y-3'>
              {[
                {
                  href: "/dashboard/equipment",
                  label: "My Equipment",
                  icon: Wrench,
                },
                {
                  href: "/dashboard/rental-requests",
                  label: "Rental Requests",
                  icon: CalendarCheck2,
                },
                {
                  href: "/dashboard/notifications",
                  label: "Notifications",
                  icon: Bell,
                },
                {
                  href: "/dashboard/settings",
                  label: "Settings",
                  icon: ClipboardList,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    {...getDashboardRevealProps(shouldReduceMotion, index)}
                  >
                    <Link
                      href={item.href}
                      className='flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'
                    >
                      <span className='flex items-center gap-3'>
                        <Icon className='h-4 w-4 text-primary' />
                        {item.label}
                      </span>
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function OwnerOverviewErrorState({ error }: { error: unknown }) {
  const isPhoneVerificationError =
    error instanceof ApiError &&
    error.status === 403 &&
    error.message === "Please verify your phone number first.";

  return (
    <section className='space-y-8'>
      <SectionTitle
        eyebrow='Owner Workspace'
        title='Fleet Overview'
        description='Track your listings, verification pipeline, and equipment that needs updates from one dashboard.'
      />

      <div className='rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm'>
        <div className='flex items-center gap-3 text-[#7a120c]'>
          <AlertTriangle className='h-5 w-5' />
          <h2 className='text-xl font-semibold tracking-[-0.03em]'>
            {isPhoneVerificationError
              ? "Verify your phone number to unlock owner overview"
              : "We couldn&apos;t load your equipment overview"}
          </h2>
        </div>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]'>
          {isPhoneVerificationError
            ? "Owner equipment data is currently protected until your phone number is verified. Once verification is complete, your listing and review counts will appear here automatically."
            : "Try refreshing this page in a moment. Your listings and review counts will appear here once the connection is restored."}
        </p>
        {isPhoneVerificationError ? (
          <Link
            href='/dashboard/settings'
            className='mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#274e3d]'
          >
            Verify phone in settings
            <ChevronRight className='h-4 w-4' />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function OwnerDashboardOverview() {
  const equipmentQuery = useOwnerEquipmentQuery();
  const ownerBookingsQuery = useOwnerBookingsQuery();

  if (equipmentQuery.isPending || ownerBookingsQuery.isPending) {
    return <OwnerOverviewSkeleton />;
  }

  if (equipmentQuery.isError || ownerBookingsQuery.isError) {
    return <OwnerOverviewErrorState error={equipmentQuery.error} />;
  }

  return (
    <OwnerOverviewContent
      listings={equipmentQuery.data}
      bookings={ownerBookingsQuery.data}
    />
  );
}
