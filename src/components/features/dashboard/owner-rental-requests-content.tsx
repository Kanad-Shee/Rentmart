'use client';

import { getDashboardRevealProps } from './dashboard-motion';
import { DashboardPaginationControls } from './dashboard-pagination-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogDismissButton,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  useApproveBookingMutation,
  useCompleteOwnerBookingMutation,
  useDisputeBookingMutation,
  useOwnerBookingsPageQuery,
  useOwnerBookingsQuery,
  useRejectBookingMutation,
  useStartBookingMutation
} from '@/hooks/use-bookings';
import {
  canOwnerCompleteBooking,
  canOwnerDisputeBooking,
  getBookingProgress,
  hasBookingWindowEnded,
  type BookingDisputeImageSummary,
  type BookingSummary
} from '@/lib/booking';
import { ApiError } from '@/lib/http';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type OwnerBookingGroup =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'HISTORY';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? '/assets/landing/landing-tractor.webp';
}

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getStatusTone(status: BookingSummary['status']) {
  if (status === 'PENDING_OWNER_APPROVAL') {
    return 'bg-[#e8f0ff] text-[#1d4ed8]';
  }
  if (status === 'PENDING_RENTER_PAYMENT') {
    return 'bg-[#fff4db] text-[#9a6700]';
  }
  if (status === 'CONFIRMED') {
    return 'bg-[#d8f3dc] text-[#166534]';
  }
  if (status === 'IN_PROGRESS') {
    return 'bg-[#cdeed7] text-[#123b2b]';
  }
  if (status === 'DISPUTED') {
    return 'bg-[#fee2e2] text-[#b91c1c]';
  }
  if (status === 'COMPLETED') {
    return 'bg-[#d5f5e0] text-[#166534]';
  }
  return 'bg-[#eceff3] text-[#475569]';
}

function getStatusLabel(status: BookingSummary['status']) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getDeadlineLabel(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const date = new Date(deadline);
  if (date.getTime() <= Date.now()) {
    return 'Payment window expired';
  }

  return `Renter has ${formatDistanceToNowStrict(date)} left`;
}

function SectionHeader({
  title,
  description,
  count
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.04em] text-primary">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5c5f60] sm:text-base">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-[#d8dfdb] bg-white px-4 py-3 text-sm text-[#5c5f60] shadow-sm">
        <span className="font-semibold uppercase tracking-[0.24em] text-[#5c5f60]">
          Count
        </span>
        <span className="rounded-full bg-[#1b4332] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
          {count}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
      {message}
    </div>
  );
}

type LocalPhotoPreview = {
  id: string;
  url: string;
  file: File;
};

