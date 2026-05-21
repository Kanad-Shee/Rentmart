import { apiRequest } from "./http";

export const BOOKING_PLATFORM_FEE_RATE = 0.1;
export const BOOKING_DAMAGE_WAIVER_FEE = 999;
export const BOOKING_SECURITY_DEPOSIT_RATE = 0.3;
export const BOOKING_SECURITY_DEPOSIT_MIN = 500;
export const BOOKING_SECURITY_DEPOSIT_MAX = 5000;

export type BookingStatus =
  | "PENDING_OWNER_APPROVAL"
  | "PENDING_RENTER_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type FinancialStatus =
  | "NONE"
  | "PAYMENT_PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_CAPTURED"
  | "PAYMENT_FAILED"
  | "MANUAL_SETTLEMENT_PENDING"
  | "MANUAL_SETTLEMENT_COMPLETE"
  | "PAYOUT_ON_HOLD"
  | "PAYOUT_RELEASED"
  | "PAYOUT_SETTLED"
  | "PAYOUT_FAILED"
  | "DEPOSIT_REFUND_PENDING"
  | "DEPOSIT_REFUNDED"
  | "REFUND_FAILED"
  | "DISPUTED";

export type OwnerPayoutStatus = "NONE" | "PENDING" | "PAID" | "BLOCKED";
export type DepositRefundStatus =
  | "NONE"
  | "PENDING"
  | "REFUNDED"
  | "SKIPPED"
  | "BLOCKED";

export type BookingDisputeImageSummary = {
  id: string;
  url: string;
  position: number;
};

export type BookingPricing = {
  rentalDays: number;
  rentalFee: number;
  platformFee: number;
  damageWaiverFee: number;
  securityDeposit: number;
  totalAuthorized: number;
};

export type CreateBookingInput = {
  equipmentId: string;
  startDate: string;
  endDate: string;
} & BookingPricing;

export type BookingSummary = {
  id: string;
  equipmentId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  rentalFee: number;
  platformFee: number;
  damageWaiverFee: number;
  securityDeposit: number;
  totalAuthorized: number;
  currency: string;
  isPaymentCompleted: boolean;
  financialStatus: FinancialStatus;
  paymentProvider: string | null;
  paymentIntentId: string | null;
  paymentAuthorizationId: string | null;
  cashfreeOrderId: string | null;
  cashfreePaymentId: string | null;
  cashfreePaymentSessionId: string | null;
  payoutLinkedAccountId: string | null;
  paymentAmountInPaise: number | null;
  paymentCurrency: string | null;
  lastPaymentError: string | null;
  paymentCapturedAt: string | null;
  ownerActionDeadlineAt: string;
  renterPaymentDeadlineAt: string | null;
  conditionLoggedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  disputedAt: string | null;
  paymentFailedAt: string | null;
  paymentVoidedAt: string | null;
  paymentReleasedAt: string | null;
  paymentDisputedAt: string | null;
  ownerPayoutSettledAt: string | null;
  depositRefundInitiatedAt: string | null;
  depositRefundedAt: string | null;
  ownerPayoutStatus: OwnerPayoutStatus;
  ownerPaidAt: string | null;
  ownerPayoutReference: string | null;
  depositRefundStatus: DepositRefundStatus;
  depositRefundReference: string | null;
  status: BookingStatus;
  ownerDecisionReason: string | null;
  disputeReason: string | null;
  disputeImages: BookingDisputeImageSummary[];
  createdAt: string;
  updatedAt: string;
  equipment: {
    id: string;
    title: string;
    price: number;
    normalizedAddress: string;
    status: string;
    imageUrl: string | null;
  };
  renter: {
    id: string;
    fullName: string;
    email: string;
    phoneVerified: boolean;
  };
  owner: {
    id: string;
    fullName: string;
    email: string;
    phoneVerified: boolean;
  };
};

export type BookingPaymentOrder = {
  bookingId: string;
  orderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  environment: "sandbox" | "production";
  renterName: string;
  renterEmail: string;
  renterPhone: string | null;
  description: string;
};

export type VerifyBookingPaymentInput = {
  cashfreeOrderId: string;
};

export type DisputeBookingInput = {
  reason: string;
  photos: File[];
};

export type ManualSettlementInput = {
  reference?: string;
};

