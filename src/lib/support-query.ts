import { apiRequest } from './http';
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

export const supportQueryLabels: Record<SupportQueryTopic, string> = {
  GENERAL_INQUIRY: 'General Inquiry',
  LISTING_HELP: 'Listing Help',
  RENTAL_HELP: 'Rental Help',
  PAYMENT_HELP: 'Payment Help',
  ACCOUNT_HELP: 'Account Help'
};

export const supportQueryKeys = {
  adminAll: ['support-queries', 'admin-all'] as const
};

export async function createSupportQuery(input: CreateSupportQueryInput) {
  const response = await apiRequest<SupportQueryItem>('/support-queries', {
    method: 'POST',
    body: input
  });

  return response.data;
}

export async function getAdminSupportQueries() {
  const response = await apiRequest<SupportQueryItem[]>('/support-queries', {
    method: 'GET'
  });

  return response.data;
}

export async function resolveSupportQuery(id: string) {
  const response = await apiRequest<{ id: string }>(`/support-queries/${id}`, {
    method: 'DELETE'
  });

  return response.data;
}
