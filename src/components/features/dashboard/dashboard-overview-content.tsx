"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Heart,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useDashboardMetricsQuery } from "@/hooks/use-auth";
import { useMyBookingsQuery } from "@/hooks/use-bookings";
import { useMyNotificationsQuery } from "@/hooks/use-notification";
import { useMyWishlistQuery } from "@/hooks/use-wishlist";
import { getBookingProgress, type BookingSummary } from "@/lib/booking";
import type { DashboardRole } from "./dashboard-config";
import { getDashboardRevealProps } from "./dashboard-motion";
import { OwnerDashboardOverview } from "./owner-dashboard-overview";

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
    <article className='rounded-xl border border-border bg-emerald-800/5 h-full p-6 shadow-sm'>
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

function getBookingStatusCopy(booking: BookingSummary) {
  if (booking.status === "PENDING_OWNER_APPROVAL") {
    return {
      label: "Awaiting owner approval",
      meta: `Reserved from ${booking.startDate} to ${booking.endDate}`,
    };
  }

  if (booking.status === "PENDING_RENTER_PAYMENT") {
    return {
      label: "Payment confirmation needed",
      meta: booking.renterPaymentDeadlineAt
        ? `Reserved until ${booking.renterPaymentDeadlineAt}`
        : "Approved and waiting on your next step",
    };
  }

  if (booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") {
    const progress = getBookingProgress(
      booking.startDate,
      booking.endDate,
      booking.status,
    );
    return {
      label:
        booking.status === "IN_PROGRESS"
          ? "Rental in progress"
          : "Rental confirmed",
      meta: progress.label,
    };
  }

  if (booking.status === "COMPLETED") {
    return {
      label: "Completed rental",
      meta: `${booking.rentalDays} day${booking.rentalDays === 1 ? "" : "s"} booked`,
    };
  }

  if (booking.status === "DISPUTED") {
    return {
      label: "Dispute under review",
      meta: "Support follow-up may be needed",
    };
  }

  return {
    label: "Cancelled booking",
    meta: "No further action required",
  };
}

