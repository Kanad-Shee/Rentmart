'use client';

import { getAdminPaymentEvents, paymentQueryKeys } from '@/lib/payment';
import { useQuery } from '@tanstack/react-query';

export function useAdminPaymentEventsQuery(enabled = true) {
  return useQuery({
    queryKey: paymentQueryKeys.adminEvents,
    queryFn: getAdminPaymentEvents,
    staleTime: 30 * 1000,
    enabled
  });
}
