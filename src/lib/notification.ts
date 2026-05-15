import { apiRequest } from "./http";

export type NotificationType =
  | "EQUIPMENT_APPROVED"
  | "EQUIPMENT_REJECTED"
  | "ADDRESS_UPDATED"
  | "PASSWORD_UPDATED"
  | "PHONE_VERIFIED"
  | "BOOKING_REQUEST_RECEIVED"
  | "BOOKING_REQUEST_SUBMITTED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "BOOKING_PAYMENT_REQUIRED"
  | "BOOKING_PAYMENT_CONFIRMED"
  | "RENTER_PAYMENT_CONFIRMED"
  | "BOOKING_STARTED"
  | "BOOKING_COMPLETED"
  | "BOOKING_CANCELLED"
  | "BOOKING_DISPUTED";

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
  mine: ["notifications", "mine"] as const,
};

export async function getMyNotifications() {
  const response = await apiRequest<NotificationItem[]>("/notifications/me");
  return response.data;
}

export async function markNotificationAsRead(id: string) {
  const response = await apiRequest<NotificationItem>(`/notifications/${id}/read`, {
    method: "PATCH",
  });

  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiRequest<{ count: number }>("/notifications/read-all", {
    method: "PATCH",
  });

  return response.data;
}
