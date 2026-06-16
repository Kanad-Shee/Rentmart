import { requireGuest } from '@/lib/user';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Authentication',
  description:
    'Authentication Pages to authorize the incoming user and their roles'
};

export default async function AuthLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireGuest();
  return children;
}
