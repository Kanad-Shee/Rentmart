"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  CalendarDays,
  CircleCheckBig,
  CircleAlert,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useCreateBookingMutation } from "@/hooks/use-bookings";
import { useCurrentUserQuery } from "@/hooks/use-auth";
import {
  BOOKING_DAMAGE_WAIVER_FEE,
  BOOKING_PLATFORM_FEE_RATE,
  BOOKING_SECURITY_DEPOSIT_MAX,
  BOOKING_SECURITY_DEPOSIT_MIN,
  BOOKING_SECURITY_DEPOSIT_RATE,
  buildBookingPayload,
  calculateBookingPricing,
} from "@/lib/booking";
import { ApiError } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ProductRentalCardProps = {
  equipmentId: string;
  pricePerDay: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getTodayAtLocalMidnight() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) {
    return "Select rental dates";
  }

  if (!range.to) {
    return `${format(range.from, "MMM d, yyyy")} - Pick end date`;
  }

  return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
}

export function ProductRentalCard({
  equipmentId,
  pricePerDay,
}: ProductRentalCardProps) {
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const createBookingMutation = useCreateBookingMutation();
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const pricing = useMemo(() => {
    if (!selectedRange?.from || !selectedRange.to) {
      return null;
    }

    return calculateBookingPricing(
      pricePerDay,
      buildBookingPayload(
        equipmentId,
        pricePerDay,
        selectedRange.from,
        selectedRange.to,
      ).rentalDays,
    );
  }, [equipmentId, pricePerDay, selectedRange]);

  const currentUser = currentUserQuery.data;
  const isGuest = !currentUserQuery.isPending && !currentUser;
  const showBookingPricingDetails =
    !currentUserQuery.isPending && Boolean(currentUser);
  const isRenter = currentUser?.role === "RENTER";
  const isPhoneVerified = Boolean(currentUser?.phoneVerified);
  const hasFullRange = Boolean(selectedRange?.from && selectedRange.to);
  const isPartialRange = Boolean(selectedRange?.from && !selectedRange.to);

  const rentalDays = useMemo(() => {
    if (!selectedRange?.from || !selectedRange.to) {
      return 0;
    }

    return buildBookingPayload(
      equipmentId,
      pricePerDay,
      selectedRange.from,
      selectedRange.to,
    ).rentalDays;
  }, [equipmentId, pricePerDay, selectedRange]);

  async function handleProceedToRent() {
    setFeedback(null);

    if (!currentUser) {
      router.push("/sign-in");
      return;
    }

    if (!isRenter) {
      setFeedback("Only renter accounts can submit booking requests.");
      return;
    }

    if (!isPhoneVerified) {
      router.push("/dashboard/settings");
      return;
    }

    if (!selectedRange?.from || !selectedRange.to) {
      setFeedback("Select your rental start and end dates first.");
      return;
    }

    try {
      const payload = buildBookingPayload(
        equipmentId,
        pricePerDay,
        selectedRange.from,
        selectedRange.to,
      );

      const booking = await createBookingMutation.mutateAsync(payload);
      setFeedback(
        `Booking request submitted. Status: ${booking.status.replaceAll("_", " ")}.`,
      );
    } catch (error) {
      setFeedback(
        error instanceof ApiError
          ? error.message
          : "We couldn't submit your booking request right now.",
      );
    }
  }

  const ctaLabel = (() => {
    if (createBookingMutation.isPending) {
      return "Submitting Request...";
    }

    if (isGuest) {
      return "Sign In to Book";
    }

    if (!isRenter) {
      return "Renters Only";
    }

    if (!isPhoneVerified) {
      return "Verify Phone to Continue";
    }

    if (!hasFullRange) {
      return "Select Rental Dates";
    }

    return "Request Booking";
  })();

  return (
    <aside className="space-y-4 lg:sticky lg:top-28">
      <div className="rounded-xl border border-border bg-background p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-6 flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-primary">
            {formatCurrency(pricePerDay)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">/ day</span>
        </div>

        <div className="mb-6 space-y-4">
          {showBookingPricingDetails ? (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/15 px-4 py-4 text-left transition-colors hover:border-primary/30 hover:bg-muted/30"
                aria-label="Open rental date picker"
              >
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Rental Dates
                  </div>
                  <p className="truncate text-sm font-medium text-foreground">
                    {formatRangeLabel(selectedRange)}
                  </p>
                </div>
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  pagedNavigation
                  selected={selectedRange}
                  onSelect={(range) => {
                    setSelectedRange(range);
                    setFeedback(null);

                    if (range?.from && range.to) {
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={{
                    before: getTodayAtLocalMidnight(),
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : null}

          <div className="rounded-xl border border-[#dce4df] bg-[#f7faf7] p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">
                  Escrow-Protected Booking
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Rentmart only places the authorization hold after the owner
                  approves your request. Your refundable security hold is 30% of the rental fee, capped between
                  {` ${formatCurrency(BOOKING_SECURITY_DEPOSIT_MIN)} and ${formatCurrency(BOOKING_SECURITY_DEPOSIT_MAX)}`},
                  and is only captured if damage is reported.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-b border-border pb-5 text-sm text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span>
              Rental Fee
              {rentalDays > 0 ? ` (${formatCurrency(pricePerDay)} x ${rentalDays} day${rentalDays === 1 ? "" : "s"})` : ""}
            </span>
            <span>
              {pricing ? formatCurrency(pricing.rentalFee) : "Select dates"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>
              Platform Fee
              <span className="ml-1 text-xs">
                ({Math.round(BOOKING_PLATFORM_FEE_RATE * 100)}%)
              </span>
            </span>
            <span>
              {pricing
                ? formatCurrency(pricing.platformFee)
                : "Select dates"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Damage Waiver</span>
            <span>{formatCurrency(BOOKING_DAMAGE_WAIVER_FEE)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>
              Refundable Security Hold
              <span className="ml-1 text-xs">
                ({Math.round(BOOKING_SECURITY_DEPOSIT_RATE * 100)}%)
              </span>
            </span>
            <span>
              {pricing ? formatCurrency(pricing.securityDeposit) : "Select dates"}
            </span>
          </div>
          {showBookingPricingDetails ? (
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-lg font-semibold text-primary">
              <span>Total Authorized</span>
              <span>
                {pricing
                  ? formatCurrency(pricing.totalAuthorized)
                  : "Select dates"}
              </span>
            </div>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={handleProceedToRent}
          disabled={createBookingMutation.isPending}
          className="mt-5 h-12 w-full rounded-xl text-sm font-bold"
        >
          {createBookingMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {ctaLabel}
        </Button>

        <div className="mt-4 space-y-2">
          <p className="text-center text-xs text-muted-foreground">
            Submit your date request first. If the owner approves, you will get a 1-hour window to complete payment authorization.
          </p>
          {isPartialRange ? (
            <p className="text-center text-xs text-primary">
              Choose your end date to see the final booking total.
            </p>
          ) : null}
          {!currentUserQuery.isPending && currentUser && !isRenter ? (
            <p className="text-center text-xs text-destructive">
              Owner and admin accounts can review listings, but only renters can book them.
            </p>
          ) : null}
          {!currentUserQuery.isPending && currentUser && isRenter && !isPhoneVerified ? (
            <p className="text-center text-xs text-primary">
              Phone verification is required before your booking request can be submitted.
            </p>
          ) : null}
          {feedback ? (
            <p className="text-center text-xs text-primary">{feedback}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          {feedback && feedback.startsWith("Booking request submitted") ? (
            <CircleCheckBig className="mt-0.5 h-5 w-5 text-primary" />
          ) : (
            <CircleAlert className="mt-0.5 h-5 w-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-semibold text-primary">Booking Protection</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Damage waiver and platform charges are mandatory. Payment authorization happens after owner approval, and final routing completes after safe return or dispute handling.
            </p>
            {currentUser && isRenter && !isPhoneVerified ? (
              <Link
                href="/dashboard/settings"
                className="mt-2 inline-flex text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Verify your phone in dashboard settings
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
