"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";
import { motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  useApproveBookingMutation,
  useCompleteOwnerBookingMutation,
  useDisputeBookingMutation,
  useOwnerBookingsQuery,
  useRejectBookingMutation,
  useStartBookingMutation,
} from "@/hooks/use-bookings";
import { getBookingProgress, type BookingSummary } from "@/lib/booking";
import { ApiError } from "@/lib/http";
import { getDashboardRevealProps } from "./dashboard-motion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? "/assets/landing/landing-tractor.png";
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getStatusTone(status: BookingSummary["status"]) {
  if (status === "PENDING_OWNER_APPROVAL") {
    return "bg-[#e8f0ff] text-[#1d4ed8]";
  }
  if (status === "PENDING_RENTER_PAYMENT") {
    return "bg-[#fff4db] text-[#9a6700]";
  }
  if (status === "CONFIRMED") {
    return "bg-[#d8f3dc] text-[#166534]";
  }
  if (status === "IN_PROGRESS") {
    return "bg-[#cdeed7] text-[#123b2b]";
  }
  if (status === "DISPUTED") {
    return "bg-[#fee2e2] text-[#b91c1c]";
  }
  if (status === "COMPLETED") {
    return "bg-[#d5f5e0] text-[#166534]";
  }
  return "bg-[#eceff3] text-[#475569]";
}

function getStatusLabel(status: BookingSummary["status"]) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDeadlineLabel(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const date = new Date(deadline);
  if (date.getTime() <= Date.now()) {
    return "Payment window expired";
  }

  return `Renter has ${formatDistanceToNowStrict(date)} left`;
}

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
      <div>
        <h2 className='text-xl font-semibold tracking-[-0.04em] text-primary'>
          {title}
        </h2>
        <p className='mt-3 max-w-3xl text-base text-[#5c5f60]'>{description}</p>
      </div>
      <div className='flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-white px-4 py-3 text-sm text-[#5c5f60] shadow-sm'>
        <span className='font-semibold uppercase tracking-[0.24em] text-[#5c5f60]'>
          Count
        </span>
        <span className='rounded-full bg-[#1b4332] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white'>
          {count}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]'>
      {message}
    </div>
  );
}