function RenterOverview() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const bookingsQuery = useMyBookingsQuery();
  const wishlistQuery = useMyWishlistQuery();
  const notificationsQuery = useMyNotificationsQuery();

  const bookings = useMemo(
    () => bookingsQuery.data ?? [],
    [bookingsQuery.data],
  );
  const wishlistItems = useMemo(
    () => wishlistQuery.data ?? [],
    [wishlistQuery.data],
  );
  const notifications = useMemo(
    () => notificationsQuery.data ?? [],
    [notificationsQuery.data],
  );

  const stats = useMemo(() => {
    const activeRentals = bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS",
    ).length;
    const waitingOnOwner = bookings.filter(
      (booking) => booking.status === "PENDING_OWNER_APPROVAL",
    ).length;
    const waitingOnPayment = bookings.filter(
      (booking) => booking.status === "PENDING_RENTER_PAYMENT",
    ).length;
    const completedRentals = bookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const unreadNotifications = notifications.filter(
      (item) => !item.isRead,
    ).length;

    return {
      activeRentals,
      waitingOnOwner,
      waitingOnPayment,
      completedRentals,
      unreadNotifications,
    };
  }, [bookings, notifications]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((left, right) => {
        return (
          new Date(right.updatedAt).getTime() -
          new Date(left.updatedAt).getTime()
        );
      })
      .slice(0, 4);
  }, [bookings]);

  const dataLoaded =
    !bookingsQuery.isPending &&
    !wishlistQuery.isPending &&
    !notificationsQuery.isPending;
  const hasDataError =
    bookingsQuery.isError ||
    wishlistQuery.isError ||
    notificationsQuery.isError;

  return (
    <section className='space-y-8'>
      <motion.div {...getDashboardRevealProps(shouldReduceMotion, 0)}>
        <SectionTitle
          eyebrow='Renter Workspace'
          title='Rental Overview'
          description='Keep an eye on approvals, Cashfree payment steps, active rentals, wishlisted machines, and new updates from owners.'
        />
      </motion.div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
        {[
          {
            label: "Active Rentals",
            value: String(stats.activeRentals),
            helper: dataLoaded
              ? `${stats.completedRentals} completed rental${stats.completedRentals === 1 ? "" : "s"} in your history.`
              : "Loading your rental activity.",
          },
          {
            label: "Awaiting Approval",
            value: String(stats.waitingOnOwner),
            helper: "Requests currently reserved while owners review them.",
          },
          {
            label: "Payment Needed",
            value: String(stats.waitingOnPayment),
            helper: "Approved requests waiting on your Cashfree payment step.",
          },
          {
            label: "Saved Machines",
            value: String(wishlistItems.length),
            helper: `${stats.unreadNotifications} unread notification${stats.unreadNotifications === 1 ? "" : "s"} in your inbox.`,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            {...getDashboardRevealProps(shouldReduceMotion, index + 1)}
          >
            <StatCard
              label={item.label}
              value={item.value}
              helper={item.helper}
            />
          </motion.div>
        ))}
      </div>

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <motion.section
          {...getDashboardRevealProps(shouldReduceMotion, 2)}
          className='rounded-xl border border-border bg-background p-6 shadow-sm'
        >
          <div className='flex items-center justify-between gap-4 border-b border-border pb-5'>
            <div>
              <h2 className='text-2xl font-semibold tracking-[-0.03em] text-foreground'>
                Recent Booking Activity
              </h2>
              <p className='mt-2 text-sm text-muted-foreground'>
                The latest changes across your requests, active rentals, and
                completed bookings.
              </p>
            </div>
            <CalendarDays className='h-5 w-5 text-primary' />
          </div>

          {hasDataError ? (
            <div className='mt-6 rounded-lg border border-[#ffd9d4] bg-[#fff4f2] p-4 text-sm text-[#7a120c]'>
              We could not load your latest dashboard activity right now.
            </div>
          ) : null}

          {!hasDataError && dataLoaded && recentBookings.length === 0 ? (
            <div className='mt-6 rounded-lg border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground'>
              No booking activity yet. Once you send a rental request, its
              approval progress and payment step will appear here.
            </div>
          ) : null}

          <div className='mt-6 space-y-4'>
            {recentBookings.map((booking, index) => {
              const state = getBookingStatusCopy(booking);
              return (
                <motion.div
                  key={booking.id}
                  {...getDashboardRevealProps(shouldReduceMotion, index)}
                  className='rounded-lg border border-border bg-muted/20 p-4'
                >
                  <div className='flex items-center justify-between gap-4'>
                    <p className='font-semibold text-foreground'>
                      {booking.equipment.title}
                    </p>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                      {state.label}
                    </span>
                  </div>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {state.meta}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.aside
          {...getDashboardRevealProps(shouldReduceMotion, 3)}
          className='space-y-6'
        >
          <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
              Next Steps
            </h3>
            <div className='mt-5 space-y-3'>
              {[
                {
                  href: "/dashboard/bookings",
                  label: "Review my bookings",
                  icon: CalendarDays,
                },
                {
                  href: "/dashboard/transactions",
                  label: "Check transaction history",
                  icon: BarChart3,
                },
                {
                  href: "/dashboard/saved",
                  label: "Browse saved machinery",
                  icon: Heart,
                },
                {
                  href: "/dashboard/notifications",
                  label: "Open notifications",
                  icon: Bell,
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

          <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
              Booking Readiness
            </h3>
            <div className='mt-5 space-y-4'>
              <div className='rounded-lg border border-border bg-muted/20 p-4'>
                <p className='text-sm font-semibold text-foreground'>
                  Approvals waiting
                </p>
                <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                  {stats.waitingOnOwner > 0
                    ? `${stats.waitingOnOwner} request${stats.waitingOnOwner === 1 ? "" : "s"} currently need an owner decision.`
                    : "No requests are waiting on owner approval right now."}
                </p>
              </div>
              <div className='rounded-lg border border-border bg-muted/20 p-4'>
                <p className='text-sm font-semibold text-foreground'>
                  Payment confirmations
                </p>
                <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                  {stats.waitingOnPayment > 0
                    ? `${stats.waitingOnPayment} approved booking${stats.waitingOnPayment === 1 ? "" : "s"} need your next step.`
                    : "No approved requests are waiting on your Cashfree payment confirmation."}
                </p>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function AdminOverview() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const metricsQuery = useDashboardMetricsQuery();
  const metrics = metricsQuery.data;

  return (
    <section className='space-y-8'>
      <motion.div {...getDashboardRevealProps(shouldReduceMotion, 0)}>
        <SectionTitle
          eyebrow='Admin Workspace'
          title='Platform Overview'
          description='Monitor verification queues, user activity, and operational health across the marketplace.'
        />
      </motion.div>

      <div className='grid gap-5 md:grid-cols-3'>
        {[
          {
            label: "Pending Verifications",
            value: metrics ? String(metrics.pendingVerifications) : "—",
            helper: metrics
              ? `${metrics.activeListings} active listing${metrics.activeListings === 1 ? "" : "s"} are already live on the marketplace.`
              : "Loading verification queue.",
          },
          {
            label: "Active Users",
            value: metrics ? String(metrics.activeUsers) : "—",
            helper: metrics
              ? `${metrics.recentSignups} new signup${metrics.recentSignups === 1 ? "" : "s"} in the past 7 days.`
              : "Loading account activity.",
          },
          {
            label: "Platform Alerts",
            value: metrics ? String(metrics.platformAlerts) : "—",
            helper: metrics
              ? `${metrics.manualSettlementQueue} booking${metrics.manualSettlementQueue === 1 ? "" : "s"} still need finance follow-up.`
              : "Loading operational alerts.",
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            {...getDashboardRevealProps(shouldReduceMotion, index + 1)}
          >
            <StatCard
              label={item.label}
              value={item.value}
              helper={item.helper}
            />
          </motion.div>
        ))}
      </div>

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <motion.section
          {...getDashboardRevealProps(shouldReduceMotion, 2)}
          className='rounded-xl border border-border bg-emerald-900/5 p-6 shadow-sm'
        >
          <div className='flex items-center justify-between gap-4 border-b border-border pb-5'>
            <div>
              <h2 className='text-2xl font-semibold tracking-[-0.03em] text-foreground'>
                Priority Queue
              </h2>
              <p className='mt-2 text-sm text-muted-foreground'>
                The highest-priority items for review right now.
              </p>
            </div>
            <ShieldCheck className='h-5 w-5 text-primary' />
          </div>

          {metricsQuery.isPending ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : metricsQuery.isError ? (
            <div className='mt-6 rounded-lg border border-[#ffd9d4] bg-[#fff4f2] p-4 text-sm text-[#7a120c]'>
              We could not load the latest admin overview metrics right now.
            </div>
          ) : metrics ? (
            <div className='mt-6 space-y-4'>
              {[
                [
                  "Verification queue",
                  `${metrics.pendingVerifications} listing${metrics.pendingVerifications === 1 ? "" : "s"} waiting`,
                  "Open the moderation queue to approve or reject new equipment submissions.",
                ],
                [
                  "Manual settlements",
                  `${metrics.manualSettlementQueue} booking${metrics.manualSettlementQueue === 1 ? "" : "s"} pending`,
                  "Finance follow-up is still needed for completed or disputed payout/refund records.",
                ],
                [
                  "Live marketplace activity",
                  `${metrics.bookingRequests} active booking${metrics.bookingRequests === 1 ? "" : "s"}`,
                  `${metrics.totalUsers} total users and ${metrics.activeListings} active listing${metrics.activeListings === 1 ? "" : "s"} currently on platform.`,
                ],
              ].map(([title, status, meta], index) => (
                <motion.div
                  key={title}
                  {...getDashboardRevealProps(shouldReduceMotion, index)}
                  className='rounded-lg border border-border bg-muted/20 p-4'
                >
                  <div className='flex items-center justify-between gap-4'>
                    <p className='font-semibold text-foreground'>{title}</p>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                      {status}
                    </span>
                  </div>
                  <p className='mt-2 text-sm text-muted-foreground'>{meta}</p>
                </motion.div>
              ))}
            </div>
          ) : null}
        </motion.section>

        <motion.aside
          {...getDashboardRevealProps(shouldReduceMotion, 3)}
          className='rounded-xl border border-border bg-emerald-950/5 p-6 shadow-sm'
        >
          <h3 className='text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground'>
            Admin Actions
          </h3>
          <div className='mt-5 space-y-3'>
            {[
              {
                href: "/dashboard/verifications",
                label: "Review verifications",
                icon: ShieldCheck,
              },
              {
                href: "/dashboard/users",
                label: "Manage users",
                icon: ClipboardList,
              },
              {
                href: "/dashboard/transactions",
                label: "Check transactions",
                icon: BarChart3,
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
                    className='flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'
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
        </motion.aside>
      </div>
    </section>
  );
}

export function DashboardOverviewContent({ role }: { role: DashboardRole }) {
  if (role === "admin") {
    return <AdminOverview />;
  }

  if (role === "renter") {
    return <RenterOverview />;
  }

  return <OwnerDashboardOverview />;
}
