"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Loader2,
  ReceiptText,
  Search,
  ShieldAlert,
} from "lucide-react";
import {
  useAdminBookingsQuery,
  useMarkDepositRefundedMutation,
  useMarkOwnerPayoutPaidMutation,
} from "@/hooks/use-bookings";
import { useAdminPaymentEventsQuery } from "@/hooks/use-payments";
import type {
  BookingSummary,
  BookingStatus,
  DepositRefundStatus,
  FinancialStatus,
  OwnerPayoutStatus,
} from "@/lib/booking";
import type { AdminPaymentEvent } from "@/lib/payment";
import { ApiError } from "@/lib/http";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? "/assets/landing/landing-tractor.png";
}

function normalizeLabel(value: string) {
  return value.replaceAll("_", " ");
}

function isDepositResolved(status: DepositRefundStatus) {
  return status === "REFUNDED" || status === "SKIPPED";
}

function bookingNeedsAction(booking: BookingSummary) {
  return (
    booking.isPaymentCompleted &&
    (booking.status === "COMPLETED" || booking.status === "DISPUTED") &&
    (booking.ownerPayoutStatus !== "PAID" ||
      !isDepositResolved(booking.depositRefundStatus))
  );
}

function getOwnerPayoutLabel(booking: BookingSummary) {
  switch (booking.ownerPayoutStatus) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Awaiting admin payout";
    case "BLOCKED":
      return "Blocked by dispute";
    default:
      return booking.isPaymentCompleted
        ? "Will start after completion"
        : "Not ready";
  }
}

function getDepositRefundLabel(booking: BookingSummary) {
  switch (booking.depositRefundStatus) {
    case "REFUNDED":
      return "Refunded";
    case "SKIPPED":
      return "Refund skipped";
    case "PENDING":
      return "Awaiting admin refund";
    case "BLOCKED":
      return "Blocked by dispute";
    default:
      return booking.isPaymentCompleted
        ? "Will start after completion"
        : "Not ready";
  }
}

function getFinancialTone(status: FinancialStatus) {
  switch (status) {
    case "PAYMENT_CAPTURED":
      return "border-[#cce8d6] bg-[#eefaf2] text-[#166534]";
    case "MANUAL_SETTLEMENT_PENDING":
      return "border-[#f6dfb0] bg-[#fff8e7] text-[#9a6700]";
    case "MANUAL_SETTLEMENT_COMPLETE":
      return "border-[#d8dfdb] bg-[#f5f8f5] text-primary";
    case "PAYMENT_FAILED":
      return "border-[#f5c2c7] bg-[#fff1f2] text-[#b42318]";
    case "DISPUTED":
      return "border-[#f7c4cf] bg-[#fff0f4] text-[#9f1239]";
    default:
      return "border-[#d8dfdb] bg-[#f8faf7] text-primary";
  }
}

function getBookingStatusTone(status: BookingStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-[#eefaf2] text-[#166534]";
    case "DISPUTED":
      return "bg-[#fff0f4] text-[#9f1239]";
    case "CANCELLED":
      return "bg-[#f8fafc] text-[#475569]";
    default:
      return "bg-[#eef2ed] text-primary";
  }
}

function getEventStatusTone(status: AdminPaymentEvent["status"]) {
  switch (status) {
    case "processed":
      return "bg-[#eefaf2] text-[#166534]";
    case "unprocessed":
      return "bg-[#fff7ed] text-[#9a6700]";
    case "unmatched":
      return "bg-[#fff1f2] text-[#b42318]";
    default:
      return "bg-[#eef2ed] text-primary";
  }
}

function getLastTransactionTimestamp(booking: BookingSummary) {
  return (
    booking.depositRefundedAt ??
    booking.ownerPaidAt ??
    booking.paymentDisputedAt ??
    booking.disputedAt ??
    booking.completedAt ??
    booking.paymentCapturedAt ??
    booking.paymentFailedAt ??
    booking.updatedAt
  );
}

