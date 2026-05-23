'use client';

import {
  getMyNotifications,
  getMyNotificationsPage,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationQueryKeys
} from '@/lib/notification';
import type { PaginationInput } from '@/lib/pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useMyNotificationsQuery(enabled = true) {
  return useQuery({
    queryKey: notificationQueryKeys.mine,
    queryFn: getMyNotifications,
    staleTime: 30 * 1000,
    enabled
  });
}

export function useMyNotificationsPageQuery(
  input: PaginationInput,
  enabled = true
) {
  return useQuery({
    queryKey: notificationQueryKeys.minePage(input),
    queryFn: () => getMyNotificationsPage(input),
    staleTime: 30 * 1000,
    enabled
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.mine });
    }
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.mine });
      toast.success('All notifications marked as read.');
    }
  });
}
