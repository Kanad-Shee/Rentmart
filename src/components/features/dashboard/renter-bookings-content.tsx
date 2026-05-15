"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Script from "next/script";
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
  useCompleteBookingPaymentMutation,
  useMyBookingsQuery,
  useVerifyBookingPaymentMutation,
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

function formatDateRange(startDate: string, endDate: string) {
  return `${startDate} - ${endDate}`;
}

function getImageSrc(booking: BookingSummary) {
  return booking.equipment.imageUrl ?? "/assets/landing/landing-tractor.png";
}

function getStatusTone(status: BookingSummary["status"]) {
  if (status === "PENDING_RENTER_PAYMENT") {
    return "bg-[#fff4db] text-[#9a6700]";
  }

  if (status === "PENDING_OWNER_APPROVAL") {
    return "bg-[#e8f0ff] text-[#1d4ed8]";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#cdeed7] text-[#123b2b]";
  }

  if (status === "CONFIRMED") {
    return "bg-[#d8f3dc] text-[#166534]";
  }

  if (status === "COMPLETED") {
    return "bg-[#d5f5e0] text-[#166534]";
  }

  if (status === "DISPUTED") {
    return "bg-[#fee2e2] text-[#b91c1c]";
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

function getPaymentDeadlineLabel(deadline: string | null) {
  if (!deadline) {
    return null;
  }

  const deadlineDate = new Date(deadline);

  if (deadlineDate.getTime() <= Date.now()) {
    return "Payment window expired";
  }

  return `Pay within ${formatDistanceToNowStrict(deadlineDate)}`;
}

type RazorpayCheckoutInstance = {
  open: () => void;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};

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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-4xl font-semibold tracking-[-0.04em] text-primary">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-8 text-[#5c5f60]">
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

function BookingCard({
  booking,
  action,
  helper,
  index = 0,
}: {
  booking: BookingSummary;
  action?: ReactNode;
  helper?: ReactNode;
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
      className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm"
    >
      <div className="flex flex-col xl:flex-row">
        <div className="relative h-72 w-full overflow-hidden bg-[#eef2ed] xl:h-auto xl:w-[34%]">
          <Image
            src={getImageSrc(booking)}
            alt={booking.equipment.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-3xl font-semibold tracking-[-0.04em] text-primary">
                {booking.equipment.title}
              </h3>
              <p className="mt-2 text-lg text-[#64748b]">
                Owner: {booking.owner.fullName}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-[4px] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${getStatusTone(booking.status)}`}
            >
              {getStatusLabel(booking.status)}
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                Rental Period
              </p>
              <div className="mt-3 flex items-start gap-3 text-primary">
                <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-[#5c5f60]" />
                <p className="text-2xl font-medium tracking-[-0.03em]">
                  {formatDateRange(booking.startDate, booking.endDate)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#94a3b8]">
                Location
              </p>
              <div className="mt-3 flex items-start gap-3 text-primary">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#5c5f60]" />
                <p className="text-2xl font-medium tracking-[-0.03em]">
                  {booking.equipment.normalizedAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-[#edf1ee] pt-6 text-sm text-[#5c5f60] md:grid-cols-4">
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Rental Fee
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(booking.rentalFee)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Damage Waiver
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(booking.damageWaiverFee)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Refundable Hold
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(booking.securityDeposit)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
                Total Authorized
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {formatCurrency(booking.totalAuthorized)}
              </p>
            </div>
          </div>

          {booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS" ? (
            <div className="mt-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <Clock3 className="h-5 w-5 text-[#1b4332]" />
                  <p className="text-lg font-medium">{progress.label}</p>
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
          {action ? <div className="mt-8 flex flex-wrap gap-4">{action}</div> : null}
        </div>
      </div>
    </motion.article>
  );
}

export function RenterBookingsContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const bookingsQuery = useMyBookingsQuery();
  const completePaymentMutation = useCompleteBookingPaymentMutation();
  const verifyPaymentMutation = useVerifyBookingPaymentMutation();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePaymentBookingId, setActivePaymentBookingId] = useState<string | null>(null);

  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);

  const groupedBookings = useMemo(() => {
    return {
      awaitingOwner: bookings.filter(
        (booking) => booking.status === "PENDING_OWNER_APPROVAL",
      ),
      awaitingPayment: bookings.filter(
        (booking) => booking.status === "PENDING_RENTER_PAYMENT",
      ),
      active: bookings.filter((booking) =>
        booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS",
      ),
      history: bookings.filter((booking) =>
        booking.status === "COMPLETED" ||
        booking.status === "CANCELLED" ||
        booking.status === "DISPUTED",
      ),
    };
  }, [bookings]);

  async function handleCompletePayment(booking: BookingSummary) {
    setFeedback(null);
    setActivePaymentBookingId(booking.id);

    try {
      const order = await completePaymentMutation.mutateAsync(booking.id);
      const checkoutWindow = window as Window & {
        Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
      };

      if (!checkoutWindow.Razorpay) {
        throw new Error("Razorpay Checkout is not available yet.");
      }

      const razorpay = new checkoutWindow.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "RentMart",
        description: order.description,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              bookingId: booking.id,
              input: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            await bookingsQuery.refetch();
            setFeedback(
              "Payment received. Your booking is syncing with Razorpay and should appear as confirmed shortly.",
            );
          } catch (error) {
            if (
              error instanceof ApiError &&
              error.code === "INVALID_BOOKING_STATUS"
            ) {
              await bookingsQuery.refetch();
              setFeedback(
                "Payment received and your booking is already being confirmed. Refreshing the latest status now.",
              );
              return;
            }

            throw error;
          }
        },
        prefill: {
          name: order.renterName,
          email: order.renterEmail,
          contact: order.renterPhone ?? undefined,
        },
        theme: {
          color: "#1b4332",
        },
      });

      razorpay.open();
    } catch (error) {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : "We could not start Razorpay checkout right now.",
      );
    } finally {
      setActivePaymentBookingId(null);
    }
  }

  return (
    <section className="space-y-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-primary md:text-5xl">
            My Bookings
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[#5c5f60]">
            Track owner approvals, complete Razorpay checkout when a request is accepted,
            and follow your rental progress until the admin settles owner payout and your deposit refund.
          </p>
        </div>
        <div className="rounded-xl border border-[#d8dfdb] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#94a3b8]">
            Total Requests
          </p>
          <p className="mt-2 text-3xl font-semibold text-primary">{bookings.length}</p>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-[#d8dfdb] bg-[#f7faf7] px-5 py-4 text-sm font-medium text-primary">
          {feedback}
        </div>
      ) : null}

      {bookingsQuery.isPending ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-[#d8dfdb] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : null}

      {bookingsQuery.isError ? (
        <div className="rounded-xl border border-[#f3d3d3] bg-[#fff7f7] px-5 py-4 text-sm text-[#b42318]">
          We could not load your bookings right now.
        </div>
      ) : null}

      {!bookingsQuery.isPending && !bookingsQuery.isError ? (
        <>
          <section className="space-y-6">
            <SectionHeader
              title="Awaiting Owner Approval"
              description="These rental requests are submitted and reserved while the owner decides."
              count={groupedBookings.awaitingOwner.length}
            />

            {groupedBookings.awaitingOwner.length > 0 ? (
              <div className="space-y-8">
                {groupedBookings.awaitingOwner.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <div className="flex items-start gap-3 rounded-xl border border-[#dce4df] bg-[#f7faf7] p-4">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            Waiting on owner response
                          </p>
                          <p className="mt-1 text-xs leading-6 text-muted-foreground">
                            No payment hold is placed yet. If the owner approves,
                            you will get a 1-hour window to complete payment in Razorpay.
                          </p>
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
                No requests are waiting on owner approval right now.
              </div>
            )}
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Complete Payment"
              description="When an owner approves your request, the dates stay reserved for 1 hour while you complete Razorpay checkout."
              count={groupedBookings.awaitingPayment.length}
            />

            {groupedBookings.awaitingPayment.length > 0 ? (
              <div className="space-y-8">
                {groupedBookings.awaitingPayment.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                    helper={
                      <div className="flex items-start gap-3 rounded-xl border border-[#f5deb3] bg-[#fffaf0] p-4">
                        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#9a6700]" />
                        <div>
                          <p className="text-sm font-semibold text-[#9a6700]">
                            {getPaymentDeadlineLabel(booking.renterPaymentDeadlineAt) ??
                              "Payment window active"}
                          </p>
                          <p className="mt-1 text-xs leading-6 text-[#7c5a00]">
                            These dates are reserved for you until the payment window ends.
                            Your booking will be confirmed only after Razorpay payment verification completes, and the deposit will be refunded manually by admin after a safe return.
                          </p>
                          {booking.lastPaymentError ? (
                            <p className="mt-2 text-xs leading-6 text-[#b42318]">
                              Last payment issue: {booking.lastPaymentError}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    }
                    action={
                      <button
                        type="button"
                        onClick={() => handleCompletePayment(booking)}
                        disabled={
                          completePaymentMutation.isPending ||
                          verifyPaymentMutation.isPending ||
                          activePaymentBookingId === booking.id
                        }
                        className="inline-flex items-center gap-2 rounded-[4px] bg-[#1b4332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#274e3d] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {completePaymentMutation.isPending ||
                        verifyPaymentMutation.isPending ||
                        activePaymentBookingId === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        Pay with Razorpay
                      </button>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
                No approved requests are waiting for payment right now.
              </div>
            )}
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Active Rentals"
              description="Confirmed and in-progress rentals stay visible here so you can track upcoming and live bookings while admin settlement happens after completion."
              count={groupedBookings.active.length}
            />

            {groupedBookings.active.length > 0 ? (
              <div className="space-y-8">
                {groupedBookings.active.map((booking, index) => (
                  <BookingCard key={booking.id} booking={booking} index={index} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
                No active rentals yet.
              </div>
            )}
          </section>

          <section className="space-y-6">
            <SectionHeader
              title="Rental History"
              description="Completed, cancelled, and disputed rentals remain here for reference, including manual refund settlement progress."
              count={groupedBookings.history.length}
            />

            {groupedBookings.history.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#d8dfdb] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-[#f8faf7]">
                      <tr>
                        {["Item", "Date", "Owner", "Total", "Status"].map((heading) => (
                          <th
                            key={heading}
                            className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-[0.2em] text-[#64748b]"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1ee]">
                      {groupedBookings.history.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          {...getDashboardRevealProps(shouldReduceMotion, index)}
                          className="transition-colors hover:bg-[#fbfcfa]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex min-w-[240px] items-center gap-4">
                              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#eef2ed]">
                                <Image
                                  src={getImageSrc(booking)}
                                  alt={booking.equipment.title}
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
                            {formatDateRange(booking.startDate, booking.endDate)}
                          </td>
                          <td className="px-6 py-5 text-base text-[#475569]">
                            {booking.owner.fullName}
                          </td>
                          <td className="px-6 py-5 text-lg font-semibold text-primary">
                            {formatCurrency(booking.totalAuthorized)}
                          </td>
                          <td className="px-6 py-5">
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
              <div className="rounded-xl border border-dashed border-[#d8dfdb] bg-white px-6 py-12 text-center text-sm text-[#5c5f60]">
                Your completed and cancelled rentals will appear here.
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
