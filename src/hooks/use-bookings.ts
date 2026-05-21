"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveBooking,
  getAdminBookings,
  bookingQueryKeys,
  completeOwnerBooking,
  createBookingPaymentOrder,
  createBooking,
  type DisputeBookingInput,
  disputeBooking,
  getMyBookings,
  getOwnerBookings,
  markDepositRefunded,
  markOwnerPayoutPaid,
  rejectBooking,
  startBooking,
  verifyBookingPayment,
  type CreateBookingInput,
  type ManualSettlementInput,
  type VerifyBookingPaymentInput,
} from "@/lib/booking";

function invalidateBookingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
}

export function useMyBookingsQuery(enabled = true) {
  return useQuery({
    queryKey: bookingQueryKeys.mine,
    queryFn: getMyBookings,
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useOwnerBookingsQuery(enabled = true) {
  return useQuery({
    queryKey: bookingQueryKeys.owner,
    queryFn: getOwnerBookings,
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useAdminBookingsQuery(enabled = true) {
  return useQuery({
    queryKey: bookingQueryKeys.admin,
    queryFn: getAdminBookings,
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useCompleteBookingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => createBookingPaymentOrder(bookingId),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useVerifyBookingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      input,
    }: {
      bookingId: string;
      input: VerifyBookingPaymentInput;
    }) => verifyBookingPayment(bookingId, input),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useApproveBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => approveBooking(bookingId),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useRejectBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      rejectBooking(bookingId, reason),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useStartBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => startBooking(bookingId),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useCompleteOwnerBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => completeOwnerBooking(bookingId),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useDisputeBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: DisputeBookingInput }) =>
      disputeBooking(bookingId, input),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useMarkOwnerPayoutPaidMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      input,
    }: {
      bookingId: string;
      input: ManualSettlementInput;
    }) => markOwnerPayoutPaid(bookingId, input),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}

export function useMarkDepositRefundedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      input,
    }: {
      bookingId: string;
      input: ManualSettlementInput;
    }) => markDepositRefunded(bookingId, input),
    onSuccess: () => {
      invalidateBookingQueries(queryClient);
    },
  });
}
