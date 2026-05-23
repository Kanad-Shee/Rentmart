"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSupportQuery,
  getAdminSupportQueries,
  resolveSupportQuery,
  supportQueryKeys,
  type CreateSupportQueryInput,
} from "@/lib/support-query";

export function useCreateSupportQueryMutation() {
  return useMutation({
    mutationFn: (input: CreateSupportQueryInput) => createSupportQuery(input),
  });
}

export function useAdminSupportQueriesQuery(enabled = true) {
  return useQuery({
    queryKey: supportQueryKeys.adminAll,
    queryFn: getAdminSupportQueries,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useResolveSupportQueryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resolveSupportQuery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.adminAll });
      toast.success("Support query marked as resolved.");
    },
  });
}