function getSearchableBookingText(booking: BookingSummary) {
  return [
    booking.id,
    booking.equipment.title,
    booking.owner.fullName,
    booking.renter.fullName,
    booking.razorpayOrderId,
    booking.razorpayPaymentId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getSearchableEventText(event: AdminPaymentEvent) {
  return [
    event.eventId,
    event.eventType,
    event.entityId,
    event.linkedBooking?.id,
    event.linkedBooking?.equipmentTitle,
    event.linkedOrderId,
    event.linkedPaymentId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className='rounded-xl border border-[#d8dfdb] bg-emerald-800/5 p-6 shadow-sm'>
      <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]'>
        {label}
      </p>
      <p className='mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary'>
        {value}
      </p>
      <p className='mt-2 text-sm leading-6 text-[#5c5f60]'>{helper}</p>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className='rounded-lg border border-[#e5ebe6] bg-white/80 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]'>
        {label}
      </p>
      <p className='mt-2 break-words text-sm text-primary'>
        {value || "Not available"}
      </p>
    </div>
  );
}

const bookingStatusOptions: Array<"ALL" | BookingStatus> = [
  "ALL",
  "PENDING_OWNER_APPROVAL",
  "PENDING_RENTER_PAYMENT",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
];

const financialStatusOptions: Array<"ALL" | FinancialStatus> = [
  "ALL",
  "PAYMENT_CAPTURED",
  "MANUAL_SETTLEMENT_PENDING",
  "MANUAL_SETTLEMENT_COMPLETE",
  "PAYMENT_FAILED",
  "DISPUTED",
  "PAYMENT_PENDING",
  "PAYMENT_PROCESSING",
  "NONE",
];

const ownerPayoutOptions: Array<"ALL" | OwnerPayoutStatus> = [
  "ALL",
  "PENDING",
  "PAID",
  "BLOCKED",
  "NONE",
];

const depositRefundOptions: Array<"ALL" | DepositRefundStatus> = [
  "ALL",
  "PENDING",
  "REFUNDED",
  "SKIPPED",
  "BLOCKED",
  "NONE",
];

type TransactionTab = "ledger" | "raw";

export function AdminTransactionsContent() {
  const bookingsQuery = useAdminBookingsQuery();
  const paymentEventsQuery = useAdminPaymentEventsQuery();
  const markOwnerPaidMutation = useMarkOwnerPayoutPaidMutation();
  const markDepositRefundedMutation = useMarkDepositRefundedMutation();

  const [activeTab, setActiveTab] = useState<TransactionTab>("ledger");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    null,
  );
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    "ALL" | BookingStatus
  >("ALL");
  const [financialStatusFilter, setFinancialStatusFilter] = useState<
    "ALL" | FinancialStatus
  >("ALL");
  const [ownerPayoutFilter, setOwnerPayoutFilter] = useState<
    "ALL" | OwnerPayoutStatus
  >("ALL");
  const [depositRefundFilter, setDepositRefundFilter] = useState<
    "ALL" | DepositRefundStatus
  >("ALL");
  const [needsActionFilter, setNeedsActionFilter] = useState<
    "ALL" | "ONLY_ACTION"
  >("ALL");
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [eventStatusFilter, setEventStatusFilter] = useState<
    "ALL" | AdminPaymentEvent["status"]
  >("ALL");
  const [eventLinkFilter, setEventLinkFilter] = useState<
    "ALL" | "LINKED" | "UNLINKED"
  >("ALL");

  const deferredBookingSearch = useDeferredValue(bookingSearchTerm);
  const deferredEventSearch = useDeferredValue(eventSearchTerm);

  const bookings = useMemo(
    () => bookingsQuery.data ?? [],
    [bookingsQuery.data],
  );
  const paymentEvents = useMemo(
    () => paymentEventsQuery.data ?? [],
    [paymentEventsQuery.data],
  );

  const eventTypes = useMemo(
    () =>
      Array.from(new Set(paymentEvents.map((event) => event.eventType))).sort(),
    [paymentEvents],
  );

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const left = new Date(getLastTransactionTimestamp(a)).getTime();
        const right = new Date(getLastTransactionTimestamp(b)).getTime();
        return right - left;
      }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    const normalizedSearch = deferredBookingSearch.trim().toLowerCase();

    return sortedBookings.filter((booking) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSearchableBookingText(booking).includes(normalizedSearch);
      const matchesStatus =
        bookingStatusFilter === "ALL" || booking.status === bookingStatusFilter;
      const matchesFinancial =
        financialStatusFilter === "ALL" ||
        booking.financialStatus === financialStatusFilter;
      const matchesOwnerPayout =
        ownerPayoutFilter === "ALL" ||
        booking.ownerPayoutStatus === ownerPayoutFilter;
      const matchesDepositRefund =
        depositRefundFilter === "ALL" ||
        booking.depositRefundStatus === depositRefundFilter;
      const matchesNeedsAction =
        needsActionFilter === "ALL" || bookingNeedsAction(booking);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFinancial &&
        matchesOwnerPayout &&
        matchesDepositRefund &&
        matchesNeedsAction
      );
    });
  }, [
    bookingStatusFilter,
    deferredBookingSearch,
    depositRefundFilter,
    financialStatusFilter,
    needsActionFilter,
    ownerPayoutFilter,
    sortedBookings,
  ]);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = deferredEventSearch.trim().toLowerCase();

    return paymentEvents.filter((event) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSearchableEventText(event).includes(normalizedSearch);
      const matchesType =
        eventTypeFilter === "ALL" || event.eventType === eventTypeFilter;
      const matchesStatus =
        eventStatusFilter === "ALL" || event.status === eventStatusFilter;
      const matchesLink =
        eventLinkFilter === "ALL" ||
        (eventLinkFilter === "LINKED"
          ? Boolean(event.linkedBooking)
          : !event.linkedBooking);

      return matchesSearch && matchesType && matchesStatus && matchesLink;
    });
  }, [
    deferredEventSearch,
    eventLinkFilter,
    eventStatusFilter,
    eventTypeFilter,
    paymentEvents,
  ]);

  const totals = useMemo(() => {
    const actionableBookings = bookings.filter(bookingNeedsAction);
    const capturedValue = bookings
      .filter((booking) => booking.isPaymentCompleted)
      .reduce((sum, booking) => sum + booking.totalAuthorized, 0);

    return {
      capturedValue,
      pendingOwnerPayout: actionableBookings.filter(
        (booking) => booking.ownerPayoutStatus !== "PAID",
      ).length,
      pendingDepositRefund: actionableBookings.filter(
        (booking) => !isDepositResolved(booking.depositRefundStatus),
      ).length,
      failedPayments: bookings.filter(
        (booking) => booking.financialStatus === "PAYMENT_FAILED",
      ).length,
      disputedTransactions: bookings.filter(
        (booking) =>
          booking.status === "DISPUTED" ||
          booking.financialStatus === "DISPUTED",
      ).length,
      unmatchedWebhookEvents: paymentEvents.filter(
        (event) => event.status === "unmatched",
      ).length,
      actionableBookings: actionableBookings.length,
    };
  }, [bookings, paymentEvents]);

  async function handleMarkOwnerPaid(bookingId: string) {
    setFeedback(null);
    setErrorMessage(null);

    try {
      await markOwnerPaidMutation.mutateAsync({
        bookingId,
        input: { reference: references[bookingId]?.trim() || undefined },
      });
      setFeedback("Owner payout recorded successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to record owner payout.",
      );
    }
  }

  async function handleMarkDepositRefunded(bookingId: string) {
    setFeedback(null);
    setErrorMessage(null);

    try {
      await markDepositRefundedMutation.mutateAsync({
        bookingId,
        input: { reference: references[bookingId]?.trim() || undefined },
      });
      setFeedback("Deposit refund recorded successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to record deposit refund.",
      );
    }
  }

  return (
    <section className='space-y-10'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
            Admin Finance
          </p>
          <h1 className='mt-3 text-4xl font-semibold tracking-[-0.04em] text-primary md:text-5xl'>
            Transactions
          </h1>
          <p className='mt-3 max-w-3xl text-base leading-8 text-[#5c5f60]'>
            Review booking-level money flow first, then inspect raw Razorpay
            webhook events for reconciliation, debugging, and payout follow-up.
          </p>
        </div>
        <div className='flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm'>
          <ReceiptText className='h-5 w-5 text-primary' />
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]'>
              Needs Action
            </p>
            <p className='mt-1 text-lg font-semibold text-primary'>
              {totals.actionableBookings} bookings
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        <SummaryCard
          label='Captured Payment Value'
          value={formatCurrency(totals.capturedValue)}
          helper='Total renter payment value already captured on the platform.'
        />
        <SummaryCard
          label='Owner Payouts Pending'
          value={String(totals.pendingOwnerPayout)}
          helper='Completed or disputed bookings still waiting for owner settlement recording.'
        />
        <SummaryCard
          label='Deposit Refunds Pending'
          value={String(totals.pendingDepositRefund)}
          helper='Security deposits that still need refund confirmation from admin.'
        />
        <SummaryCard
          label='Failed Payments'
          value={String(totals.failedPayments)}
          helper='Bookings where payment failed and may need support or retry guidance.'
        />
        <SummaryCard
          label='Disputed Transactions'
          value={String(totals.disputedTransactions)}
          helper='Bookings currently blocked by dispute-driven financial review.'
        />
        <SummaryCard
          label='Unmatched Webhook Events'
          value={String(totals.unmatchedWebhookEvents)}
          helper='Processed payment events that do not currently resolve back to a booking.'
        />
      </div>

      {feedback ? (
        <div className='rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-5 py-4 text-sm font-medium text-primary'>
          {feedback}
        </div>
      ) : null}
      {errorMessage ? (
        <div className='rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm font-medium text-[#b42318]'>
          {errorMessage}
        </div>
      ) : null}

      <div className='rounded-2xl border border-[#d8dfdb] bg-white p-2 shadow-sm'>
        <div className='grid gap-2 sm:grid-cols-2'>
          <button
            type='button'
            onClick={() => setActiveTab("ledger")}
            className={[
              "rounded-xl px-5 py-3 text-left text-sm font-semibold transition-colors",
              activeTab === "ledger"
                ? "bg-[#1b4332] text-white shadow-sm"
                : "bg-transparent text-primary hover:bg-[#f5f8f5]",
            ].join(" ")}
          >
            Ledger
          </button>
          <button
            type='button'
            onClick={() => setActiveTab("raw")}
            className={[
              "rounded-xl px-5 py-3 text-left text-sm font-semibold transition-colors",
              activeTab === "raw"
                ? "bg-[#1b4332] text-white shadow-sm"
                : "bg-transparent text-primary hover:bg-[#f5f8f5]",
            ].join(" ")}
          >
            Raw Events
          </button>
        </div>
      </div>

      {activeTab === "ledger" ? (
        <section className='space-y-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]'>
                Booking Ledger
              </p>
              <h2 className='mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary'>
                Booking-centric transaction operations
              </h2>
            </div>
            <p className='text-sm text-[#5c5f60]'>
              Sorted by the latest meaningful payment, payout, refund, or
              dispute activity.
            </p>
          </div>

          <div className='grid gap-4 rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-sm lg:grid-cols-6'>
            <label className='flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-[#64748b] lg:col-span-2'>
              <Search className='h-4 w-4 shrink-0' />
              <input
                value={bookingSearchTerm}
                onChange={(event) => setBookingSearchTerm(event.target.value)}
                placeholder='Search booking, equipment, owner, renter, order or payment id'
                className='w-full bg-transparent outline-none placeholder:text-[#94a3b8]'
              />
            </label>

            <select
              value={bookingStatusFilter}
              onChange={(event) =>
                setBookingStatusFilter(
                  event.target.value as "ALL" | BookingStatus,
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              {bookingStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL"
                    ? "All booking statuses"
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={financialStatusFilter}
              onChange={(event) =>
                setFinancialStatusFilter(
                  event.target.value as "ALL" | FinancialStatus,
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              {financialStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL"
                    ? "All financial states"
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={ownerPayoutFilter}
              onChange={(event) =>
                setOwnerPayoutFilter(
                  event.target.value as "ALL" | OwnerPayoutStatus,
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              {ownerPayoutOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL"
                    ? "All payout states"
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={depositRefundFilter}
              onChange={(event) =>
                setDepositRefundFilter(
                  event.target.value as "ALL" | DepositRefundStatus,
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              {depositRefundOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL"
                    ? "All refund states"
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={needsActionFilter}
              onChange={(event) =>
                setNeedsActionFilter(
                  event.target.value as "ALL" | "ONLY_ACTION",
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none lg:col-span-2'
            >
              <option value='ALL'>All ledger items</option>
              <option value='ONLY_ACTION'>Needs action only</option>
            </select>
          </div>

          {bookingsQuery.isPending ? (
            <div className='flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : null}

          {bookingsQuery.isError ? (
            <div className='rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]'>
              We could not load the booking transaction ledger right now.
            </div>
          ) : null}

          {!bookingsQuery.isPending && !bookingsQuery.isError ? (
            filteredBookings.length > 0 ? (
              <div className='space-y-6'>
                {filteredBookings.map((booking) => {
                  const isMutating =
                    markOwnerPaidMutation.isPending ||
                    markDepositRefundedMutation.isPending;
                  const isExpanded = expandedBookingId === booking.id;

                  return (
                    <article
                      key={booking.id}
                      className='overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm'
                    >
                      <div className='flex flex-col xl:flex-row'>
                        <div className='relative h-64 w-full overflow-hidden bg-[#eef2ed] xl:h-auto xl:w-[24%]'>
                          <Image
                            src={getImageSrc(booking)}
                            alt={booking.equipment.title}
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>

                        <div className='flex-1 p-6 md:p-8'>
                          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                            <div className='min-w-0'>
                              <div className='flex flex-wrap items-center gap-3'>
                                <h3 className='text-3xl font-semibold tracking-[-0.04em] text-primary'>
                                  {booking.equipment.title}
                                </h3>
                                <span
                                  className={[
                                    "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                                    getBookingStatusTone(booking.status),
                                  ].join(" ")}
                                >
                                  {normalizeLabel(booking.status)}
                                </span>
                                <span
                                  className={[
                                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                                    getFinancialTone(booking.financialStatus),
                                  ].join(" ")}
                                >
                                  {normalizeLabel(booking.financialStatus)}
                                </span>
                              </div>

                              <p className='mt-3 text-sm text-[#64748b]'>
                                Booking ID: {booking.id}
                              </p>
                              <p className='mt-1 text-sm text-[#64748b]'>
                                Owner: {booking.owner.fullName} | Renter:{" "}
                                {booking.renter.fullName}
                              </p>
                              <p className='mt-1 text-sm text-[#64748b]'>
                                {formatDateRange(
                                  booking.startDate,
                                  booking.endDate,
                                )}
                              </p>
                            </div>

                            <div className='rounded-xl border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-right'>
                              <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]'>
                                Last Transaction Activity
                              </p>
                              <p className='mt-2 text-sm font-semibold text-primary'>
                                {formatDateTime(
                                  getLastTransactionTimestamp(booking),
                                )}
                              </p>
                            </div>
                          </div>

                          <div className='mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6'>
                            <DetailRow
                              label='Total Paid'
                              value={formatCurrency(booking.totalAuthorized)}
                            />
                            <DetailRow
                              label='Rental Fee'
                              value={formatCurrency(booking.rentalFee)}
                            />
                            <DetailRow
                              label='Platform Fee'
                              value={formatCurrency(booking.platformFee)}
                            />
                            <DetailRow
                              label='Damage Waiver'
                              value={formatCurrency(booking.damageWaiverFee)}
                            />
                            <DetailRow
                              label='Security Deposit'
                              value={formatCurrency(booking.securityDeposit)}
                            />
                            <DetailRow
                              label='Provider'
                              value={
                                booking.paymentProvider?.toUpperCase() ??
                                "Manual / None"
                              }
                            />
                          </div>

                          <div className='mt-6 grid gap-4 md:grid-cols-2'>
                            <div className='rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]'>
                                Owner Payout
                              </p>
                              <p className='mt-2 text-sm font-semibold text-primary'>
                                {getOwnerPayoutLabel(booking)}
                              </p>
                              <p className='mt-1 text-xs leading-6 text-[#5c5f60]'>
                                {booking.ownerPaidAt
                                  ? `Recorded at ${formatDateTime(booking.ownerPaidAt)}`
                                  : "Record this after you send money to the owner manually."}
                              </p>
                            </div>
                            <div className='rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4'>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]'>
                                Deposit Refund
                              </p>
                              <p className='mt-2 text-sm font-semibold text-primary'>
                                {getDepositRefundLabel(booking)}
                              </p>
                              <p className='mt-1 text-xs leading-6 text-[#5c5f60]'>
                                {booking.depositRefundedAt
                                  ? `Recorded at ${formatDateTime(booking.depositRefundedAt)}`
                                  : "Record this after you return the renter's security deposit manually."}
                              </p>
                            </div>
                          </div>

                          <div className='mt-6'>
                            <input
                              value={references[booking.id] ?? ""}
                              onChange={(event) =>
                                setReferences((current) => ({
                                  ...current,
                                  [booking.id]: event.target.value,
                                }))
                              }
                              placeholder='Optional payout or refund reference, bank note, UPI ref, etc.'
                              className='w-full rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary'
                            />
                          </div>

                          <div className='mt-6 flex flex-wrap items-center gap-3'>
                            <button
                              type='button'
                              onClick={() => handleMarkOwnerPaid(booking.id)}
                              disabled={
                                isMutating ||
                                booking.ownerPayoutStatus === "PAID"
                              }
                              className='rounded-[4px] bg-[#1b4332] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70'
                            >
                              Mark Owner Paid
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                handleMarkDepositRefunded(booking.id)
                              }
                              disabled={
                                isMutating ||
                                isDepositResolved(booking.depositRefundStatus)
                              }
                              className='rounded-[4px] border border-[#d8dfdb] px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70'
                            >
                              Mark Deposit Refunded
                            </button>
                            <button
                              type='button'
                              onClick={() =>
                                setExpandedBookingId((current) =>
                                  current === booking.id ? null : booking.id,
                                )
                              }
                              className='inline-flex items-center gap-2 rounded-[4px] border border-transparent px-2 py-3 text-sm font-semibold text-primary'
                            >
                              {isExpanded ? "Hide details" : "Open details"}
                              <ChevronDown
                                className={[
                                  "h-4 w-4 transition-transform",
                                  isExpanded ? "rotate-180" : "",
                                ].join(" ")}
                              />
                            </button>
                          </div>

                          {isExpanded ? (
                            <div className='mt-8 grid gap-4 rounded-xl border border-[#d8dfdb] bg-[#fbfcfa] p-5 md:grid-cols-2 xl:grid-cols-3'>
                              <DetailRow
                                label='Razorpay Order ID'
                                value={booking.razorpayOrderId}
                              />
                              <DetailRow
                                label='Razorpay Payment ID'
                                value={booking.razorpayPaymentId}
                              />
                              <DetailRow
                                label='Razorpay Transfer ID'
                                value={booking.razorpayTransferId}
                              />
                              <DetailRow
                                label='Razorpay Refund ID'
                                value={booking.razorpayRefundId}
                              />
                              <DetailRow
                                label='Payment Authorization ID'
                                value={booking.paymentAuthorizationId}
                              />
                              <DetailRow
                                label='Payment Intent ID'
                                value={booking.paymentIntentId}
                              />
                              <DetailRow
                                label='Payout Linked Account ID'
                                value={booking.payoutLinkedAccountId}
                              />
                              <DetailRow
                                label='Owner Payout Reference'
                                value={booking.ownerPayoutReference}
                              />
                              <DetailRow
                                label='Deposit Refund Reference'
                                value={booking.depositRefundReference}
                              />
                              <DetailRow
                                label='Last Payment Error'
                                value={booking.lastPaymentError}
                              />
                              <DetailRow
                                label='Payment Captured At'
                                value={formatDateTime(
                                  booking.paymentCapturedAt,
                                )}
                              />
                              <DetailRow
                                label='Payment Failed At'
                                value={formatDateTime(booking.paymentFailedAt)}
                              />
                              <DetailRow
                                label='Owner Paid At'
                                value={formatDateTime(booking.ownerPaidAt)}
                              />
                              <DetailRow
                                label='Deposit Refunded At'
                                value={formatDateTime(
                                  booking.depositRefundedAt,
                                )}
                              />
                              <DetailRow
                                label='Disputed At'
                                value={formatDateTime(booking.disputedAt)}
                              />
                              <DetailRow
                                label='Cancelled At'
                                value={formatDateTime(booking.cancelledAt)}
                              />
                              <DetailRow
                                label='Completed At'
                                value={formatDateTime(booking.completedAt)}
                              />
                              <DetailRow
                                label='Created At'
                                value={formatDateTime(booking.createdAt)}
                              />
                              <DetailRow
                                label='Updated At'
                                value={formatDateTime(booking.updatedAt)}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className='rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-16 text-center'>
                <h2 className='text-2xl font-semibold tracking-[-0.03em] text-primary'>
                  No bookings match the current ledger filters
                </h2>
                <p className='mt-3 text-sm leading-7 text-[#5c5f60]'>
                  Try broadening the search or clearing a few filters to inspect
                  more transaction records.
                </p>
              </div>
            )
          ) : null}
        </section>
      ) : null}

      {activeTab === "raw" ? (
        <section className='space-y-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]'>
                Raw Event Log
              </p>
              <h2 className='mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary'>
                Razorpay webhook trail
              </h2>
            </div>
            <p className='text-sm text-[#5c5f60]'>
              Newest events first, with client-side filtering for faster admin
              debugging.
            </p>
          </div>

          <div className='grid gap-4 rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-sm lg:grid-cols-4'>
            <label className='flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-[#64748b] lg:col-span-2'>
              <Search className='h-4 w-4 shrink-0' />
              <input
                value={eventSearchTerm}
                onChange={(event) => setEventSearchTerm(event.target.value)}
                placeholder='Search event id, type, entity, booking, payment or order id'
                className='w-full bg-transparent outline-none placeholder:text-[#94a3b8]'
              />
            </label>

            <select
              value={eventTypeFilter}
              onChange={(event) => setEventTypeFilter(event.target.value)}
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              <option value='ALL'>All event types</option>
              {eventTypes.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>

            <select
              value={eventStatusFilter}
              onChange={(event) =>
                setEventStatusFilter(
                  event.target.value as "ALL" | AdminPaymentEvent["status"],
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none'
            >
              <option value='ALL'>All event statuses</option>
              <option value='processed'>Processed</option>
              <option value='unprocessed'>Unprocessed</option>
              <option value='unmatched'>Unmatched</option>
            </select>

            <select
              value={eventLinkFilter}
              onChange={(event) =>
                setEventLinkFilter(
                  event.target.value as "ALL" | "LINKED" | "UNLINKED",
                )
              }
              className='rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none lg:col-span-2'
            >
              <option value='ALL'>All link states</option>
              <option value='LINKED'>Linked to booking</option>
              <option value='UNLINKED'>Unlinked / unmatched</option>
            </select>
          </div>

          {paymentEventsQuery.isPending ? (
            <div className='flex min-h-[220px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
            </div>
          ) : null}

          {paymentEventsQuery.isError ? (
            <div className='rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm'>
              <div className='flex items-center gap-3 text-[#7a120c]'>
                <AlertTriangle className='h-5 w-5' />
                <h2 className='text-xl font-semibold tracking-[-0.03em]'>
                  We couldn&apos;t load the webhook event log
                </h2>
              </div>
              <p className='mt-3 max-w-2xl text-sm leading-7 text-[#7a120c]'>
                Retry in a moment. The raw event stream is used for
                reconciliation and payment debugging.
              </p>
            </div>
          ) : null}

          {!paymentEventsQuery.isPending && !paymentEventsQuery.isError ? (
            filteredEvents.length > 0 ? (
              <div className='space-y-4'>
                {filteredEvents.map((event) => {
                  const isExpanded = expandedEventId === event.id;

                  return (
                    <article
                      key={event.id}
                      className='rounded-xl border border-[#d8dfdb] bg-white p-6 shadow-sm'
                    >
                      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-3'>
                            <h3 className='text-xl font-semibold tracking-[-0.03em] text-primary'>
                              {event.eventType}
                            </h3>
                            <span
                              className={[
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                                getEventStatusTone(event.status),
                              ].join(" ")}
                            >
                              {event.status}
                            </span>
                            {event.status === "unmatched" ? (
                              <span className='inline-flex items-center gap-1 rounded-full bg-[#fff4f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b42318]'>
                                <ShieldAlert className='h-3.5 w-3.5' />
                                Needs review
                              </span>
                            ) : null}
                          </div>

                          <p className='mt-3 break-words text-sm text-[#64748b]'>
                            Event ID: {event.eventId}
                          </p>
                          <p className='mt-1 break-words text-sm text-[#64748b]'>
                            Entity ID: {event.entityId ?? "Not available"}
                          </p>
                          <p className='mt-1 text-sm text-[#64748b]'>
                            Created {formatDateTime(event.createdAt)} |
                            Processed {formatDateTime(event.processedAt)}
                          </p>
                        </div>

                        <div className='flex flex-wrap gap-3'>
                          <div className='rounded-xl border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3'>
                            <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]'>
                              Booking Link
                            </p>
                            <p className='mt-2 text-sm font-semibold text-primary'>
                              {event.linkedBooking
                                ? event.linkedBooking.id
                                : "Unmatched"}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() =>
                              setExpandedEventId((current) =>
                                current === event.id ? null : event.id,
                              )
                            }
                            className='inline-flex items-center gap-2 rounded-[4px] border border-[#d8dfdb] px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6]'
                          >
                            {isExpanded ? "Hide payload" : "Open payload"}
                            <ChevronDown
                              className={[
                                "h-4 w-4 transition-transform",
                                isExpanded ? "rotate-180" : "",
                              ].join(" ")}
                            />
                          </button>
                        </div>
                      </div>

                      <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                        <DetailRow
                          label='Order ID'
                          value={event.linkedOrderId}
                        />
                        <DetailRow
                          label='Payment ID'
                          value={event.linkedPaymentId}
                        />
                        <DetailRow
                          label='Transfer ID'
                          value={event.linkedTransferId}
                        />
                        <DetailRow
                          label='Refund ID'
                          value={event.linkedRefundId}
                        />
                      </div>

                      {event.linkedBooking ? (
                        <div className='mt-6 rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4'>
                          <div className='flex flex-wrap items-start justify-between gap-3'>
                            <div>
                              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]'>
                                Linked Booking
                              </p>
                              <p className='mt-2 text-sm font-semibold text-primary'>
                                {event.linkedBooking.equipmentTitle}
                              </p>
                              <p className='mt-1 text-sm text-[#5c5f60]'>
                                Owner: {event.linkedBooking.ownerName} | Renter:{" "}
                                {event.linkedBooking.renterName}
                              </p>
                            </div>
                            <div className='inline-flex items-center gap-2 text-sm font-semibold text-primary'>
                              {event.linkedBooking.id}
                              <ExternalLink className='h-4 w-4' />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {isExpanded ? (
                        <div className='mt-6 space-y-4'>
                          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                            <DetailRow
                              label='Event Status'
                              value={event.status}
                            />
                            <DetailRow
                              label='Event Type'
                              value={event.eventType}
                            />
                            <DetailRow
                              label='Created At'
                              value={formatDateTime(event.createdAt)}
                            />
                            <DetailRow
                              label='Processed At'
                              value={formatDateTime(event.processedAt)}
                            />
                          </div>

                          <div className='overflow-x-auto rounded-xl border border-[#d8dfdb] bg-[#0f172a] p-4'>
                            <pre className='min-w-[320px] whitespace-pre-wrap break-words text-xs leading-6 text-[#dbeafe]'>
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className='rounded-xl border border-[#d8dfdb] bg-white p-10 text-center shadow-sm'>
                <h2 className='text-2xl font-semibold tracking-[-0.03em] text-primary'>
                  No webhook events match the current filters
                </h2>
                <p className='mt-3 text-sm leading-7 text-muted-foreground'>
                  Clear one or two filters to inspect more payment events and
                  reconciliation history.
                </p>
              </div>
            )
          ) : null}
        </section>
      ) : null}
    </section>
  );
}
