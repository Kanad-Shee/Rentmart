import { requireGuest } from '@/lib/user';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export default async function AuthLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireGuest();
  return children;
}

