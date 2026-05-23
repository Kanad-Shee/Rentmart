import { apiRequest } from './http';
import {
  buildPaginationSearchParams,
  type PaginatedResponse,
  type PaginationInput
} from './pagination';

export type NotificationType =
  | 'EQUIPMENT_APPROVED'
  | 'EQUIPMENT_REJECTED'
  | 'ADDRESS_UPDATED'
  | 'PASSWORD_UPDATED'
  | 'PHONE_VERIFIED'
  | 'BOOKING_REQUEST_RECEIVED'
  | 'BOOKING_REQUEST_SUBMITTED'
  | 'BOOKING_APPROVED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_PAYMENT_REQUIRED'
  | 'BOOKING_PAYMENT_CONFIRMED'
  | 'RENTER_PAYMENT_CONFIRMED'
  | 'BOOKING_STARTED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_DISPUTED';

export type NotificationItem = {
  id: string;
  userId: string;
  equipmentId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  actionLabel: string | null;
  actionHref: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export const notificationQueryKeys = {
  mine: ['notifications', 'mine'] as const,
  minePage: (input: PaginationInput) =>
    ['notifications', 'mine', input.page ?? 1, input.pageSize ?? 10] as const
};

export async function getMyNotificationsPage(input: PaginationInput = {}) {
  const searchParams = buildPaginationSearchParams(input);
  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<NotificationItem>>(
    `/notifications/me${suffix ? `?${suffix}` : ''}`
  );
  return response.data;
}

export async function getMyNotifications() {
  const response = await getMyNotificationsPage({ page: 1, pageSize: 100 });
  return response.items;
}

export async function markNotificationAsRead(id: string) {
  const response = await apiRequest<NotificationItem>(
    `/notifications/${id}/read`,
    {
      method: 'PATCH'
    }
  );

  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiRequest<{ count: number }>(
    '/notifications/read-all',
    {
      method: 'PATCH'
    }
  );

  return response.data;
}