function ExistingDisputePhoto({
  photo
}: {
  photo: BookingDisputeImageSummary;
}) {
  return (
    <div className="relative h-24 overflow-hidden rounded-xl border border-[#d8dfdb] bg-[#eef2ed]">
      <Image
        loading={'lazy'}
        src={photo.url}
        alt="Dispute evidence"
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

function NewDisputePhoto({
  preview,
  onRemove
}: {
  preview: LocalPhotoPreview;
  onRemove: () => void;
}) {
  return (
    <div className="relative h-24 overflow-hidden rounded-xl border border-[#d8dfdb] bg-[#eef2ed]">
      <Image
        src={preview.url}
        loading={'lazy'}
        alt="New dispute upload"
        fill
        className="object-cover"
        unoptimized
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm"
        aria-label="Remove dispute photo">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function BookingCard({
  booking,
  helper,
  actions,
  index = 0
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
    booking.status
  );

  return (
    <motion.article
      {...getDashboardRevealProps(shouldReduceMotion, index)}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { y: -4, transition: { duration: 0.2 } }
      }
      className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm">
      <div className="flex flex-col xl:flex-row">
        <div className="relative h-72 w-full overflow-hidden bg-[#eef2ed] xl:h-auto xl:w-[34%]">
          <Image
            src={getImageSrc(booking)}
            loading={'lazy'}
            alt={booking.equipment.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-primary">
                {booking.equipment.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#64748b] sm:text-base">
                Renter: {booking.renter.fullName}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full shadow-sm px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${getStatusTone(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                Rental Period
              </p>
              <div className="mt-2 flex items-start gap-3 text-primary">
                <CalendarDays className="h-5 w-5 shrink-0 text-[#5c5f60]" />
                <p className="font-semibold tracking-[-0.03em]">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                Location
              </p>
              <div className="mt-2 flex items-start gap-3 text-primary">
                <MapPin className="h-5 w-5 shrink-0 text-[#5c5f60]" />
                <p className="font-semibold tracking-[-0.03em]">
                  {booking.equipment.normalizedAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border-t border-[#edf1ee] pt-6 text-sm text-[#5c5f60]">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Rental Fee
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(booking.rentalFee)}
              </p>
            </div>
          </div>

          {booking.status === 'CONFIRMED' ||
          booking.status === 'IN_PROGRESS' ? (
            <div className="mt-8">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Clock3 className="h-5 w-5 text-[#1b4332]" />
                  <p className="text-base font-medium sm:text-lg">
                    {progress.label}
                  </p>
                </div>
                <p className="text-sm font-medium text-[#94a3b8]">
                  {progress.percent}% complete
                </p>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#edf1ee]">
                <div
                  className="h-full rounded-full bg-[#1b4332]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          ) : null}

          {helper ? <div className="mt-6">{helper}</div> : null}
          {actions ? (
            <div className="mt-8 flex flex-wrap gap-4">{actions}</div>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export function OwnerRentalRequestsContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeGroup, setActiveGroup] = useState<OwnerBookingGroup>('PENDING');
  const [page, setPage] = useState(1);
  const bookingTotalsQuery = useOwnerBookingsQuery();
  const bookingsQuery = useOwnerBookingsPageQuery({
    page,
    pageSize: 10,
    group: activeGroup
  });
  const approveMutation = useApproveBookingMutation();
  const rejectMutation = useRejectBookingMutation();
  const startMutation = useStartBookingMutation();
  const completeMutation = useCompleteOwnerBookingMutation();
  const disputeMutation = useDisputeBookingMutation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>(
    {}
  );
  const [disputeBooking, setDisputeBooking] = useState<BookingSummary | null>(
    null
  );
  const [disputeReason, setDisputeReason] = useState('');
  const [disputePhotos, setDisputePhotos] = useState<LocalPhotoPreview[]>([]);
  const [disputeModalError, setDisputeModalError] = useState<string | null>(
    null
  );
  const latestDisputePhotosRef = useRef<LocalPhotoPreview[]>([]);

  const bookings = useMemo(
    () => bookingTotalsQuery.data ?? [],
    [bookingTotalsQuery.data]
  );
  const grouped = useMemo(
    () => ({
      pending: bookings.filter(
        (booking) => booking.status === 'PENDING_OWNER_APPROVAL'
      ),
      awaitingPayment: bookings.filter(
        (booking) => booking.status === 'PENDING_RENTER_PAYMENT'
      ),
      confirmed: bookings.filter((booking) => booking.status === 'CONFIRMED'),
      inProgress: bookings.filter(
        (booking) => booking.status === 'IN_PROGRESS'
      ),
      history: bookings.filter(
        (booking) =>
          booking.status === 'COMPLETED' ||
          booking.status === 'CANCELLED' ||
          booking.status === 'DISPUTED'
      )
    }),
    [bookings]
  );
  const activeBookings = bookingsQuery.data?.items ?? [];
  const counts = {
    PENDING: grouped.pending.length,
    AWAITING_PAYMENT: grouped.awaitingPayment.length,
    CONFIRMED: grouped.confirmed.length,
    IN_PROGRESS: grouped.inProgress.length,
    HISTORY: grouped.history.length
  } satisfies Record<OwnerBookingGroup, number>;
  const groupMeta = {
    PENDING: {
      title: 'Pending Approvals',
      description:
        'These renter requests need an owner decision before the payment step can begin.',
      empty: 'No booking requests are waiting for your approval right now.'
    },
    AWAITING_PAYMENT: {
      title: 'Waiting For Renter Payment',
      description:
        'Approved requests remain reserved here while renters complete Cashfree checkout.',
      empty: 'No approved requests are currently waiting on renter payment.'
    },
    CONFIRMED: {
      title: 'Confirmed Rentals',
      description:
        'These bookings are confirmed after payment and ready for rental handoff. Owner payout will be settled manually by admin later.',
      empty: 'No confirmed rentals are waiting for handoff.'
    },
    IN_PROGRESS: {
      title: 'In Progress',
      description:
        'Live rentals can be safely completed or escalated into a dispute from here.',
      empty: 'No rentals are currently in progress.'
    },
    HISTORY: {
      title: 'History',
      description:
        'Completed, cancelled, and disputed booking records stay visible here for reference.',
      empty: 'Booking history will appear here as requests are resolved.'
    }
  } satisfies Record<
    OwnerBookingGroup,
    { title: string; description: string; empty: string }
  >;

  useEffect(() => {
    latestDisputePhotosRef.current = disputePhotos;
  }, [disputePhotos]);

  useEffect(() => {
    return () => {
      for (const photo of latestDisputePhotosRef.current) {
        URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  function resetDisputeModal() {
    setDisputeModalError(null);
    setDisputeReason('');
    setDisputeBooking(null);
    setDisputePhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
  }

  function openDisputeModal(booking: BookingSummary) {
    setFeedback(null);
    setActionError(null);
    setDisputeModalError(null);
    setDisputeReason(booking.disputeReason ?? '');
    setDisputeBooking(booking);
    setDisputePhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
  }

  function handleDisputeFilesSelected(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const remainingSlots = Math.max(0, 5 - disputePhotos.length);
    const nextFiles = Array.from(fileList).slice(0, remainingSlots);
    const nextPreviews = nextFiles.map((file) => ({
      id: `${file.name}_${file.lastModified}_${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file
    }));

    setDisputeModalError(null);
    setDisputePhotos((current) => [...current, ...nextPreviews]);
  }

  function removeDisputePhoto(id: string) {
    setDisputePhotos((current) => {
      const target = current.find((photo) => photo.id === id);

      if (target) {
        URL.revokeObjectURL(target.url);
      }

      return current.filter((photo) => photo.id !== id);
    });
  }

  async function handleApprove(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await approveMutation.mutateAsync(bookingId);
      setFeedback(
        'Booking approved. The renter can now complete Cashfree checkout.'
      );
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to approve this booking.'
      );
    }
  }

  async function handleReject(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    const reason = rejectReasons[bookingId]?.trim() ?? '';

    if (reason.length < 5) {
      setActionError(
        'Add a short rejection reason before declining the booking.'
      );
      return;
    }

    try {
      await rejectMutation.mutateAsync({ bookingId, reason });
      setFeedback('Booking request rejected.');
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to reject this booking.'
      );
    }
  }

  async function handleStart(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await startMutation.mutateAsync(bookingId);
      setFeedback('Booking marked in progress.');
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to start this booking.'
      );
    }
  }

  async function handleComplete(bookingId: string) {
    setFeedback(null);
    setActionError(null);
    try {
      await completeMutation.mutateAsync(bookingId);
      setFeedback(
        'Booking completed. Admin payout and deposit refund are now waiting for manual settlement.'
      );
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Unable to complete this booking.'
      );
    }
  }

  async function handleDispute() {
    if (!disputeBooking) {
      return;
    }

    setFeedback(null);
    setActionError(null);
    setDisputeModalError(null);
    const reason = disputeReason.trim();

    if (reason.length < 5) {
      setDisputeModalError(
        'Add a short dispute reason before reporting damage.'
      );
      return;
    }

    try {
      await disputeMutation.mutateAsync({
        bookingId: disputeBooking.id,
        input: {
          reason,
          photos: disputePhotos.map((photo) => photo.file)
        }
      });
      resetDisputeModal();
      setFeedback('Damage dispute opened for this booking.');
    } catch (error) {
      setDisputeModalError(
        error instanceof ApiError
          ? error.message
          : 'Unable to dispute this booking.'
      );
    }
  }

  return (
    <section className="space-y-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-primary sm:text-3xl">
          Rental Requests
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5c5f60] sm:text-base">
          Review renter requests, track renter payment, and manage each rental
          until admin settles payout manually after completion.
        </p>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-5 py-4 text-sm font-medium text-primary">
          {feedback}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm font-medium text-[#b42318]">
          {actionError}
        </div>
      ) : null}

      {bookingsQuery.isPending ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]">
          We could not load owner booking requests right now.
        </div>
      ) : null}

      {!bookingsQuery.isPending && !bookingsQuery.isError ? (
        <>
          <div className="border-b border-[#d8dfdb]">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {(
                [
                  'PENDING',
                  'AWAITING_PAYMENT',
                  'CONFIRMED',
                  'IN_PROGRESS',
                  'HISTORY'
                ] as OwnerBookingGroup[]
              ).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => {
                    setActiveGroup(group);
                    setPage(1);
                    setFeedback(null);
                    setActionError(null);
                  }}
                  className={[
                    'inline-flex items-center gap-2 border-b-2 px-2 py-4 text-sm font-medium transition-colors sm:px-3 sm:text-base',
                    activeGroup === group
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#5c5f60] hover:text-primary'
                  ].join(' ')}>
                  <span>{groupMeta[group].title}</span>
                  <span
                    className={[
                      'inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold',
                      activeGroup === group
                        ? 'bg-[#1b4332] text-white'
                        : 'bg-[#e8e8e5] text-[#414844]'
                    ].join(' ')}>
                    {counts[group]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <section className="space-y-6">
            <SectionHeader
              title={groupMeta[activeGroup].title}
              description={groupMeta[activeGroup].description}
              count={bookingsQuery.data?.totalItems ?? counts[activeGroup]}
            />
            {activeGroup === 'PENDING' ? (
              activeBookings.length > 0 ? (
                <div className="space-y-8">
                  {activeBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      helper={
                        <div className="space-y-3">
                          <textarea
                            value={rejectReasons[booking.id] ?? ''}
                            onChange={(event) =>
                              setRejectReasons((current) => ({
                                ...current,
                                [booking.id]: event.target.value
                              }))
                            }
                            placeholder="Optional approval note or add rejection reason here"
                            className="min-h-24 w-full rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary"
                          />
                        </div>
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(booking.id)}
                            disabled={
                              approveMutation.isPending ||
                              rejectMutation.isPending
                            }
                            className="rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                            Approve Request
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(booking.id)}
                            disabled={
                              approveMutation.isPending ||
                              rejectMutation.isPending
                            }
                            className="rounded-[4px] border border-[#d8dfdb] px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70">
                            Reject Request
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message={groupMeta[activeGroup].empty} />
              )
            ) : null}

            {activeGroup === 'AWAITING_PAYMENT' ? (
              activeBookings.length > 0 ? (
                <div className="space-y-8">
                  {activeBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      helper={
                        <div className="flex items-start gap-3 rounded-xl border border-[#f5deb3] bg-[#fffaf0] p-4">
                          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6700]" />
                          <div>
                            <p className="text-sm font-semibold text-[#9a6700]">
                              {getDeadlineLabel(
                                booking.renterPaymentDeadlineAt
                              ) ?? 'Payment window active'}
                            </p>
                            <p className="mt-1 text-xs leading-6 text-[#7c5a00]">
                              These dates stay blocked while the renter
                              completes payment for this booking.
                            </p>
                          </div>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message={groupMeta[activeGroup].empty} />
              )
            ) : null}

            {activeGroup === 'CONFIRMED' ? (
              activeBookings.length > 0 ? (
                <div className="space-y-8">
                  {activeBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      helper={(() => {
                        const rentalWindowEnded = hasBookingWindowEnded(
                          booking.endDate
                        );

                        return (
                          <div className="flex items-start gap-3 rounded-xl border border-[#dce4df] bg-[#f7faf7] p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {rentalWindowEnded
                                  ? 'Rental window ended'
                                  : 'Payment marked complete'}
                              </p>
                              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                                {rentalWindowEnded
                                  ? 'This rental period has ended. Mark it returned safely or open a dispute if something went wrong during handoff or return.'
                                  : 'Start the booking when the equipment handoff begins. Admin payout is tracked after the rental is completed.'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                      actions={(() => {
                        if (
                          canOwnerCompleteBooking(
                            booking.status,
                            booking.endDate
                          )
                        ) {
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => handleComplete(booking.id)}
                                disabled={
                                  completeMutation.isPending ||
                                  disputeMutation.isPending
                                }
                                className="rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                                Mark Returned Safely
                              </button>
                              {canOwnerDisputeBooking(
                                booking.status,
                                booking.endDate
                              ) ? (
                                <button
                                  type="button"
                                  onClick={() => openDisputeModal(booking)}
                                  disabled={
                                    completeMutation.isPending ||
                                    disputeMutation.isPending
                                  }
                                  className="rounded-[4px] border border-[#d8dfdb] px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70">
                                  Open Dispute
                                </button>
                              ) : null}
                            </>
                          );
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => handleStart(booking.id)}
                            disabled={startMutation.isPending}
                            className="rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                            Start Rental
                          </button>
                        );
                      })()}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message={groupMeta[activeGroup].empty} />
              )
            ) : null}

            {activeGroup === 'IN_PROGRESS' ? (
              activeBookings.length > 0 ? (
                <div className="space-y-8">
                  {activeBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      helper={
                        <div className="rounded-xl border border-[#dce4df] bg-[#f7faf7] p-4 text-sm leading-7 text-muted-foreground">
                          Close the rental after safe return, or open a dispute
                          with notes and optional evidence images if there was
                          damage or a return issue.
                        </div>
                      }
                      actions={
                        <>
                          <button
                            type="button"
                            onClick={() => handleComplete(booking.id)}
                            disabled={
                              completeMutation.isPending ||
                              disputeMutation.isPending
                            }
                            className="rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                            Mark Returned Safely
                          </button>
                          <button
                            type="button"
                            onClick={() => openDisputeModal(booking)}
                            disabled={
                              completeMutation.isPending ||
                              disputeMutation.isPending
                            }
                            className="rounded-[4px] border border-[#d8dfdb] px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-70">
                            Open Dispute
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message={groupMeta[activeGroup].empty} />
              )
            ) : null}

            {activeGroup === 'HISTORY' ? (
              activeBookings.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-[#f8faf7]">
                        <tr>
                          {['Item', 'Renter', 'Dates', 'Total', 'Status'].map(
                            (heading) => (
                              <th
                                key={heading}
                                className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                                {heading}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1ee]">
                        {activeBookings.map((booking, index) => (
                          <motion.tr
                            key={booking.id}
                            {...getDashboardRevealProps(
                              shouldReduceMotion,
                              index
                            )}
                            className="transition-colors hover:bg-[#fbfcfa]">
                            <td className="px-6 py-5">
                              <div className="flex min-w-[240px] items-center gap-4">
                                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#eef2ed]">
                                  <Image
                                    src={getImageSrc(booking)}
                                    alt={booking.equipment.title}
                                    loading={'lazy'}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <p className="text-lg font-medium text-primary">
                                  {booking.equipment.title}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-base text-[#475569]">
                              {booking.renter.fullName}
                            </td>
                            <td className="px-6 py-5 text-base text-[#475569]">
                              {formatDateRange(
                                booking.startDate,
                                booking.endDate
                              )}
                            </td>
                            <td className="px-6 py-5 text-lg font-semibold text-primary">
                              {formatCurrency(booking.totalAuthorized)}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusTone(booking.status)}`}>
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
                <EmptyState message={groupMeta[activeGroup].empty} />
              )
            ) : null}
            {bookingsQuery.data ? (
              <DashboardPaginationControls
                page={bookingsQuery.data.page}
                totalPages={bookingsQuery.data.totalPages}
                totalItems={bookingsQuery.data.totalItems}
                pageSize={bookingsQuery.data.pageSize}
                onPageChange={setPage}
              />
            ) : null}
          </section>
        </>
      ) : null}

      <Dialog
        open={Boolean(disputeBooking)}
        onOpenChange={(open) => {
          if (!open) {
            resetDisputeModal();
          }
        }}>
        <DialogContent className="p-0">
          <div className="relative p-6 sm:p-8">
            <DialogDismissButton />
            <DialogHeader className="pr-10">
              <DialogTitle>Open Dispute</DialogTitle>
              <DialogDescription>
                {disputeBooking
                  ? `Share what went wrong for ${disputeBooking.equipment.title}. You can add a reason and up to 5 optional evidence images.`
                  : 'Share what went wrong and attach optional evidence images.'}
              </DialogDescription>
            </DialogHeader>

            {disputeModalError ? (
              <div className="mt-5 rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#b42318]">
                {disputeModalError}
              </div>
            ) : null}

            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  Dispute reason
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(event) => setDisputeReason(event.target.value)}
                  maxLength={400}
                  rows={6}
                  className="mt-3 min-h-32 w-full rounded-xl border border-[#d8dfdb] bg-white px-4 py-3 text-sm leading-7 text-primary outline-none transition-colors placeholder:text-[#94a3b8] focus:border-primary"
                  placeholder="Describe the damage, return issue, or anything that needs admin review."
                />
                <p className="mt-2 text-right text-xs text-[#94a3b8]">
                  {disputeReason.trim().length}/400
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                    Evidence photos
                  </label>
                  <span className="text-xs text-[#94a3b8]">
                    Optional, up to 5 images
                  </span>
                </div>

                {disputeBooking?.disputeImages.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {disputeBooking.disputeImages.map((photo) => (
                      <ExistingDisputePhoto
                        key={photo.id}
                        photo={photo}
                      />
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {disputePhotos.map((photo) => (
                    <NewDisputePhoto
                      key={photo.id}
                      preview={photo}
                      onRemove={() => removeDisputePhoto(photo.id)}
                    />
                  ))}
                  {disputePhotos.length < 5 ? (
                    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#b8c9bf] bg-[#fbfcfa] px-4 py-5 text-center text-sm text-[#5c5f60] transition-colors hover:border-[#1b4332] hover:bg-[#f7faf7]">
                      <Upload className="h-5 w-5 text-primary" />
                      <span className="mt-3 font-medium text-primary">
                        Upload photos
                      </span>
                      <span className="mt-1 text-xs text-[#94a3b8]">
                        JPG, PNG or WEBP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) =>
                          handleDisputeFilesSelected(event.target.files)
                        }
                        className="hidden"
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => resetDisputeModal()}
                className="rounded-[4px] border border-[#d8dfdb] px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-[#f7f9f6]">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDispute()}
                disabled={disputeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-[4px] bg-[#1b4332] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70">
                {disputeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Submit Dispute
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
