import { requireGuest } from '@/lib/user';
import type { ReactNode } from 'react';

export default async function AuthLayout({
  children
}: {
  children: ReactNode;
}) {
  await requireGuest();
  return children;
}
