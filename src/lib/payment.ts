import { apiRequest } from "./http";

export type AdminPaymentEvent = {
  id: string;
  eventId: string;
  eventType: string;
  entityId: string | null;
  processedAt: string | null;
  createdAt: string;
  payload: unknown;
  linkedOrderId: string | null;
  linkedPaymentId: string | null;
  linkedTransferId: string | null;
  linkedRefundId: string | null;
  linkedBooking: {
    id: string;
    equipmentTitle: string;
    ownerName: string;
    renterName: string;
  } | null;
  status: "processed" | "unprocessed" | "unmatched";
};

export const paymentQueryKeys = {
  all: ["payments"] as const,
  adminEvents: ["payments", "admin", "events"] as const,
};

export async function getAdminPaymentEvents() {
  const response = await apiRequest<AdminPaymentEvent[]>("/payments/admin/events");
  return response.data;
}
