'use client';

import { DashboardPaginationControls } from './dashboard-pagination-controls';
import {
  useAdminBookingsPageQuery,
  useAdminBookingsQuery,
  useMarkDepositRefundedMutation,
  useMarkOwnerPayoutPaidMutation
} from '@/hooks/use-bookings';
import {
  useAdminPaymentEventsPageQuery,
  useAdminPaymentEventsQuery
} from '@/hooks/use-payments';
import type {
  BookingSummary,
  BookingStatus,
  DepositRefundStatus,
  FinancialStatus,
  OwnerPayoutStatus
} from '@/lib/booking';
import { ApiError } from '@/lib/http';
import type { AdminPaymentEvent } from '@/lib/payment';
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  ChevronDown,
  ExternalLink,
  CreditCard,
  Loader2,
  Layers3,
  ReceiptText,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRightLeftIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { useDeferredValue, useMemo, useState } from 'react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatDateRange(startDate: string, endDate: string) {
  return `From: ${startDate}  To: ${endDate}`;
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? '/assets/landing/landing-tractor.webp';
}

function normalizeLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function isDepositResolved(status: DepositRefundStatus) {
  return status === 'REFUNDED' || status === 'SKIPPED';
}

function bookingNeedsAction(booking: BookingSummary) {
  return (
    booking.isPaymentCompleted &&
    (booking.status === 'COMPLETED' || booking.status === 'DISPUTED') &&
    (booking.ownerPayoutStatus !== 'PAID' ||
      !isDepositResolved(booking.depositRefundStatus))
  );
}

function getOwnerPayoutLabel(booking: BookingSummary) {
  switch (booking.ownerPayoutStatus) {
    case 'PAID':
      return 'Paid';
    case 'PENDING':
      return 'Awaiting admin payout';
    case 'BLOCKED':
      return 'Blocked by dispute';
    default:
      return booking.isPaymentCompleted
        ? 'Will start after completion'
        : 'Not ready';
  }
}

function getDepositRefundLabel(booking: BookingSummary) {
  switch (booking.depositRefundStatus) {
    case 'REFUNDED':
      return 'Refunded';
    case 'SKIPPED':
      return 'Refund skipped';
    case 'PENDING':
      return 'Awaiting admin refund';
    case 'BLOCKED':
      return 'Blocked by dispute';
    default:
      return booking.isPaymentCompleted
        ? 'Will start after completion'
        : 'Not ready';
  }
}

function getFinancialTone(status: FinancialStatus) {
  switch (status) {
    case 'PAYMENT_CAPTURED':
      return 'border-[#cce8d6] bg-[#eefaf2] text-[#166534]';
    case 'MANUAL_SETTLEMENT_PENDING':
      return 'border-[#f6dfb0] bg-[#fff8e7] text-[#9a6700]';
    case 'MANUAL_SETTLEMENT_COMPLETE':
      return 'border-[#d8dfdb] bg-[#f5f8f5] text-primary';
    case 'PAYMENT_FAILED':
      return 'border-[#f5c2c7] bg-[#fff1f2] text-[#b42318]';
    case 'DISPUTED':
      return 'border-[#f7c4cf] bg-[#fff0f4] text-[#9f1239]';
    default:
      return 'border-[#d8dfdb] bg-[#f8faf7] text-primary';
  }
}

function getBookingStatusTone(status: BookingStatus) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-[#eefaf2] text-[#166534]';
    case 'COMPLETED':
      return 'bg-[#eefaf2] text-[#166534]';
    case 'DISPUTED':
      return 'bg-[#fff0f4] text-[#9f1239]';
    case 'CANCELLED':
      return 'bg-[#f8fafc] text-[#475569]';
    default:
      return 'bg-[#eef2ed] text-primary';
  }
}

function getEventStatusTone(status: AdminPaymentEvent['status']) {
  switch (status) {
    case 'processed':
      return 'bg-[#eefaf2] text-[#166534]';
    case 'unprocessed':
      return 'bg-[#fff7ed] text-[#9a6700]';
    case 'unmatched':
      return 'bg-[#fff1f2] text-[#b42318]';
    default:
      return 'bg-[#eef2ed] text-primary';
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

function SummaryCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-xl border border-[#d8dfdb] bg-emerald-800/5 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary">
        {value}
      </p>
      <p className="mt-2 text-sm  text-[#5c5f60]">{helper}</p>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-[#e5ebe6] bg-white/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm text-primary">
        {value || 'Not available'}
      </p>
    </div>
  );
}

function TransactionMetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#edf1ed] bg-[#fcfdfb] p-2 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-center gap-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8f4] text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="text-[11px] text-wrap font-semibold uppercase tracking-widest text-[#6d7886]">
          {label}
        </p>
      </div>
      <p className="ml-3 text-left wrap-break-word text-nowrap truncate text-sm md:text-base font-semibold tracking-[-0.03em] text-primary">
        {value}
      </p>
    </div>
  );
}