export type BookingProgress = {
  percent: number;
  dayNumber: number;
  totalDays: number;
  label: string;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateSecurityDeposit(rentalFee: number) {
  return roundCurrency(
    Math.max(
      BOOKING_SECURITY_DEPOSIT_MIN,
      Math.min(BOOKING_SECURITY_DEPOSIT_MAX, rentalFee * BOOKING_SECURITY_DEPOSIT_RATE),
    ),
  );
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function hasBookingWindowEnded(endDate: string, now = new Date()) {
  const end = getLocalMidnight(new Date(`${endDate}T00:00:00`));
  const today = getLocalMidnight(now);
  return today > end;
}

export function calculateRentalDays(from: Date, to: Date) {
  const fromMidnight = getLocalMidnight(from);
  const toMidnight = getLocalMidnight(to);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((toMidnight.getTime() - fromMidnight.getTime()) / millisecondsPerDay) + 1;
}

export function getBookingProgress(
  startDate: string,
  endDate: string,
  status: BookingStatus,
): BookingProgress {
  const start = getLocalMidnight(new Date(`${startDate}T00:00:00`));
  const end = getLocalMidnight(new Date(`${endDate}T00:00:00`));
  const today = getLocalMidnight(new Date());
  const totalDays = Math.max(calculateRentalDays(start, end), 1);

  if (status === "COMPLETED") {
    return {
      percent: 100,
      dayNumber: totalDays,
      totalDays,
      label: `Completed after ${totalDays} day${totalDays === 1 ? "" : "s"}`,
    };
  }

  if (today < start) {
    const daysUntilStart = calculateRentalDays(today, start) - 1;
    return {
      percent: 0,
      dayNumber: 0,
      totalDays,
      label: `Starts in ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`,
    };
  }

  if (hasBookingWindowEnded(endDate, today)) {
    return {
      percent: 100,
      dayNumber: totalDays,
      totalDays,
      label: "Rental window ended",
    };
  }

  const elapsedDays = calculateRentalDays(start, today);
  const percent = Math.max(5, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));

  return {
    percent,
    dayNumber: elapsedDays,
    totalDays,
    label: `Day ${elapsedDays} of ${totalDays}`,
  };
}

export function canOwnerCompleteBooking(status: BookingStatus, endDate: string) {
  return status === "IN_PROGRESS" || (status === "CONFIRMED" && hasBookingWindowEnded(endDate));
}

export function canOwnerDisputeBooking(status: BookingStatus, endDate: string) {
  return status === "IN_PROGRESS" || (status === "CONFIRMED" && hasBookingWindowEnded(endDate));
}

export function calculateBookingPricing(pricePerDay: number, rentalDays: number): BookingPricing {
  const rentalFee = roundCurrency(pricePerDay * rentalDays);
  const platformFee = roundCurrency(rentalFee * BOOKING_PLATFORM_FEE_RATE);
  const damageWaiverFee = roundCurrency(BOOKING_DAMAGE_WAIVER_FEE);
  const securityDeposit = calculateSecurityDeposit(rentalFee);
  const totalAuthorized = roundCurrency(
    rentalFee + platformFee + damageWaiverFee + securityDeposit,
  );

  return {
    rentalDays,
    rentalFee,
    platformFee,
    damageWaiverFee,
    securityDeposit,
    totalAuthorized,
  };
}

export function buildBookingPayload(
  equipmentId: string,
  pricePerDay: number,
  from: Date,
  to: Date,
): CreateBookingInput {
  const rentalDays = calculateRentalDays(from, to);
  const pricing = calculateBookingPricing(pricePerDay, rentalDays);

  return {
    equipmentId,
    startDate: toLocalDateKey(from),
    endDate: toLocalDateKey(to),
    ...pricing,
  };
}

export const bookingQueryKeys = {
  all: ["bookings"] as const,
  mine: ["bookings", "mine"] as const,
  owner: ["bookings", "owner"] as const,
  admin: ["bookings", "admin"] as const,
};

export async function createBooking(input: CreateBookingInput) {
  const response = await apiRequest<BookingSummary>("/bookings", {
    method: "POST",
    headers: {
      "x-idempotency-key": `booking_${crypto.randomUUID()}`,
    },
    body: input,
  });

  return response.data;
}

export async function getMyBookings() {
  const response = await apiRequest<BookingSummary[]>("/bookings/mine");
  return response.data;
}

export async function getOwnerBookings() {
  const response = await apiRequest<BookingSummary[]>("/bookings/owner");
  return response.data;
}

export async function getAdminBookings() {
  const response = await apiRequest<BookingSummary[]>("/bookings/admin");
  return response.data;
}

export async function createBookingPaymentOrder(bookingId: string) {
  const response = await apiRequest<BookingPaymentOrder>(
    `/bookings/${bookingId}/payment/order`,
    {
      method: "POST",
      headers: {
        "x-idempotency-key": `booking_payment_order_${crypto.randomUUID()}`,
      },
      body: {},
    },
  );

  return response.data;
}

export async function verifyBookingPayment(
  bookingId: string,
  input: VerifyBookingPaymentInput,
) {
  const response = await apiRequest<BookingSummary>(
    `/bookings/${bookingId}/payment/verify`,
    {
      method: "POST",
      headers: {
        "x-idempotency-key": `booking_payment_verify_${crypto.randomUUID()}`,
      },
      body: input,
    },
  );

  return response.data;
}

export async function approveBooking(bookingId: string) {
  const response = await apiRequest<BookingSummary>(`/bookings/${bookingId}/approve`, {
    method: "PATCH",
  });

  return response.data;
}

export async function rejectBooking(bookingId: string, reason: string) {
  const response = await apiRequest<BookingSummary>(`/bookings/${bookingId}/reject`, {
    method: "PATCH",
    body: { reason },
  });

  return response.data;
}

export async function startBooking(bookingId: string) {
  const response = await apiRequest<BookingSummary>(`/bookings/${bookingId}/start`, {
    method: "PATCH",
  });

  return response.data;
}

export async function completeOwnerBooking(bookingId: string) {
  const response = await apiRequest<BookingSummary>(`/bookings/${bookingId}/complete`, {
    method: "PATCH",
  });

  return response.data;
}

function createDisputeBookingFormData(input: DisputeBookingInput) {
  const formData = new FormData();
  formData.append("reason", input.reason);

  for (const photo of input.photos) {
    formData.append("photos", photo);
  }

  return formData;
}

export async function disputeBooking(bookingId: string, input: DisputeBookingInput) {
  const response = await apiRequest<BookingSummary>(`/bookings/${bookingId}/dispute`, {
    method: "PATCH",
    body: createDisputeBookingFormData(input),
  });

  return response.data;
}

export async function markOwnerPayoutPaid(
  bookingId: string,
  input: ManualSettlementInput,
) {
  const response = await apiRequest<BookingSummary>(
    `/bookings/${bookingId}/mark-owner-paid`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}

export async function markDepositRefunded(
  bookingId: string,
  input: ManualSettlementInput,
) {
  const response = await apiRequest<BookingSummary>(
    `/bookings/${bookingId}/mark-deposit-refunded`,
    {
      method: "PATCH",
      body: input,
    },
  );

  return response.data;
}