function BookingCard({
  booking,
  helper,
  actions,
  index = 0,
}: {
  booking: BookingSummary;
  helper?: ReactNode;
  actions?: ReactNode;
  index?: number;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const progress = getBookingProgress(
    booking.startDate,
    booking.endDate,
    booking.status,
  );

  return (
    <motion.article
      {...getDashboardRevealProps(shouldReduceMotion, index)}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.2 } }
      }
      className='overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm'
    >
      <div className='flex flex-col xl:flex-row'>
        <div className='relative h-72 w-full overflow-hidden bg-[#eef2ed] xl:h-auto xl:w-[34%]'>
          <Image
            src={getImageSrc(booking)}
            alt={booking.equipment.title}
            fill
            className='object-cover'
            unoptimized
          />
        </div>

        <div className='flex-1 p-6 md:p-8'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
            <div>
              <h3 className='text-xl font-semibold tracking-[-0.04em] text-primary'>
                {booking.equipment.title}
              </h3>
              <p className='mt-2 text-base font-medium text-[#64748b]'>
                Renter: {booking.renter.fullName}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full shadow-sm px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${getStatusTone(booking.status)}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className='mt-8 grid gap-6 md:grid-cols-2'>
            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]'>
                Rental Period
              </p>
              <div className='mt-2 flex items-start gap-3 text-primary'>
                <CalendarDays className='h-5 w-5 shrink-0 text-[#5c5f60]' />
                <p className='font-semibold tracking-[-0.03em]'>
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
              </div>
            </div>

            <div>
              <p className='text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]'>
                Location
              </p>
              <div className='mt-2 flex items-start gap-3 text-primary'>
                <MapPin className='h-5 w-5 shrink-0 text-[#5c5f60]' />
                <p className='font-semibold tracking-[-0.03em]'>
                  {booking.equipment.normalizedAddress}
                </p>
              </div>
            </div>
          </div>

          <div className='mt-4 grid gap-4 border-t border-[#edf1ee] pt-6 text-sm text-[#5c5f60] md:grid-cols-1'>
            <div>
              <p className='font-semibold uppercase tracking-[0.2em] text-[#94a3b8]'>
                Rental Fee
              </p>
              <p className='mt-2 text-lg font-semibold text-primary'>
                {formatCurrency(booking.rentalFee)}
              </p>
            </div>
          </div>

          {booking.status === "CONFIRMED" ||
          booking.status === "IN_PROGRESS" ? (
            <div className='mt-8'>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
                <div className='flex items-center gap-2 text-primary'>
                  <Clock3 className='h-5 w-5 text-[#1b4332]' />
                  <p className='text-lg font-medium'>{progress.label}</p>
                </div>
                <p className='text-sm font-medium text-[#94a3b8]'>
                  {progress.percent}% complete
                </p>
              </div>
              <div className='h-2.5 w-full overflow-hidden rounded-full bg-[#edf1ee]'>
                <div
                  className='h-full rounded-full bg-[#1b4332]'
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          {helper ? <div className='mt-6'>{helper}</div> : null}
          {actions ? (
            <div className='mt-8 flex flex-wrap gap-4'>{actions}</div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function OwnerRentalRequestsContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const bookingsQuery = useOwnerBookingsQuery();
  const approveMutation = useApproveBookingMutation();
  const rejectMutation = useRejectBookingMutation();
  const startMutation = useStartBookingMutation();
  const completeMutation = useCompleteOwnerBookingMutation();
  const disputeMutation = useDisputeBookingMutation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {},
  );
  const [disputeReasons, setDisputeReasons] = useState<Record<string, string>>(
    {},
  );

  const bookings = useMemo(
    () => bookingsQuery.data ?? [],
    [bookingsQuery.data],
  );
  const grouped = useMemo(
    () => ({
      pending: bookings.filter(
        (booking) => booking.status === "PENDING_OWNER_APPROVAL",
      ),
      awaitingPayment: bookings.filter(
        (booking) => booking.status === "PENDING_RENTER_PAYMENT",
      ),
      confirmed: bookings.filter((booking) => booking.status === "CONFIRMED"),
      inProgress: bookings.filter(
        (booking) => booking.status === "IN_PROGRESS",
      ),
      history: bookings.filter(
        (booking) =>
          booking.status === "COMPLETED" ||
          booking.status === "CANCELLED" ||
          booking.status === "DISPUTED",
      ),
    }),
    [bookings],
  );

  async function handleApprove(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await approveMutation.mutateAsync(bookingId);
      setFeedback(
        "Booking approved. The renter can now complete Razorpay checkout.",
      );
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to approve this booking.",
      );
    }
  }

  async function handleReject(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    const reason = rejectReasons[bookingId]?.trim() ?? "";

    if (reason.length < 5) {
      setActionError(
        "Add a short rejection reason before declining the booking.",
      );
      return;
    }

    try {
      await rejectMutation.mutateAsync({ bookingId, reason });
      setFeedback("Booking request rejected.");
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to reject this booking.",
      );
    }
  }

  async function handleStart(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await startMutation.mutateAsync(bookingId);
      setFeedback("Booking marked in progress.");
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to start this booking.",
      );
    }
  }

  async function handleComplete(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await completeMutation.mutateAsync(bookingId);
      setFeedback(
        "Booking completed. Admin payout and deposit refund are now waiting for manual settlement.",
      );
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to complete this booking.",
      );
    }
  }

  async function handleDispute(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    const reason = disputeReasons[bookingId]?.trim() ?? "";

    if (reason.length < 5) {
      setActionError("Add a short dispute reason before reporting damage.");
      return;
    }

    try {
      await disputeMutation.mutateAsync({ bookingId, reason });
      setFeedback("Damage dispute opened for this booking.");
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : "Unable to dispute this booking.",
      );
    }
  }

  return (
    <section className='space-y-16'>
      <div>
        <h1 className='text-2xl font-semibold tracking-[-0.04em] text-primary md:text-3xl'>
          Rental Requests
        </h1>
        <p className='mt-3 max-w-3xl text-base leading-8 text-[#5c5f60]'>
          Review renter requests, track renter payment, and manage each rental
          until admin settles payout manually after completion.
        </p>
      </div>

      {feedback ? (
        <div className='rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-5 py-4 text-sm font-medium text-primary'>
          {feedback}
        </div>
      ) : null}
      {actionError ? (
        <div className='rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm font-medium text-[#b42318]'>
          {actionError}
        </div>
      ) : null}

      {bookingsQuery.isPending ? (
        <div className='flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className='rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]'>
          We could not load owner booking requests right now.
        </div>
      ) : null}

      {!bookingsQuery.isPending && !bookingsQuery.isError ? (
        <>
          <section className='space-y-6'>
            <SectionHeader
              title='Pending Approvals'
              description='These renter requests need an owner decision before the payment step can begin.'
              count={grouped.pending.length}
            />
            {grouped.pending.length > 0 ? (
              <div className='space-y-8'>
                {grouped.pending.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <div className='space-y-3'>
                        <textarea
                          value={rejectReasons[booking.id] ?? ""}
                          onChange={(event) =>
                            setRejectReasons((current) => ({
                              ...current,
                              [booking.id]: event.target.value,
                            }))
                          }
                          placeholder='Optional approval note or add rejection reason here'
                          className='min-h-24 w-full rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary'
                        />
                      </div>
                    }
                    actions={
                      <>
                        <button
                          type='button'
                          onClick={() => handleApprove(booking.id)}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                          className='rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                          Approve Request
                        </button>
                        <button
                          type='button'
                          onClick={() => handleReject(booking.id)}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                          className='rounded-[4px] border border-[#d8dfdb] px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                          Reject Request
                        </button>
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message='No booking requests are waiting for your approval right now.' />
            )}
          </section>

          <section className='space-y-6'>
            <SectionHeader
              title='Waiting For Renter Payment'
              description='Approved requests remain reserved here while renters complete Razorpay checkout.'
              count={grouped.awaitingPayment.length}
            />
            {grouped.awaitingPayment.length > 0 ? (
              <div className='space-y-8'>
                {grouped.awaitingPayment.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <div className='flex items-start gap-3 rounded-xl border border-[#f5deb3] bg-[#fffaf0] p-4'>
                        <Clock3 className='mt-0.5 h-5 w-5 shrink-0 text-[#9a6700]' />
                        <div>
                          <p className='text-sm font-semibold text-[#9a6700]'>
                            {getDeadlineLabel(
                              booking.renterPaymentDeadlineAt,
                            ) ?? "Payment window active"}
                          </p>
                          <p className='mt-1 text-xs leading-6 text-[#7c5a00]'>
                            These dates stay blocked while the renter completes
                            payment for this booking.
                          </p>
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message='No approved requests are currently waiting on renter payment.' />
            )}
          </section>

          <section className='space-y-6'>
            <SectionHeader
              title='Confirmed Rentals'
              description='These bookings are confirmed after payment and ready for rental handoff. Owner payout will be settled manually by admin later.'
              count={grouped.confirmed.length}
            />
            {grouped.confirmed.length > 0 ? (
              <div className='space-y-8'>
                {grouped.confirmed.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <div className='flex items-start gap-3 rounded-xl border border-[#dce4df] bg-[#f7faf7] p-4'>
                        <ShieldCheck className='mt-0.5 h-5 w-5 shrink-0 text-primary' />
                        <div>
                          <p className='text-sm font-semibold text-primary'>
                            Payment marked complete
                          </p>
                          <p className='mt-1 text-xs leading-6 text-muted-foreground'>
                            Start the booking when the equipment handoff begins.
                            Admin payout is tracked after the rental is
                            completed.
                          </p>
                        </div>
                      </div>
                    }
                    actions={
                      <button
                        type='button'
                        onClick={() => handleStart(booking.id)}
                        disabled={startMutation.isPending}
                        className='rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70'
                      >
                        Start Rental
                      </button>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message='No confirmed rentals are waiting for handoff.' />
            )}
          </section>

          <section className='space-y-6'>
            <SectionHeader
              title='In Progress'
              description='Live rentals can be safely completed or escalated into a dispute from here.'
              count={grouped.inProgress.length}
            />
            {grouped.inProgress.length > 0 ? (
              <div className='space-y-8'>
                {grouped.inProgress.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <textarea
                        value={disputeReasons[booking.id] ?? ""}
                        onChange={(event) =>
                          setDisputeReasons((current) => ({
                            ...current,
                            [booking.id]: event.target.value,
                          }))
                        }
                        placeholder='Add dispute or damage notes here before reporting'
                        className='min-h-24 w-full rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary'
                      />
                    }
                    actions={
                      <>
                        <button
                          type='button'
                          onClick={() => handleComplete(booking.id)}
                          disabled={
                            completeMutation.isPending ||
                            disputeMutation.isPending
                          }
                          className='rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                          Mark Returned Safely
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDispute(booking.id)}
                          disabled={
                            completeMutation.isPending ||
                            disputeMutation.isPending
                          }
                          className='rounded-[4px] border border-[#d8dfdb] px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70'
                        >
                          Report Damage
                        </button>
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState message='No rentals are currently in progress.' />
            )}
          </section>

          <section className='space-y-6'>
            <SectionHeader
              title='History'
              description='Completed, cancelled, and disputed booking records stay visible here for reference.'
              count={grouped.history.length}
            />
            {grouped.history.length > 0 ? (
              <div className='overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm'>
                <div className='overflow-x-auto'>
                  <table className='min-w-full border-collapse'>
                    <thead className='bg-[#f8faf7]'>
                      <tr>
                        {["Item", "Renter", "Dates", "Total", "Status"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.2em] text-[#64748b]'
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[#edf1ee]'>
                      {grouped.history.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          {...getDashboardRevealProps(
                            shouldReduceMotion,
                            index,
                          )}
                          className='transition-colors hover:bg-[#fbfcfa]'
                        >
                          <td className='px-6 py-5'>
                            <div className='flex min-w-[240px] items-center gap-4'>
                              <div className='relative h-12 w-12 overflow-hidden rounded-lg bg-[#eef2ed]'>
                                <Image
                                  src={getImageSrc(booking)}
                                  alt={booking.equipment.title}
                                  fill
                                  className='object-cover'
                                  unoptimized
                                />
                              </div>
                              <p className='text-lg font-medium text-primary'>
                                {booking.equipment.title}
                              </p>
                            </div>
                          </td>
                          <td className='px-6 py-5 text-base text-[#475569]'>
                            {booking.renter.fullName}
                          </td>
                          <td className='px-6 py-5 text-base text-[#475569]'>
                            {formatDateRange(
                              booking.startDate,
                              booking.endDate,
                            )}
                          </td>
                          <td className='px-6 py-5 text-lg font-semibold text-primary'>
                            {formatCurrency(booking.totalAuthorized)}
                          </td>
                          <td className='px-6 py-5'>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusTone(booking.status)}`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState message='Booking history will appear here as requests are resolved.' />
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
