import { apiRequest } from './http';
import {
  buildPaginationSearchParams,
  type PaginatedResponse,
  type PaginationInput
} from './pagination';

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
  linkedBooking: {
    id: string;
    equipmentTitle: string;
    ownerName: string;
    renterName: string;
  } | null;
  status: 'processed' | 'unprocessed' | 'unmatched';
};

export type AdminPaymentEventsQueryInput = PaginationInput & {
  search?: string;
  eventType?: string;
  status?: 'ALL' | AdminPaymentEvent['status'];
  linkState?: 'ALL' | 'LINKED' | 'UNLINKED';
};

export const paymentQueryKeys = {
  all: ['payments'] as const,
  adminEvents: ['payments', 'admin', 'events'] as const,
  adminEventsPage: (input: AdminPaymentEventsQueryInput) =>
    [
      'payments',
      'admin',
      'events',
      input.page ?? 1,
      input.pageSize ?? 10,
      input.search?.trim() ?? '',
      input.eventType?.trim() ?? '',
      input.status ?? 'ALL',
      input.linkState ?? 'ALL'
    ] as const
};

export async function getAdminPaymentEventsPage(
  input: AdminPaymentEventsQueryInput = {}
) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.search?.trim()) {
    searchParams.set('search', input.search.trim());
  }

  if (input.eventType?.trim()) {
    searchParams.set('eventType', input.eventType.trim());
  }

  if (input.status && input.status !== 'ALL') {
    searchParams.set('status', input.status);
  }

  if (input.linkState && input.linkState !== 'ALL') {
    searchParams.set('linkState', input.linkState);
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<AdminPaymentEvent>>(
    `/payments/admin/events${suffix ? `?${suffix}` : ''}`
  );
  return response.data;
}

export async function getAdminPaymentEvents() {
  const response = await getAdminPaymentEventsPage({ page: 1, pageSize: 100 });
  return response.items;
}
