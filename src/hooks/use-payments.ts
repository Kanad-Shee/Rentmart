"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminPaymentEvents, paymentQueryKeys } from "@/lib/payment";

export function useAdminPaymentEventsQuery(enabled = true) {
  return useQuery({
    queryKey: paymentQueryKeys.adminEvents,
    queryFn: getAdminPaymentEvents,
    staleTime: 30 * 1000,
    enabled,
  });
}