function TransactionInfoCard({
  icon: Icon,
  label,
  title,
  description
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#edf1ed] bg-[#fbfcfa] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
        {label}
      </p>
      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-[-0.02em] text-primary">
            {title}
          </p>
          <p className="mt-1 text-sm font-display font-medium text-[#5c5f60]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

const bookingStatusOptions: Array<'ALL' | BookingStatus> = [
  'ALL',
  'PENDING_OWNER_APPROVAL',
  'PENDING_RENTER_PAYMENT',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED'
];

const financialStatusOptions: Array<'ALL' | FinancialStatus> = [
  'ALL',
  'PAYMENT_CAPTURED',
  'MANUAL_SETTLEMENT_PENDING',
  'MANUAL_SETTLEMENT_COMPLETE',
  'PAYMENT_FAILED',
  'DISPUTED',
  'PAYMENT_PENDING',
  'PAYMENT_PROCESSING',
  'NONE'
];

const ownerPayoutOptions: Array<'ALL' | OwnerPayoutStatus> = [
  'ALL',
  'PENDING',
  'PAID',
  'BLOCKED',
  'NONE'
];

const depositRefundOptions: Array<'ALL' | DepositRefundStatus> = [
  'ALL',
  'PENDING',
  'REFUNDED',
  'SKIPPED',
  'BLOCKED',
  'NONE'
];

type TransactionTab = 'ledger' | 'raw';

export function AdminTransactionsContent() {
  const [ledgerPage, setLedgerPage] = useState(1);
  const [rawPage, setRawPage] = useState(1);
  const markOwnerPaidMutation = useMarkOwnerPayoutPaidMutation();
  const markDepositRefundedMutation = useMarkDepositRefundedMutation();

  const [activeTab, setActiveTab] = useState<TransactionTab>('ledger');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    null
  );
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'ALL' | BookingStatus
  >('ALL');
  const [financialStatusFilter, setFinancialStatusFilter] = useState<
    'ALL' | FinancialStatus
  >('ALL');
  const [ownerPayoutFilter, setOwnerPayoutFilter] = useState<
    'ALL' | OwnerPayoutStatus
  >('ALL');
  const [depositRefundFilter, setDepositRefundFilter] = useState<
    'ALL' | DepositRefundStatus
  >('ALL');
  const [needsActionFilter, setNeedsActionFilter] = useState<
    'ALL' | 'ONLY_ACTION'
  >('ALL');
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [eventStatusFilter, setEventStatusFilter] = useState<
    'ALL' | AdminPaymentEvent['status']
  >('ALL');
  const [eventLinkFilter, setEventLinkFilter] = useState<
    'ALL' | 'LINKED' | 'UNLINKED'
  >('ALL');

  const deferredBookingSearch = useDeferredValue(bookingSearchTerm);
  const deferredEventSearch = useDeferredValue(eventSearchTerm);
  const bookingTotalsQuery = useAdminBookingsQuery();
  const paymentEventTotalsQuery = useAdminPaymentEventsQuery();
  const bookingsQuery = useAdminBookingsPageQuery({
    page: ledgerPage,
    pageSize: 10,
    search: deferredBookingSearch,
    status: bookingStatusFilter,
    financialStatus: financialStatusFilter,
    ownerPayoutStatus: ownerPayoutFilter,
    depositRefundStatus: depositRefundFilter,
    needsAction: needsActionFilter
  });
  const paymentEventsQuery = useAdminPaymentEventsPageQuery({
    page: rawPage,
    pageSize: 10,
    search: deferredEventSearch,
    eventType: eventTypeFilter === 'ALL' ? undefined : eventTypeFilter,
    status: eventStatusFilter,
    linkState: eventLinkFilter
  });

  const bookings = useMemo(
    () => bookingsQuery.data?.items ?? [],
    [bookingsQuery.data]
  );
  const paymentEvents = useMemo(
    () => paymentEventsQuery.data?.items ?? [],
    [paymentEventsQuery.data]
  );
  const allBookings = useMemo(
    () => bookingTotalsQuery.data ?? [],
    [bookingTotalsQuery.data]
  );
  const allPaymentEvents = useMemo(
    () => paymentEventTotalsQuery.data ?? [],
    [paymentEventTotalsQuery.data]
  );

  const eventTypes = useMemo(
    () =>
      Array.from(
        new Set(allPaymentEvents.map((event) => event.eventType))
      ).sort(),
    [allPaymentEvents]
  );
  const filteredBookings = bookings;
  const filteredEvents = paymentEvents;

  const totals = useMemo(() => {
    const actionableBookings = allBookings.filter(bookingNeedsAction);
    const capturedValue = allBookings
      .filter((booking) => booking.isPaymentCompleted)
      .reduce((sum, booking) => sum + booking.totalAuthorized, 0);

    return {
      capturedValue,
      pendingOwnerPayout: actionableBookings.filter(
        (booking) => booking.ownerPayoutStatus !== 'PAID'
      ).length,
      pendingDepositRefund: actionableBookings.filter(
        (booking) => !isDepositResolved(booking.depositRefundStatus)
      ).length,
      failedPayments: allBookings.filter(
        (booking) => booking.financialStatus === 'PAYMENT_FAILED'
      ).length,
      disputedTransactions: allBookings.filter(
        (booking) =>
          booking.status === 'DISPUTED' ||
          booking.financialStatus === 'DISPUTED'
      ).length,
      unmatchedWebhookEvents: allPaymentEvents.filter(
        (event) => event.status === 'unmatched'
      ).length,
      actionableBookings: actionableBookings.length
    };
  }, [allBookings, allPaymentEvents]);

  async function handleMarkOwnerPaid(bookingId: string) {
    setFeedback(null);
    setErrorMessage(null);

    try {
      await markOwnerPaidMutation.mutateAsync({
        bookingId,
        input: { reference: references[bookingId]?.trim() || undefined }
      });
      setFeedback('Owner payout recorded successfully.');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to record owner payout.'
      );
    }
  }

  async function handleMarkDepositRefunded(bookingId: string) {
    setFeedback(null);
    setErrorMessage(null);

    try {
      await markDepositRefundedMutation.mutateAsync({
        bookingId,
        input: { reference: references[bookingId]?.trim() || undefined }
      });
      setFeedback('Deposit refund recorded successfully.');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to record deposit refund.'
      );
    }
  }

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Admin Finance
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            Transactions
          </h1>
          <p className="mt-3 max-w-3xl text-sm  text-[#5c5f60] sm:text-base">
            Review booking-level money flow first, then inspect raw Cashfree
            webhook events for reconciliation, debugging, and payout follow-up.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm">
          <ReceiptText className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Needs Action
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {totals.actionableBookings} bookings
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Captured Payment Value"
          value={formatCurrency(totals.capturedValue)}
          helper="Total renter payment value already captured on the platform."
        />
        <SummaryCard
          label="Owner Payouts Pending"
          value={String(totals.pendingOwnerPayout)}
          helper="Completed or disputed bookings still waiting for owner settlement recording."
        />
        <SummaryCard
          label="Deposit Refunds Pending"
          value={String(totals.pendingDepositRefund)}
          helper="Security deposits that still need refund confirmation from admin."
        />
        <SummaryCard
          label="Failed Payments"
          value={String(totals.failedPayments)}
          helper="Bookings where payment failed and may need support or retry guidance."
        />
        <SummaryCard
          label="Disputed Transactions"
          value={String(totals.disputedTransactions)}
          helper="Bookings currently blocked by dispute-driven financial review."
        />
        <SummaryCard
          label="Unmatched Webhook Events"
          value={String(totals.unmatchedWebhookEvents)}
          helper="Processed payment events that do not currently resolve back to a booking."
        />
      </div>

      {feedback ? (
        <div className="rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-5 py-4 text-sm font-medium text-primary">
          {feedback}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm font-medium text-[#b42318]">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#d8dfdb] bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={[
              'rounded-xl px-5 py-3 text-left text-sm font-semibold transition-colors',
              activeTab === 'ledger'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-transparent text-primary hover:bg-[#f5f8f5]'
            ].join(' ')}>
            Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={[
              'rounded-xl px-5 py-3 text-left text-sm font-semibold transition-colors',
              activeTab === 'raw'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-transparent text-primary hover:bg-[#f5f8f5]'
            ].join(' ')}>
            Raw Events
          </button>
        </div>
      </div>

      {activeTab === 'ledger' ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                Booking Ledger
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary">
                Booking-centric transaction operations
              </h2>
            </div>
            <p className="text-sm text-[#5c5f60]">
              Sorted by the latest meaningful payment, payout, refund, or
              dispute activity.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-6">
            <label className="flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-[#64748b] md:col-span-2 xl:col-span-2">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={bookingSearchTerm}
                onChange={(event) => {
                  setBookingSearchTerm(event.target.value);
                  setLedgerPage(1);
                }}
                placeholder="Search booking, equipment, owner, renter, order or payment id"
                className="w-full bg-transparent outline-none placeholder:text-[#94a3b8]"
              />
            </label>

            <select
              value={bookingStatusFilter}
              onChange={(event) => {
                setBookingStatusFilter(
                  event.target.value as 'ALL' | BookingStatus
                );
                setLedgerPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              {bookingStatusOptions.map((option) => (
                <option
                  key={option}
                  value={option}>
                  {option === 'ALL'
                    ? 'All booking statuses'
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={financialStatusFilter}
              onChange={(event) => {
                setFinancialStatusFilter(
                  event.target.value as 'ALL' | FinancialStatus
                );
                setLedgerPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              {financialStatusOptions.map((option) => (
                <option
                  key={option}
                  value={option}>
                  {option === 'ALL'
                    ? 'All financial states'
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={ownerPayoutFilter}
              onChange={(event) => {
                setOwnerPayoutFilter(
                  event.target.value as 'ALL' | OwnerPayoutStatus
                );
                setLedgerPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              {ownerPayoutOptions.map((option) => (
                <option
                  key={option}
                  value={option}>
                  {option === 'ALL'
                    ? 'All payout states'
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={depositRefundFilter}
              onChange={(event) => {
                setDepositRefundFilter(
                  event.target.value as 'ALL' | DepositRefundStatus
                );
                setLedgerPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              {depositRefundOptions.map((option) => (
                <option
                  key={option}
                  value={option}>
                  {option === 'ALL'
                    ? 'All refund states'
                    : normalizeLabel(option)}
                </option>
              ))}
            </select>

            <select
              value={needsActionFilter}
              onChange={(event) => {
                setNeedsActionFilter(
                  event.target.value as 'ALL' | 'ONLY_ACTION'
                );
                setLedgerPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none md:col-span-2 xl:col-span-2">
              <option value="ALL">All ledger items</option>
              <option value="ONLY_ACTION">Needs action only</option>
            </select>
          </div>

          {bookingsQuery.isPending ? (
            <div className="flex min-h-60 items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}

          {bookingsQuery.isError ? (
            <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]">
              We could not load the booking transaction ledger right now.
            </div>
          ) : null}

          {!bookingsQuery.isPending && !bookingsQuery.isError ? (
            filteredBookings.length > 0 ? (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const isMutating =
                    markOwnerPaidMutation.isPending ||
                    markDepositRefundedMutation.isPending;
                  const isExpanded = expandedBookingId === booking.id;

                  return (
                    <article
                      key={booking.id}
                      className="overflow-hidden rounded-[28px] border border-[#e6ece7] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
                      <div className="grid xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="relative min-h-80 overflow-hidden bg-[#f5f7f4] xl:min-h-full">
                          <Image
                            src={getImageSrc(booking)}
                            loading="lazy"
                            alt={booking.equipment.title}
                            fill
                            className="object-cover object-center"
                            unoptimized
                          />
                          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
                            <BadgeCheck className="h-4 w-4 text-[#166534]" />
                            {normalizeLabel(booking.status)}
                          </div>
                        </div>

                        <div className="p-6 md:p-8 xl:p-10">
                          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0 space-y-3">
                              <h3 className="text-xl md:text-2xl font-semibold tracking-[-0.04em] text-primary">
                                {booking.equipment.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={[
                                    'inline-flex shadow-sm items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]',
                                    getBookingStatusTone(booking.status)
                                  ].join(' ')}>
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {normalizeLabel(booking.status)}
                                </span>
                                <span
                                  className={[
                                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]',
                                    getFinancialTone(booking.financialStatus)
                                  ].join(' ')}>
                                  <CreditCard className="h-3.5 w-3.5" />
                                  {normalizeLabel(booking.financialStatus)}
                                </span>
                              </div>

                              <div className="space-y-1 text-sm text-[#64748b]">
                                <p>
                                  {' '}
                                  <strong>Booking ID</strong>: {booking.id}
                                </p>
                                <div className="flex items-center gap-x-2">
                                  <p>
                                    <strong>Owner</strong>:{' '}
                                    {booking.owner.fullName}
                                  </p>
                                  <ArrowRightLeftIcon className="size-4" />
                                  <p>
                                    <strong>Renter</strong>:{' '}
                                    {booking.renter.fullName}
                                  </p>
                                </div>
                                <p className="text-gray-600 font-medium">
                                  {formatDateRange(
                                    booking.startDate,
                                    booking.endDate
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#edf1ed] bg-[#fbfcfa] px-4 py-4 shadow-sm xl:min-w-55">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                                Last Activity
                              </p>
                              <div className="mt-3 flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                  <CalendarClock className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                  <p className="text-base font-semibold tracking-[-0.02em] text-primary">
                                    {formatDateTime(
                                      getLastTransactionTimestamp(booking)
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                            <TransactionMetricCard
                              icon={CreditCard}
                              label="Total Paid"
                              value={formatCurrency(booking.totalAuthorized)}
                            />
                            <TransactionMetricCard
                              icon={ReceiptText}
                              label="Rental Fee"
                              value={formatCurrency(booking.rentalFee)}
                            />
                            <TransactionMetricCard
                              icon={Layers3}
                              label="Platform Fee"
                              value={formatCurrency(booking.platformFee)}
                            />
                            <TransactionMetricCard
                              icon={Shield}
                              label="Damage Waiver"
                              value={formatCurrency(booking.damageWaiverFee)}
                            />
                            <TransactionMetricCard
                              icon={Banknote}
                              label="Security Deposit"
                              value={formatCurrency(booking.securityDeposit)}
                            />
                            <TransactionMetricCard
                              icon={BadgeCheck}
                              label="Provider"
                              value={
                                booking.paymentProvider?.toUpperCase() ??
                                'Manual / None'
                              }
                            />
                          </div>

                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <TransactionInfoCard
                              icon={CreditCard}
                              label="Owner Payout"
                              title={getOwnerPayoutLabel(booking)}
                              description={
                                booking.ownerPaidAt
                                  ? `Recorded at ${formatDateTime(booking.ownerPaidAt)}`
                                  : 'Record this after you send money to the owner manually.'
                              }
                            />
                            <TransactionInfoCard
                              icon={Shield}
                              label="Deposit Refund"
                              title={getDepositRefundLabel(booking)}
                              description={
                                booking.depositRefundedAt
                                  ? `Recorded at ${formatDateTime(booking.depositRefundedAt)}`
                                  : "Record this after you return the renter's security deposit manually."
                              }
                            />
                          </div>

                          <div className="mt-6">
                            <input
                              value={references[booking.id] ?? ''}
                              onChange={(event) =>
                                setReferences((current) => ({
                                  ...current,
                                  [booking.id]: event.target.value
                                }))
                              }
                              placeholder="Optional payout or refund reference, bank note, UPI ref, etc."
                              className="w-full rounded-2xl border border-[#e5ebe6] bg-[#fcfdfb] px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary"
                            />
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleMarkOwnerPaid(booking.id)}
                              disabled={
                                isMutating ||
                                booking.ownerPayoutStatus === 'PAID'
                              }
                              className="rounded-full bg-[#1b4332] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                              Mark Owner Paid
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkDepositRefunded(booking.id)
                              }
                              disabled={
                                isMutating ||
                                isDepositResolved(booking.depositRefundStatus)
                              }
                              className="rounded-full border border-[#dbe3dd] bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70">
                              Mark Deposit Refunded
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedBookingId((current) =>
                                  current === booking.id ? null : booking.id
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-full bg-[#f3f6f3] px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#eaf1eb]">
                              {isExpanded ? 'Hide details' : 'Open details'}
                              <ChevronDown
                                className={[
                                  'h-4 w-4 transition-transform',
                                  isExpanded ? 'rotate-180' : ''
                                ].join(' ')}
                              />
                            </button>
                          </div>

                          {isExpanded ? (
                            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e6ece7] bg-[#fbfcfa] p-5 md:grid-cols-2 xl:grid-cols-3">
                              <DetailRow
                                label="Cashfree Order ID"
                                value={booking.cashfreeOrderId}
                              />
                              <DetailRow
                                label="Cashfree Payment ID"
                                value={booking.cashfreePaymentId}
                              />
                              <DetailRow
                                label="Payment Session ID"
                                value={booking.cashfreePaymentSessionId}
                              />
                              <DetailRow
                                label="Payment Authorization ID"
                                value={booking.paymentAuthorizationId}
                              />
                              <DetailRow
                                label="Payment Intent ID"
                                value={booking.paymentIntentId}
                              />
                              <DetailRow
                                label="Payout Linked Account ID"
                                value={booking.payoutLinkedAccountId}
                              />
                              <DetailRow
                                label="Owner Payout Reference"
                                value={booking.ownerPayoutReference}
                              />
                              <DetailRow
                                label="Deposit Refund Reference"
                                value={booking.depositRefundReference}
                              />
                              <DetailRow
                                label="Last Payment Error"
                                value={booking.lastPaymentError}
                              />
                              <DetailRow
                                label="Payment Captured At"
                                value={formatDateTime(
                                  booking.paymentCapturedAt
                                )}
                              />
                              <DetailRow
                                label="Payment Failed At"
                                value={formatDateTime(booking.paymentFailedAt)}
                              />
                              <DetailRow
                                label="Owner Paid At"
                                value={formatDateTime(booking.ownerPaidAt)}
                              />
                              <DetailRow
                                label="Deposit Refunded At"
                                value={formatDateTime(
                                  booking.depositRefundedAt
                                )}
                              />
                              <DetailRow
                                label="Disputed At"
                                value={formatDateTime(booking.disputedAt)}
                              />
                              <DetailRow
                                label="Cancelled At"
                                value={formatDateTime(booking.cancelledAt)}
                              />
                              <DetailRow
                                label="Completed At"
                                value={formatDateTime(booking.completedAt)}
                              />
                              <DetailRow
                                label="Created At"
                                value={formatDateTime(booking.createdAt)}
                              />
                              <DetailRow
                                label="Updated At"
                                value={formatDateTime(booking.updatedAt)}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {bookingsQuery.data ? (
                  <DashboardPaginationControls
                    page={bookingsQuery.data.page}
                    totalPages={bookingsQuery.data.totalPages}
                    totalItems={bookingsQuery.data.totalItems}
                    pageSize={bookingsQuery.data.pageSize}
                    onPageChange={setLedgerPage}
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-16 text-center">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                  No bookings match the current ledger filters
                </h2>
                <p className="mt-3 text-sm  text-[#5c5f60]">
                  Try broadening the search or clearing a few filters to inspect
                  more transaction records.
                </p>
              </div>
            )
          ) : null}
        </section>
      ) : null}

      {activeTab === 'raw' ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                Raw Event Log
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-primary">
                Cashfree webhook trail
              </h2>
            </div>
            <p className="text-sm text-[#5c5f60]">
              Newest events first, with client-side filtering for faster admin
              debugging.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-[#64748b] md:col-span-2 xl:col-span-2">
              <Search className="h-4 w-4 shrink-0" />
              <input
                value={eventSearchTerm}
                onChange={(event) => {
                  setEventSearchTerm(event.target.value);
                  setRawPage(1);
                }}
                placeholder="Search event id, type, entity, booking, payment or order id"
                className="w-full bg-transparent outline-none placeholder:text-[#94a3b8]"
              />
            </label>

            <select
              value={eventTypeFilter}
              onChange={(event) => {
                setEventTypeFilter(event.target.value);
                setRawPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              <option value="ALL">All event types</option>
              {eventTypes.map((eventType) => (
                <option
                  key={eventType}
                  value={eventType}>
                  {eventType}
                </option>
              ))}
            </select>

            <select
              value={eventStatusFilter}
              onChange={(event) => {
                setEventStatusFilter(
                  event.target.value as 'ALL' | AdminPaymentEvent['status']
                );
                setRawPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none">
              <option value="ALL">All event statuses</option>
              <option value="processed">Processed</option>
              <option value="unprocessed">Unprocessed</option>
              <option value="unmatched">Unmatched</option>
            </select>

            <select
              value={eventLinkFilter}
              onChange={(event) => {
                setEventLinkFilter(
                  event.target.value as 'ALL' | 'LINKED' | 'UNLINKED'
                );
                setRawPage(1);
              }}
              className="rounded-lg border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3 text-sm text-primary outline-none md:col-span-2 xl:col-span-2">
              <option value="ALL">All link states</option>
              <option value="LINKED">Linked to booking</option>
              <option value="UNLINKED">Unlinked / unmatched</option>
            </select>
          </div>

          {paymentEventsQuery.isPending ? (
            <div className="flex min-h-55 items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}

          {paymentEventsQuery.isError ? (
            <div className="rounded-xl border border-[#ffd9d4] bg-[#fff4f2] p-8 shadow-sm">
              <div className="flex items-center gap-3 text-[#7a120c]">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-xl font-semibold tracking-[-0.03em]">
                  We couldn&apos;t load the webhook event log
                </h2>
              </div>
              <p className="mt-3 max-w-2xl text-sm  text-[#7a120c]">
                Retry in a moment. The raw event stream is used for
                reconciliation and payment debugging.
              </p>
            </div>
          ) : null}

          {!paymentEventsQuery.isPending && !paymentEventsQuery.isError ? (
            filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const isExpanded = expandedEventId === event.id;

                  return (
                    <article
                      key={event.id}
                      className="rounded-xl border border-[#d8dfdb] bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-semibold tracking-[-0.03em] text-primary">
                              {event.eventType}
                            </h3>
                            <span
                              className={[
                                'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                                getEventStatusTone(event.status)
                              ].join(' ')}>
                              {event.status}
                            </span>
                            {event.status === 'unmatched' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#b42318]">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Needs review
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 wrap-break-word text-sm text-[#64748b]">
                            Event ID: {event.eventId}
                          </p>
                          <p className="mt-1 wrap-break-word text-sm text-[#64748b]">
                            Entity ID: {event.entityId ?? 'Not available'}
                          </p>
                          <p className="mt-1 text-sm text-[#64748b]">
                            Created {formatDateTime(event.createdAt)} |
                            Processed {formatDateTime(event.processedAt)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl border border-[#d8dfdb] bg-[#fbfcfa] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
                              Booking Link
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary">
                              {event.linkedBooking
                                ? event.linkedBooking.id
                                : 'Unmatched'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedEventId((current) =>
                                current === event.id ? null : event.id
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-[#d8dfdb] px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6]">
                            {isExpanded ? 'Hide payload' : 'Open payload'}
                            <ChevronDown
                              className={[
                                'h-4 w-4 transition-transform',
                                isExpanded ? 'rotate-180' : ''
                              ].join(' ')}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <DetailRow
                          label="Order ID"
                          value={event.linkedOrderId}
                        />
                        <DetailRow
                          label="Payment ID"
                          value={event.linkedPaymentId}
                        />
                      </div>

                      {event.linkedBooking ? (
                        <div className="mt-6 rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                                Linked Booking
                              </p>
                              <p className="mt-2 text-sm font-semibold text-primary">
                                {event.linkedBooking.equipmentTitle}
                              </p>
                              <p className="mt-1 text-sm text-[#5c5f60]">
                                Owner: {event.linkedBooking.ownerName} | Renter:{' '}
                                {event.linkedBooking.renterName}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                              {event.linkedBooking.id}
                              <ExternalLink className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {isExpanded ? (
                        <div className="mt-6 space-y-4">
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <DetailRow
                              label="Event Status"
                              value={event.status}
                            />
                            <DetailRow
                              label="Event Type"
                              value={event.eventType}
                            />
                            <DetailRow
                              label="Created At"
                              value={formatDateTime(event.createdAt)}
                            />
                            <DetailRow
                              label="Processed At"
                              value={formatDateTime(event.processedAt)}
                            />
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-[#d8dfdb] bg-[#0f172a] p-4">
                            <pre className="min-w-[320px] whitespace-pre-wrap wrap-break-word text-xs  text-[#dbeafe]">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
                {paymentEventsQuery.data ? (
                  <DashboardPaginationControls
                    page={paymentEventsQuery.data.page}
                    totalPages={paymentEventsQuery.data.totalPages}
                    totalItems={paymentEventsQuery.data.totalItems}
                    pageSize={paymentEventsQuery.data.pageSize}
                    onPageChange={setRawPage}
                  />
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-[#d8dfdb] bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                  No webhook events match the current filters
                </h2>
                <p className="mt-3 text-sm  text-muted-foreground">
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
