'use client';

import {
  getAdminPaymentEvents,
  getAdminPaymentEventsPage,
  paymentQueryKeys,
  type AdminPaymentEventsQueryInput
} from '@/lib/payment';
import { useQuery } from '@tanstack/react-query';

export function useAdminPaymentEventsQuery(enabled = true) {
  return useQuery({
    queryKey: paymentQueryKeys.adminEvents,
    queryFn: getAdminPaymentEvents,
    staleTime: 30 * 1000,
    enabled
  });
}

export function useAdminPaymentEventsPageQuery(
  input: AdminPaymentEventsQueryInput,
  enabled = true
) {
  return useQuery({
    queryKey: paymentQueryKeys.adminEventsPage(input),
    queryFn: () => getAdminPaymentEventsPage(input),
    staleTime: 30 * 1000,
    enabled
  });
}
