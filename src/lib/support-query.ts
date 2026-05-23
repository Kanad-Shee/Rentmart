import { apiRequest } from './http';
import {
  buildPaginationSearchParams,
  type PaginatedResponse,
  type PaginationInput
} from './pagination';
import { z } from 'zod';

export const supportQueryTopicSchema = z.enum([
  'GENERAL_INQUIRY',
  'LISTING_HELP',
  'RENTAL_HELP',
  'PAYMENT_HELP',
  'ACCOUNT_HELP'
]);

export const createSupportQuerySchema = z.object({
  topic: supportQueryTopicSchema,
  message: z
    .string({ message: 'Message is required.' })
    .trim()
    .min(12, 'Tell us a bit more about your request.')
    .max(2000, 'Message is too long.')
});

export type SupportQueryTopic = z.infer<typeof supportQueryTopicSchema>;
export type CreateSupportQueryInput = z.infer<typeof createSupportQuerySchema>;

export type SupportQueryItem = {
  id: string;
  userId: string;
  topic: SupportQueryTopic;
  fullName: string;
  email: string;
  role: 'OWNER' | 'RENTER';
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminSupportQueriesQueryInput = PaginationInput & {
  search?: string;
  role?: 'ALL' | SupportQueryItem['role'];
  topic?: 'ALL' | SupportQueryItem['topic'];
};

export const supportQueryLabels: Record<SupportQueryTopic, string> = {
  GENERAL_INQUIRY: 'General Inquiry',
  LISTING_HELP: 'Listing Help',
  RENTAL_HELP: 'Rental Help',
  PAYMENT_HELP: 'Payment Help',
  ACCOUNT_HELP: 'Account Help'
};

export const supportQueryKeys = {
  adminAll: ['support-queries', 'admin-all'] as const,
  adminPage: (input: AdminSupportQueriesQueryInput) =>
    [
      'support-queries',
      'admin-all',
      input.page ?? 1,
      input.pageSize ?? 10,
      input.search?.trim() ?? '',
      input.role ?? 'ALL',
      input.topic ?? 'ALL'
    ] as const
};

export async function createSupportQuery(input: CreateSupportQueryInput) {
  const response = await apiRequest<SupportQueryItem>('/support-queries', {
    method: 'POST',
    body: input
  });

  return response.data;
}

export async function getAdminSupportQueriesPage(
  input: AdminSupportQueriesQueryInput = {}
) {
  const searchParams = buildPaginationSearchParams(input);

  if (input.search?.trim()) {
    searchParams.set('search', input.search.trim());
  }

  if (input.role && input.role !== 'ALL') {
    searchParams.set('role', input.role);
  }

  if (input.topic && input.topic !== 'ALL') {
    searchParams.set('topic', input.topic);
  }

  const suffix = searchParams.toString();
  const response = await apiRequest<PaginatedResponse<SupportQueryItem>>(
    `/support-queries${suffix ? `?${suffix}` : ''}`,
    {
      method: 'GET'
    }
  );

  return response.data;
}

export async function getAdminSupportQueries() {
  const response = await getAdminSupportQueriesPage({ page: 1, pageSize: 100 });
  return response.items;
}

export async function resolveSupportQuery(id: string) {
  const response = await apiRequest<{ id: string }>(`/support-queries/${id}`, {
    method: 'DELETE'
  });

  return response.data;
}
