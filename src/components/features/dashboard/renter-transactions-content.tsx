"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, WalletCards } from "lucide-react";
import { useMyBookingsQuery } from "@/hooks/use-bookings";
import type { BookingSummary } from "@/lib/booking";
import { getDashboardRevealProps } from "./dashboard-motion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? "/assets/landing/landing-tractor.webp";
}

function getPaymentStateLabel(booking: BookingSummary) {
  if (booking.status === "PENDING_OWNER_APPROVAL") {
    return "Awaiting owner approval";
  }

  if (booking.status === "PENDING_RENTER_PAYMENT") {
    return "Cashfree checkout needed";
  }

  if (booking.status === "DISPUTED") {
    return "Under dispute review";
  }

  if (booking.status === "CANCELLED") {
    return "Cancelled";
  }

  if (booking.status === "COMPLETED") {
    return "Payment captured";
  }

  if (booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") {
    return booking.isPaymentCompleted ? "Payment confirmed" : "Reserved";
  }

  return "In progress";
}

function getHoldStateLabel(booking: BookingSummary) {
  if (booking.depositRefundStatus === "REFUNDED") {
    return "Refund completed";
  }

  if (booking.depositRefundStatus === "PENDING") {
    return "Admin refund pending";
  }

  if (booking.depositRefundStatus === "BLOCKED") {
    return "Blocked by dispute";
  }

  if (booking.status === "COMPLETED") {
    return "Awaiting admin refund";
  }

  if (booking.status === "DISPUTED") {
    return "Held during dispute";
  }

  if (booking.status === "CANCELLED") {
    return "No hold captured";
  }

  if (
    booking.status === "CONFIRMED" ||
    booking.status === "IN_PROGRESS" ||
    booking.status === "PENDING_RENTER_PAYMENT"
  ) {
    return booking.isPaymentCompleted ? "Hold active" : "Awaiting confirmation";
  }

  return "Not started";
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
    <article className='rounded-xl border border-[#d8dfdb] bg-white p-6 shadow-sm'>
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

export function RenterTransactionsContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const bookingsQuery = useMyBookingsQuery();
  const bookings = useMemo(
    () => bookingsQuery.data ?? [],
    [bookingsQuery.data],
  );

  const totals = useMemo(() => {
    const paidBookings = bookings.filter(
      (booking) => booking.isPaymentCompleted,
    );
    const totalSpent = paidBookings.reduce(
      (sum, booking) =>
        sum + booking.rentalFee + booking.platformFee + booking.damageWaiverFee,
      0,
    );
    const totalHolds = paidBookings.reduce(
      (sum, booking) => sum + booking.securityDeposit,
      0,
    );
    const actionNeeded = bookings.filter(
      (booking) =>
        booking.status === "PENDING_OWNER_APPROVAL" ||
        booking.status === "PENDING_RENTER_PAYMENT",
    ).length;

    return {
      totalSpent,
      totalHolds,
      actionNeeded,
    };
  }, [bookings]);

  return (
    <section className='space-y-10'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#86af99]'>
            Renter Wallet
          </p>
          <h1 className='mt-3 text-4xl font-semibold tracking-[-0.04em] text-primary md:text-5xl'>
            Transactions
          </h1>
          <p className='mt-3 max-w-3xl text-base leading-8 text-[#5c5f60]'>
            Review rental charges, marketplace fees, and manual deposit-refund
            status for every booking from one place.
          </p>
        </div>
        <div className='flex items-center gap-3 rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm'>
          <WalletCards className='h-5 w-5 text-primary' />
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]'>
              Booking Ledger
            </p>
            <p className='mt-1 text-lg font-semibold text-primary'>
              {bookings.length} entries
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-3'>
        <SummaryCard
          label='Renter Charges'
          value={formatCurrency(totals.totalSpent)}
          helper='Rental fee, platform fee, and damage waiver from bookings with confirmed payment.'
        />
        <SummaryCard
          label='Refundable Holds'
          value={formatCurrency(totals.totalHolds)}
          helper='Security deposits collected with payment and refunded manually by admin after completion if there is no issue.'
        />
        <SummaryCard
          label='Needs Action'
          value={String(totals.actionNeeded)}
          helper='Requests still waiting on an owner response or your Cashfree payment step.'
        />
      </div>

      {bookingsQuery.isPending ? (
        <div className='flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className='rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]'>
          We could not load your transaction activity right now.
        </div>
      ) : null}

      {!bookingsQuery.isPending && !bookingsQuery.isError ? (
        bookings.length > 0 ? (
          <div className='overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm'>
            <div className='overflow-x-auto'>
              <table className='min-w-full border-collapse'>
                <thead className='bg-[#f8faf7]'>
                  <tr>
                    {[
                      "Booking",
                      "Dates",
                      "Rental Fee",
                      "Platform Fee",
                      "Damage Waiver",
                      "Refundable Hold",
                      "Payment State",
                      "Hold Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]'
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#edf1ee]'>
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      {...getDashboardRevealProps(shouldReduceMotion, index)}
                      className='align-top transition-colors hover:bg-[#fbfcfa]'
                    >
                      <td className='px-6 py-5'>
                        <div className='flex min-w-[250px] items-start gap-4'>
                          <div className='relative h-14 w-14 overflow-hidden rounded-lg bg-[#eef2ed]'>
                            <Image
                              src={getImageSrc(booking)}
                              alt={booking.equipment.title}
                              fill
                              className='object-cover'
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className='text-base font-semibold text-primary'>
                              {booking.equipment.title}
                            </p>
                            <p className='mt-1 text-sm text-[#64748b]'>
                              {booking.owner.fullName}
                            </p>
                            <p className='mt-1 text-xs uppercase tracking-[0.18em] text-[#94a3b8]'>
                              {booking.status.replaceAll("_", " ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-5 text-sm leading-6 text-[#475569]'>
                        {formatDateRange(booking.startDate, booking.endDate)}
                      </td>
                      <td className='px-6 py-5 text-sm font-semibold text-primary'>
                        {formatCurrency(booking.rentalFee)}
                      </td>
                      <td className='px-6 py-5 text-sm text-[#475569]'>
                        {formatCurrency(booking.platformFee)}
                      </td>
                      <td className='px-6 py-5 text-sm text-[#475569]'>
                        {formatCurrency(booking.damageWaiverFee)}
                      </td>
                      <td className='px-6 py-5 text-sm font-semibold text-primary'>
                        {formatCurrency(booking.securityDeposit)}
                      </td>
                      <td className='px-6 py-5 text-sm text-[#475569]'>
                        {getPaymentStateLabel(booking)}
                      </td>
                      <td className='px-6 py-5 text-sm text-[#475569]'>
                        {getHoldStateLabel(booking)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className='rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-16 text-center'>
            <h2 className='text-2xl font-semibold tracking-[-0.03em] text-primary'>
              No transaction activity yet
            </h2>
            <p className='mt-3 text-sm leading-7 text-[#5c5f60]'>
              Once you start sending rental requests, your fees, holds, and
              booking-linked payment states will show up here, including manual
              refund progress.
            </p>
          </div>
        )
      ) : null}
    </section>
  );
}
