'use client';

import { getDashboardRevealProps } from './dashboard-motion';
import { DashboardPaginationControls } from './dashboard-pagination-controls';
import {
  useOwnerBookingsPageQuery,
  useOwnerBookingsQuery
} from '@/hooks/use-bookings';
import type { BookingSummary } from '@/lib/booking';
import { Loader2, Landmark, ShieldAlert } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useMemo, useState } from 'react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? '/assets/landing/landing-tractor.webp';
}

function getPayoutLabel(booking: BookingSummary) {
  switch (booking.ownerPayoutStatus) {
    case 'PAID':
      return 'Paid out';
    case 'BLOCKED':
      return 'Blocked by dispute';
    case 'PENDING':
      return 'Awaiting admin payout';
    default:
      return booking.isPaymentCompleted
        ? 'Waiting for completion'
        : 'Payment not captured';
  }
}

function getDepositLabel(booking: BookingSummary) {
  switch (booking.depositRefundStatus) {
    case 'REFUNDED':
      return 'Deposit refunded';
    case 'BLOCKED':
      return 'Deposit blocked';
    case 'PENDING':
      return 'Refund pending';
    case 'SKIPPED':
      return 'Refund skipped';
    default:
      return booking.isPaymentCompleted ? 'No refund action yet' : 'Not funded';
  }
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
    <article className="rounded-xl border border-[#d8dfdb] bg-white p-6 shadow-sm">
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

export function OwnerTransactionsContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [page, setPage] = useState(1);
  const bookingsQuery = useOwnerBookingsPageQuery({ page, pageSize: 10 });
  const bookingTotalsQuery = useOwnerBookingsQuery();
  const bookings = useMemo(
    () => bookingsQuery.data?.items ?? [],
    [bookingsQuery.data]
  );
  const allBookings = useMemo(
    () => bookingTotalsQuery.data ?? [],
    [bookingTotalsQuery.data]
  );

  const totals = useMemo(() => {
    const paidBookings = allBookings.filter(
      (booking) => booking.isPaymentCompleted
    );
    const totalRentalRevenue = paidBookings.reduce(
      (sum, booking) => sum + booking.rentalFee,
      0
    );
    const pendingPayoutValue = allBookings
      .filter(
        (booking) =>
          booking.isPaymentCompleted &&
          booking.ownerPayoutStatus !== 'PAID' &&
          booking.status !== 'CANCELLED'
      )
      .reduce((sum, booking) => sum + booking.rentalFee, 0);
    const blockedBookings = allBookings.filter(
      (booking) =>
        booking.ownerPayoutStatus === 'BLOCKED' ||
        booking.depositRefundStatus === 'BLOCKED' ||
        booking.status === 'DISPUTED'
    ).length;

    return {
      totalRentalRevenue,
      pendingPayoutValue,
      blockedBookings
    };
  }, [allBookings]);

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]">
            Owner Finance
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-primary sm:text-4xl xl:text-5xl">
            Transactions
          </h1>
          <p className="mt-3 max-w-3xl text-base  text-[#5c5f60]">
            Track captured renter payments, owner payout progress, and
            deposit-refund state across your bookings.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm">
          <Landmark className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Booking Revenue
            </p>
            <p className="mt-1 text-lg font-semibold text-primary">
              {bookingsQuery.data?.totalItems ?? bookings.length} records
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SummaryCard
          label="Rental Revenue"
          value={formatCurrency(totals.totalRentalRevenue)}
          helper="Rental fee totals from bookings whose payment has already been captured."
        />
        <SummaryCard
          label="Pending Payout Value"
          value={formatCurrency(totals.pendingPayoutValue)}
          helper="Revenue still waiting on admin payout recording or dispute resolution."
        />
        <SummaryCard
          label="Flagged Bookings"
          value={String(totals.blockedBookings)}
          helper="Bookings with disputed or blocked financial settlement states."
        />
      </div>

      {bookingsQuery.isPending ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]">
          We could not load your transaction activity right now.
        </div>
      ) : null}

      {!bookingsQuery.isPending && !bookingsQuery.isError ? (
        bookings.length > 0 ? (
          <>
            <div className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#f8faf7]">
                    <tr>
                      {[
                        'Booking',
                        'Dates',
                        'Rental Fee',
                        'Total Captured',
                        'Payout Status',
                        'Deposit Status',
                        'Financial State'
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1ee]">
                    {bookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        {...getDashboardRevealProps(shouldReduceMotion, index)}
                        className="align-top transition-colors hover:bg-[#fbfcfa]">
                        <td className="px-6 py-5">
                          <div className="flex min-w-[260px] items-start gap-4">
                            <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[#eef2ed]">
                              <Image
                                src={getImageSrc(booking)}
                                alt={booking.equipment.title}
                                fill
                                loading={'lazy'}
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-primary">
                                {booking.equipment.title}
                              </p>
                              <p className="mt-1 text-sm text-[#64748b]">
                                Renter: {booking.renter.fullName}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#94a3b8]">
                                {booking.status.replaceAll('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm  text-[#475569]">
                          {formatDateRange(booking.startDate, booking.endDate)}
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-primary">
                          {formatCurrency(booking.rentalFee)}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475569]">
                          {formatCurrency(booking.totalAuthorized)}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475569]">
                          {getPayoutLabel(booking)}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475569]">
                          {getDepositLabel(booking)}
                        </td>
                        <td className="px-6 py-5 text-sm text-[#475569]">
                          {booking.financialStatus.replaceAll('_', ' ')}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <DashboardPaginationControls
              page={bookingsQuery.data.page}
              totalPages={bookingsQuery.data.totalPages}
              totalItems={bookingsQuery.data.totalItems}
              pageSize={bookingsQuery.data.pageSize}
              onPageChange={setPage}
              className="m-6 mt-0 border-0 bg-[#f8faf7] shadow-none"
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
            Booking payout and settlement activity will appear here once renters
            start paying for your approved bookings.
          </div>
        )
      ) : null}

      <div className="rounded-xl border border-[#d8dfdb] bg-[#f8faf7] p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">
              Settlement note
            </p>
            <p className="mt-2 text-sm  text-[#5c5f60]">
              Owner payouts and security-deposit refunds are still
              admin-recorded settlement actions in this build, so disputed or
              completed bookings may remain pending until operations marks them
              as paid or refunded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
